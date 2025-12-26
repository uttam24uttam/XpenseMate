import Transaction from "../models/transaction.js";
import { subDays } from 'date-fns';

// POST /api/transactions/add-transaction
export const addTransaction = async (req, res) => {
    try {
        const { userid, userId, ...rest } = req.body;

        const newTransaction = new Transaction({
            ...rest,
            userId: userId || userid
        });

        await newTransaction.save();
        res.status(201).send("Transaction Added Successfully");
    } catch (error) {
        console.error("Error adding transaction:", error);
        res.status(500).json(error);
    }
};

// PUT /api/transactions/edit-transaction
export const editTransaction = async (req, res) => {
    try {
        await Transaction.findOneAndUpdate(
            { _id: req.body.transactionId },
            req.body.payload
        );
        res.send("Transaction Updated Successfully");
    } catch (error) {
        console.error("Error editing transaction:", error);
        res.status(500).json(error);
    }
};

// DELETE /api/transactions/delete-transaction
export const deleteTransaction = async (req, res) => {
    try {
        const id = req.body.transactionId || req.body.id || req.body._id;

        const result = await Transaction.findOneAndDelete({ _id: id });

        if (!result) {

            return res.status(404).send("Transaction not found or invalid ID");
        }

        res.send("Transaction Deleted Successfully");
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json(error);
    }
};

// POST /api/transactions/get-all-transactions
export const getAllTransactions = async (req, res) => {
    try {

        const { userId, userid, frequency, dateRange, type } = req.body;
        const userIdValue = userId || userid;

        let transactions;
        const query = { userId: userIdValue };
        if (type !== 'all') {
            query.type = type;
        }

        if (frequency === '7') {
            query.createdAt = { $gte: subDays(new Date(), 6) };
        } else if (frequency === '30') {
            query.createdAt = { $gte: subDays(new Date(), 29) };
        } else if (frequency === '365') {
            query.createdAt = { $gte: subDays(new Date(), 364) };
        } else if (frequency === 'custom' && dateRange) {
            query.createdAt = {
                $gte: new Date(dateRange.startDate),
                $lte: new Date(dateRange.endDate)
            };
        }

        transactions = await Transaction.find(query);
        res.send(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json(error);
    }
};