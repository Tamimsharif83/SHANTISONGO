const path = require('path');
const mongoose = require('mongoose');
const XLSX = require('xlsx');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const InvestmentRequest = require('../models/InvestmentRequest');

const EXCEL_FILE_PATH = path.join(__dirname, './Investment (1).xlsx');
const IMPORT_TAG = '[IMPORT_XLSX_INVESTMENT]';

function toPaisa(value) {
  const amount = Number(value) || 0;
  return Math.round(amount * 100);
}

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDateValue(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return new Date(parsed.y, parsed.m - 1, parsed.d || 1);
    }
  }

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date;
  }

  // Handle date strings like 16/2/2026 from sheet cells.
  if (typeof value === 'string') {
    const text = value.trim();
    const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const day = Number(match[1]);
      const month = Number(match[2]);
      const year = Number(match[3]);
      const parsed = new Date(year, month - 1, day);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }

  return new Date();
}

function isValidMemberId(rawValue) {
  return /^\d{9}$/.test(String(rawValue || '').trim());
}

function buildAdminNote(meta) {
  return [
    IMPORT_TAG,
    `closingDate=${meta.closingDate.toISOString().slice(0, 10)}`,
    `totalRecoveryPaisa=${meta.totalRecoveryPaisa}`,
    `outstandingPaisa=${meta.outstandingPaisa}`,
    `totalPayablePaisa=${meta.totalPayablePaisa}`,
    `monthlyInstallmentPaisa=${meta.monthlyInstallmentPaisa}`
  ].join(' | ');
}

async function importInvestments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('DB connected');

    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const sheet = workbook.Sheets['Invest&Recovery'];
    if (!sheet) {
      throw new Error('Sheet "Invest&Recovery" not found in Investment.xlsx');
    }

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    const headerIndex = rows.findIndex(
      row => String(row[0]).trim() === 'Name' && String(row[1]).includes('Customer ID')
    );

    if (headerIndex === -1) {
      throw new Error('Header row not found in Invest&Recovery sheet');
    }

    const dataRows = rows.slice(headerIndex + 1);

    // Remove previously imported investment rows so re-run remains idempotent.
    const deleted = await InvestmentRequest.deleteMany({
      adminNote: { $regex: /^\[IMPORT_XLSX_INVESTMENT\]/ }
    });

    let imported = 0;
    let skippedNoId = 0;
    let skippedNoUser = 0;

    let activeMemberID = '';
    let activeMemberName = '';

    for (const row of dataRows) {
      const rawMemberName = String(row[0] || '').trim();
      const rawMemberID = String(row[1] || '').trim();
      const investmentType = String(row[2] || '').trim();
      const approvalDateRaw = row[3];
      const closingDateRaw = row[4];
      const approvalAmount = parseNumber(row[5]);
      const totalPayable = parseNumber(row[7]);
      const numberOfInstallments = Math.max(1, Math.round(parseNumber(row[8]) || 1));
      const monthlyInstallment = parseNumber(row[11]);
      const totalRecovery = parseNumber(row[27]);
      const outstandingWithProfit = parseNumber(row[29]);
      const hasMoneyData = approvalAmount > 0 || totalPayable > 0 || totalRecovery > 0 || outstandingWithProfit > 0;

      const hasNewValidMember = isValidMemberId(rawMemberID);
      if (hasNewValidMember) {
        activeMemberID = rawMemberID;
        activeMemberName = rawMemberName;
      }

      const memberID = hasNewValidMember ? rawMemberID : activeMemberID;
      const memberName = rawMemberName || activeMemberName;

      if (!isValidMemberId(memberID)) {
        if (hasMoneyData) {
          skippedNoId += 1;
        }
        continue;
      }

      const user = await User.findOne({ memberID });
      if (!user) {
        skippedNoUser += 1;
        continue;
      }

      // Skip empty/invalid money rows even if ID exists.
      if (approvalAmount <= 0) {
        continue;
      }

      const approvalDate = parseDateValue(approvalDateRaw);
      const closingDate = parseDateValue(closingDateRaw || approvalDateRaw);

      const request = new InvestmentRequest({
        userId: user._id,
        memberID,
        memberName: memberName || user.fullName,
        amount: toPaisa(approvalAmount),
        purpose: investmentType || 'Imported Investment',
        duration: numberOfInstallments,
        bankName: 'Imported Bank',
        bankBranch: 'Imported Branch',
        bankAccountNo: memberID,
        bankAccountType: 'Savings',
        guarantor: {
          name: 'Imported Guarantor',
          phone: '00000000000',
          relationship: 'Self'
        },
        status: 'approved',
        adminNote: buildAdminNote({
          closingDate,
          totalRecoveryPaisa: toPaisa(totalRecovery),
          outstandingPaisa: toPaisa(outstandingWithProfit),
          totalPayablePaisa: toPaisa(totalPayable),
          monthlyInstallmentPaisa: toPaisa(monthlyInstallment)
        }),
        reviewedBy: null,
        reviewedAt: approvalDate,
        applicationDate: approvalDate
      });

      await request.save();
      imported += 1;
    }

    console.log('Previous imported rows removed:', deleted.deletedCount);
    console.log('Imported investment rows:', imported);
    console.log('Skipped rows (investment present but no valid member ID):', skippedNoId);
    console.log('Skipped rows (member ID exists but user missing):', skippedNoUser);
  } catch (error) {
    console.error('Investment import failed:', error.message || error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

importInvestments();
