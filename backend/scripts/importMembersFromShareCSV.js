const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const MonthlyShare = require('../models/MonthlyShare');

const CSV_FILE_PATH = path.join(__dirname, '../../frontend/js/Share collection.csv');
const MONTH_NAME_TO_INDEX = {
  Jan: 0,
  Feb: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11
};

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += ch;
  }

  values.push(current);
  return values;
}

function parseAmount(rawValue) {
  const normalized = String(rawValue || '')
    .replace(/,/g, '')
    .replace(/[^0-9.-]/g, '');

  if (!normalized || normalized === '-') return 0;
  const num = Number.parseFloat(normalized);
  return Number.isFinite(num) ? num : 0;
}

function normalizeMonthLabel(rawLabel) {
  const compact = String(rawLabel || '').replace(/\s+/g, '');
  const match = compact.match(/^(May|June|July|August|Sep|Oct|Nov|Dec|Jan|Feb|March|April)'(\d{2})$/i);
  if (!match) return null;

  const monthName = match[1];
  const shortYear = match[2];
  return {
    monthName,
    shortYear,
    label: `${monthName}'${shortYear}`
  };
}

function getMonthDate(labelInfo) {
  const year = 2000 + Number.parseInt(labelInfo.shortYear, 10);
  const monthIndex = MONTH_NAME_TO_INDEX[labelInfo.monthName];
  // Use UTC to prevent timezone offset from shifting the date (e.g. April 1 local → March 31 UTC)
  return new Date(Date.UTC(year, monthIndex, 1));
}

function isValidMemberId(value) {
  return /^\d{9}$/.test(String(value || '').trim());
}

async function importMembersAndShares() {
  try {
    if (!fs.existsSync(CSV_FILE_PATH)) {
      throw new Error(`CSV file not found: ${CSV_FILE_PATH}`);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('DB connected');

    const csvText = fs.readFileSync(CSV_FILE_PATH, 'utf8');
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);

    const headerIndex = lines.findIndex(
      line => line.includes('Member ID') && line.includes("May'") && line.includes('Total Indivdual Savings')
    );

    if (headerIndex === -1) {
      throw new Error('Could not find CSV header row with monthly columns');
    }

    const headers = parseCsvLine(lines[headerIndex]).map(item => item.trim());
    const monthColumns = headers
      .map((header, index) => {
        const monthInfo = normalizeMonthLabel(header);
        if (!monthInfo) return null;
        return { index, monthInfo };
      })
      .filter(Boolean);

    if (monthColumns.length === 0) {
      throw new Error('No month columns found in CSV');
    }

    const dataRows = lines.slice(headerIndex + 1).map(parseCsvLine);

    let usersUpserted = 0;
    let shareEntriesInserted = 0;

    for (const row of dataRows) {
      const memberName = String(row[0] || '').trim();
      const memberId = String(row[1] || '').trim();

      if (!isValidMemberId(memberId)) {
        continue;
      }

      const totalShares = parseAmount(row[2]);
      const safeName = memberName || `Member ${memberId}`;

      const existingUser = await User.findOne({ memberID: memberId });
      const hashedPassword = await bcrypt.hash(memberId, 10);

      const emailToUse = (existingUser && existingUser.email)
        ? existingUser.email
        : `${memberId}@shantisongho.local`;

      await User.findOneAndUpdate(
        { memberID: memberId },
        {
          username: memberId,
          email: emailToUse,
          fullName: safeName,
          memberID: memberId,
          password: hashedPassword,
          role: 'member',
          firstLogin: true,
          numberOfShares: totalShares
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      usersUpserted += 1;

      const monthlyEntries = [];
      for (const col of monthColumns) {
        const amount = parseAmount(row[col.index]);
        if (amount <= 0) continue;

        const monthDate = getMonthDate(col.monthInfo);
        monthlyEntries.push({
          memberName: safeName,
          memberId,
          amount,
          month: col.monthInfo.label,
          date: monthDate,
          status: 'Authorized',
          entryBy: 'System Import',
          authorizedBy: 'System Import',
          authorizedAt: new Date()
        });
      }

      await MonthlyShare.deleteMany({ memberId });
      if (monthlyEntries.length > 0) {
        await MonthlyShare.insertMany(monthlyEntries);
        shareEntriesInserted += monthlyEntries.length;
      }
    }

    console.log('Import complete');
    console.log('Members upserted:', usersUpserted);
    console.log('Monthly share entries inserted:', shareEntriesInserted);
    console.log('Default login for each member: memberID / memberID');
  } catch (error) {
    console.error('Import failed:', error.message || error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

importMembersAndShares();