import Transaction from "../models/transaction.js";
import { subDays } from 'date-fns';

// POST /api/transactions/add-transaction
export const addTransaction = async (req, res) => {
    try {
        console.log(" HAS BEEEEEEEN CALLED clear")
        console.log(`called TRACKING ${req.body}`);
        const newTransaction = new Transaction(req.body);
        await newTransaction.save();
        res.send("Transaction Added Successfully");
    } catch (error) {
        res.status(500).json(error);
    }
};

// POST /api/transactions/edit-transaction
export const editTransaction = async (req, res) => {
    try {
        await Transaction.findOneAndUpdate({ _id: req.body.transactionID }, req.body.payload)
        res.send("Transaction Updated Successfully");
    } catch (error) {
        res.status(500).json(error);
    }
};

// POST /api/transactions/delete-transaction
export const deleteTransaction = async (req, res) => {
    try {
        await Transaction.findOneAndDelete({ _id: req.body.transactionId })
        res.send("Transaction Deleted Successfully");
    } catch (error) {
        res.status(500).json(error);
    }
};

// POST /api/transactions/get-all-transactions
export const getAllTransactions = async (req, res) => {
    try {
        const { userid, frequency, dateRange, type } = req.body;
        const userIdValue = userid;
        let transactions;

        if (frequency === '1') {
            transactions = await Transaction.find({
                userId: userIdValue,
                ...(type !== 'all' && { type })
            });
        } else if (frequency === '7') {
            const startDate = subDays(new Date(), 6);
            transactions = await Transaction.find({
                userId: userIdValue,
                createdAt: { $gte: startDate },
                ...(type !== 'all' && { type })
            });
        } else if (frequency === '30') {
            const startDate = subDays(new Date(), 29);
            transactions = await Transaction.find({
                userId: userIdValue,
                createdAt: { $gte: startDate },
                ...(type !== 'all' && { type })
            });
        } else if (frequency === '365') {
            const startDate = subDays(new Date(), 364);
            transactions = await Transaction.find({
                userId: userIdValue,
                createdAt: { $gte: startDate },
                ...(type !== 'all' && { type })
            });
        } else if (frequency === 'custom' && dateRange) {
            const { startDate, endDate } = dateRange;
            transactions = await Transaction.find({
                userId: userIdValue,
                createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
                ...(type !== 'all' && { type })
            });
        } else {
            transactions = await Transaction.find({
                userId: userIdValue,
                ...(type !== 'all' && { type })
            });
        }

        res.send(transactions);
    } catch (error) {
        res.status(500).json(error);
    }
};
