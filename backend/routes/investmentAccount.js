const express = require('express');
const router = express.Router();
const InvestmentAccount = require('../models/InvestmentAccount');
const InvestmentRequest = require('../models/InvestmentRequest');

// Get all approved investment requests (for Investment Report)
router.get('/approved-requests', async (req, res) => {
    try {
        const approvedRequests = await InvestmentRequest.find({ 
            status: 'approved'
        })
        .populate('userId', 'fullName email memberID profilePicture')
        .populate('reviewedBy', 'fullName')
        .sort({ reviewedAt: -1 });

        // Check which requests already have investment accounts
        const requestsWithAccountStatus = await Promise.all(
            approvedRequests.map(async (request) => {
                const existingAccount = await InvestmentAccount.findOne({ 
                    investmentRequestId: request._id 
                });
                
                return {
                    ...request.toObject(),
                    hasInvestmentAccount: !!existingAccount,
                    investmentAccountNumber: existingAccount?.investmentAccountNumber,
                    accountData: existingAccount ? {
                        profitPercentage: existingAccount.profitPercentage,
                        totalProfit: existingAccount.totalProfit,
                        totalAmount: existingAccount.totalAmount,
                        monthlyPayments: existingAccount.monthlyPayments
                    } : null
                };
            })
        );

        res.json(requestsWithAccountStatus);
    } catch (error) {
        console.error('Error fetching approved requests:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create investment account from approved request
router.post('/create-account', async (req, res) => {
    try {
        const { 
            investmentRequestId, 
            profitPercentage, 
            startDate,
            createdBy,
            adminNote,
            customTotalAmount,         // Optional: Admin-modified total amount in paisa
            customMonthlyInstallment   // Optional: Admin-modified monthly installment in paisa
        } = req.body;

        // Validate inputs
        if (!investmentRequestId || !profitPercentage || !startDate || !createdBy) {
            return res.status(400).json({ 
                message: 'Investment request ID, profit percentage, start date, and creator ID are required' 
            });
        }

        // Check if account already exists for this request
        const existingAccount = await InvestmentAccount.findOne({ investmentRequestId });
        if (existingAccount) {
            return res.status(400).json({ 
                message: 'Investment account already exists for this request',
                investmentAccountNumber: existingAccount.investmentAccountNumber
            });
        }

        // Get the investment request
        const investmentRequest = await InvestmentRequest.findById(investmentRequestId)
            .populate('userId', 'fullName memberID');

        if (!investmentRequest) {
            return res.status(404).json({ message: 'Investment request not found' });
        }

        if (investmentRequest.status !== 'approved') {
            return res.status(400).json({ message: 'Investment request must be approved first' });
        }

        // Generate account number and transaction ID
        const accountNumber = await InvestmentAccount.generateAccountNumber();
        const transactionId = await InvestmentAccount.generateTransactionId();

        // Calculate profits first (before creating the document)
        let monthlyProfit, totalProfit, totalAmount;
        
        if (customTotalAmount) {
            // If admin provided custom total amount, use it
            totalAmount = customTotalAmount;
            totalProfit = customTotalAmount - investmentRequest.amount;
            monthlyProfit = Math.round(totalProfit / 12);
        } else {
            // Auto-calculate profits using the same logic as the model method
            const annualProfitPaisa = Math.round((investmentRequest.amount * profitPercentage) / 100);
            monthlyProfit = Math.round(annualProfitPaisa / 12);
            
            const totalProfitWithoutRemainder = monthlyProfit * investmentRequest.duration;
            const remainder = annualProfitPaisa - (monthlyProfit * 12);
            totalProfit = totalProfitWithoutRemainder + Math.min(remainder, investmentRequest.duration);
            
            totalAmount = investmentRequest.amount + totalProfit;
        }

        // Create investment account with all required fields
        const investmentAccount = new InvestmentAccount({
            investmentAccountNumber: accountNumber,
            investmentRequestId: investmentRequest._id,
            userId: investmentRequest.userId._id,
            memberID: investmentRequest.memberID,
            memberName: investmentRequest.memberName,
            transactionId: transactionId,
            amount: investmentRequest.amount,
            duration: investmentRequest.duration,
            profitPercentage: profitPercentage,
            monthlyProfit: monthlyProfit,
            totalProfit: totalProfit,
            totalAmount: totalAmount,
            startDate: new Date(startDate),
            purpose: investmentRequest.purpose,
            bankDetails: {
                bankName: investmentRequest.bankName,
                bankBranch: investmentRequest.bankBranch,
                bankAccountNo: investmentRequest.bankAccountNo,
                bankAccountType: investmentRequest.bankAccountType
            },
            guarantor: investmentRequest.guarantor,
            adminNote: adminNote || '',
            createdBy: createdBy
        });

        // Calculate end date
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + investmentRequest.duration);
        investmentAccount.endDate = endDate;

        // Generate payment schedule with custom monthly installment if provided
        if (customMonthlyInstallment) {
            // Use custom monthly installment for payment schedule
            investmentAccount.generatePaymentScheduleWithCustomInstallment(customMonthlyInstallment);
        } else {
            // Generate standard payment schedule
            investmentAccount.generatePaymentSchedule();
        }

        await investmentAccount.save();

        // Populate the response (don't populate createdBy since it's just a string)
        const populatedAccount = await InvestmentAccount.findById(investmentAccount._id)
            .populate('userId', 'fullName email memberID');

        res.status(201).json({
            message: 'Investment account created successfully',
            account: populatedAccount
        });
    } catch (error) {
        console.error('Error creating investment account:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all investment accounts
router.get('/all', async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const accounts = await InvestmentAccount.find(filter)
            .populate('userId', 'fullName email memberID profilePicture')
            .sort({ createdAt: -1 });

        res.json(accounts);
    } catch (error) {
        console.error('Error fetching investment accounts:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get investment account by ID
router.get('/:id', async (req, res) => {
    try {
        const account = await InvestmentAccount.findById(req.params.id)
            .populate('userId', 'fullName email memberID profilePicture')
            .populate('investmentRequestId');

        if (!account) {
            return res.status(404).json({ message: 'Investment account not found' });
        }

        res.json(account);
    } catch (error) {
        console.error('Error fetching investment account:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get investment accounts by member ID
router.get('/member/:memberId', async (req, res) => {
    try {
        const accounts = await InvestmentAccount.find({ 
            memberID: req.params.memberId 
        })
        .populate('userId', 'fullName email memberID')
        .sort({ createdAt: -1 });

        res.json(accounts);
    } catch (error) {
        console.error('Error fetching member investment accounts:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Calculate profit for a given amount and percentage
router.post('/calculate-profit', (req, res) => {
    try {
        const { amount, profitPercentage, duration } = req.body;

        if (!amount || !profitPercentage || !duration) {
            return res.status(400).json({ 
                message: 'Amount, profit percentage, and duration are required' 
            });
        }

        // All calculations in paisa (integer) - NO FLOATING POINT
        // amount is already in paisa from frontend
        const amountPaisa = amount;  // integer
        
        // Calculate annual profit in paisa
        const annualProfitPaisa = Math.round((amountPaisa * profitPercentage) / 100);
        
        // Calculate monthly profit in paisa (.5+ rounds up, <.5 rounds down)
        const monthlyProfitPaisa = Math.round(annualProfitPaisa / 12);
        
        // Calculate total profit with proper remainder handling
        const totalProfitWithoutRemainder = monthlyProfitPaisa * duration;
        const remainder = annualProfitPaisa - (monthlyProfitPaisa * 12);
        const totalProfitPaisa = totalProfitWithoutRemainder + Math.min(remainder, duration);
        
        // Total amount in paisa
        const totalAmountPaisa = amountPaisa + totalProfitPaisa;

        // Return all amounts in paisa (integers)
        res.json({
            amount: amountPaisa,           // in paisa
            profitPercentage,
            duration,
            monthlyProfit: monthlyProfitPaisa,    // in paisa
            totalProfit: totalProfitPaisa,        // in paisa
            totalAmount: totalAmountPaisa         // in paisa
        });
    } catch (error) {
        console.error('Error calculating profit:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
