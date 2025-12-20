import express from "express";
import Transaction from "../models/transaction.js";
import { subDays } from 'date-fns';

const router = express.Router();

router.post('/add-transaction', async function (req, res) {
    try {
        console.log(" HAS BEEEEEEEN CALLED clear")
        console.log(`called TRACKING ${req.body}`);
        const newTransaction = new Transaction(req.body);
        await newTransaction.save();
        res.send("Transaction Added Successfully");
    } catch (error) {
        res.status(500).json(error);
    }
});


router.post('/edit-transaction', async function (req, res) {
    try {

        await Transaction.findOneAndUpdate({ _id: req.body.transactionID }, req.body.payload)
        res.send("Transaction Updated Successfully");
    } catch (error) {
        res.status(500).json(error);
    }
});

router.post('/delete-transaction', async function (req, res) {
    try {

        await Transaction.findOneAndDelete({ _id: req.body.transactionId })
        res.send("Transaction Deleted Successfully");
    } catch (error) {
        res.status(500).json(error);
    }
});


router.post('/get-all-transactions', async (req, res) => {
    try {
        const { userid, frequency, dateRange, type } = req.body;
        // Support both userid (old) and userId (new) for backward compatibility
        const userIdValue = userid;
        let transactions;

        if (frequency === '1') {
            transactions = await Transaction.find({
                userId: userIdValue,
                status: 'active',
                ...(type !== 'all' ? { type } : {})
            });
        } else {
            transactions = await Transaction.find({
                userId: userIdValue,
                status: 'active',
                ...(frequency !== "custom" ?
                    { date: { $gte: subDays(new Date(), Number(frequency)) } } :
                    { date: { $gte: dateRange[0], $lte: dateRange[1] } }
                ),
                ...(type !== 'all' ? { type } : {})
            });
        }

        res.send(transactions);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});

export default router;

// JS Objects

// A real data structure in JavaScript, stored in memory.
// Keys can be unquoted if they are valid identifiers.
// Can contain methods (functions), undefined, symbols, etc.

// Example:

// const obj = {
//   name: "Alice",
//   age: 25,
//   isAdmin: true,
//   greet: function() { console.log("Hi"); }
// };
// console.log(typeof obj); // "object"

// JSON (JavaScript Object Notation)
// Just a string format used to store/transfer data.
// Keys must be quoted (double quotes).
// Values can only be: string, number, boolean, null, array, object.
// Cannot contain functions, undefined, or symbols.

// Example:

// const jsonStr = '{"name":"Alice","age":25,"isAdmin":true}';
// console.log(typeof jsonStr); // "string"