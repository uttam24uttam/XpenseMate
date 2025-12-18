import express from "express";
import FriendTransaction from "../models/friendTransaction.js";
import FriendBalance from "../models/FriendBalance.js";
import User from "../models/user.js";
// The Settlement model is no longer needed for new transactions.
// import Settlement from "../models/Settlement.js"; 
import Transaction from "../models/transaction.js";
import moment from "moment";

const router = express.Router();

/* ------------------------------------------
 Update or Create Friend Balance Record (No Changes)
------------------------------------------- */
const updateFriendBalance = async (fromUser, toUser, amount) => {
    //from owes to
    //in friendBalance, user1 is owed by user2
    let record = await FriendBalance.findOne({ user1: toUser, user2: fromUser });

    if (record) {
        record.balance += amount;
    } else {
        // Check reverse
        let reverse = await FriendBalance.findOne({ user1: fromUser, user2: toUser });
        if (reverse) {
            reverse.balance -= amount;
            if (reverse.balance === 0) await reverse.deleteOne();
            else await reverse.save();
            return;
        }

        // Create new record (fromUser owes toUser)
        // user2 owes user1. so from=user2, to=user1
        record = new FriendBalance({ user1: toUser, user2: fromUser, balance: amount });
    }

    await record.save();
};


/* ------------------------------------------
Add Friend Transaction (No Changes)
------------------------------------------- */
router.post("/add", async (req, res) => {
    try {
        const {
            paidBy,    // [{ user, amount }]
            payees,    // [{ user, amount }]
            totalAmount,
            description,
            date,
            category
        } = req.body;

        const transactionNumber = "TXN" + Date.now();

        const newTxn = new FriendTransaction({
            paidBy,
            payees,
            totalAmount,
            description,
            date: date || new Date(),
            category: category || "Uncategorized",
            transactionNumber
        });

        //  Step 1: Map paid and owed for each user
        const paidMap = {}, owedMap = {};
        for (const { user, amount } of paidBy) {
            paidMap[user.toString()] = (paidMap[user.toString()] || 0) + amount;
        }
        for (const { user, amount } of payees) {
            owedMap[user.toString()] = (owedMap[user.toString()] || 0) + amount;
        }

        //  Step 2: Build final balances per user
        const netBalances = {};
        const allUsers = new Set([...Object.keys(paidMap), ...Object.keys(owedMap)]);
        for (const uid of allUsers) {
            const paid = paidMap[uid] || 0;
            const owed = owedMap[uid] || 0;
            netBalances[uid] = paid - owed;
        }

        //  Step 3: Settle creditors and debtors
        const creditors = [], debtors = [], settlements = [];
        for (const [uid, bal] of Object.entries(netBalances)) {
            if (bal > 0) creditors.push({ uid, balance: bal });
            else if (bal < 0) debtors.push({ uid, balance: bal });
        }

        creditors.sort((a, b) => b.balance - a.balance);
        debtors.sort((a, b) => a.balance - b.balance);

        while (creditors.length > 0 && debtors.length > 0) {
            const creditor = creditors[0];
            const debtor = debtors[0];
            const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

            await updateFriendBalance(debtor.uid, creditor.uid, amount);

            settlements.push({
                from: debtor.uid,
                to: creditor.uid,
                amount
            });

            creditor.balance -= amount;
            debtor.balance += amount;

            if (creditor.balance === 0) creditors.shift();
            if (debtor.balance === 0) debtors.shift();
        }

        newTxn.settlements = settlements;
        await newTxn.save();

        res.status(201).json({ message: "Transaction added successfully", transaction: newTxn });
    } catch (error) {
        console.error("Error in adding transaction:", error);
        res.status(500).json({ message: "Error adding transaction" });
    }
});

/* ------------------------------------------
  View All Transactions Between Two Users (Refactored)
 ------------------------------------------- */
router.get("/transactions/:userId/:friendId", async (req, res) => {
    const { userId, friendId } = req.params;

    try {
        // This single query now fetches BOTH expenses and settlements involving the two users.
        const allTransactions = await FriendTransaction.find({
            $or: [
                { "paidBy.user": { $all: [userId, friendId] } },
                { "payees.user": { $all: [userId, friendId] } },
                { "settlements.from": { $in: [userId, friendId] }, "settlements.to": { $in: [userId, friendId] } }
            ]
        }).populate("settlements.from", "name").populate("settlements.to", "name").lean();

        const formattedTransactions = allTransactions.map((txn) => {
            // Helper to get a display name from populated object or id
            const getName = (val) => {
                if (!val) return "Unknown";
                if (typeof val === 'object' && val.name) return val.name;
                try { return (val && val.toString) ? val.toString() : String(val); } catch { return "Unknown"; }
            };

            // Handle settlement transactions
            if (txn.category === 'Settlement') {
                const settlementInfo = txn.settlements && txn.settlements[0];
                const fromName = getName(settlementInfo?.from);
                const toName = getName(settlementInfo?.to);
                return {
                    ...txn,
                    description: `${fromName} settled with ${toName}`,
                    balanceMessage: `Paid`,
                    amount: settlementInfo?.amount || 0,
                    formattedDate: moment(txn.date).format("DD-MM-YYYY"),
                    formattedTime: moment(txn.date).format("HH:mm"),
                };
            }

            //Handle regular expense transactions
            // Helper to extract string id from possibly populated doc or raw id
            const getId = (val) => {
                if (!val) return null;
                if (val._id) return val._id.toString();
                return val.toString();
            };

            const pair = txn.settlements.find(s => {
                const fromId = getId(s.from);
                const toId = getId(s.to);
                if (!fromId || !toId) return false;
                return (fromId === userId && toId === friendId) || (fromId === friendId && toId === userId);
            });

            if (!pair) return null; // This transaction doesn't involve a direct debt between these two

            const isLender = getId(pair.to) === userId;
            const amount = pair.amount || 0;
            const balanceMessage = isLender ? `You lent` : `You borrowed`;

            return {
                ...txn,
                formattedDate: moment(txn.date).format("DD-MM-YYYY"),
                formattedTime: moment(txn.date).format("HH:mm"),
                balanceMessage,
                amount
            };
        }).filter(Boolean); // Remove any null entries

        // Sort all records by date
        const sortedRecords = formattedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({ transactions: sortedRecords });
    } catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ message: "Failed to fetch transactions" });
    }
});

/* ------------------------------------------
Get Balance Between 2 Users (No Changes)
------------------------------------------- */
router.get("/balance/:userId/:friendId", async (req, res) => {
    const { userId, friendId } = req.params;

    try {
        const record = await FriendBalance.findOne({
            $or: [
                { user1: userId, user2: friendId },
                { user1: friendId, user2: userId }
            ]
        });

        if (!record) {
            return res.status(200).json({ balanceMessage: `Everything is settled with this friend.` });
        }

        const { user1, user2, balance } = record;
        const friend = await User.findById(friendId);

        if (!friend) {
            return res.status(404).json({ message: "Friend not found." });
        }

        let message = "";

        if (user1.toString() === userId) {
            message = `${friend.name} owes you ₹${balance}`;
        } else if (user2.toString() === userId) {
            message = `You owe ${friend.name} ₹${balance}`;
        }

        if (balance === 0) {
            message = `Everything is settled with ${friend.name}`;
        }

        res.status(200).json({ balanceMessage: message });
    } catch (error) {
        console.error("Balance error:", error);
        res.status(500).json({ message: "Balance check failed" });
    }
});

/* ------------------------------------------
 Settle Up (Refactored)
------------------------------------------- */
router.post("/settle-up", async (req, res) => {
    const { userId, friendId, settleAmount } = req.body;
    const amount = Number(settleAmount);

    try {
        const record = await FriendBalance.findOne({
            $or: [
                { user1: userId, user2: friendId },
                { user1: friendId, user2: userId }
            ]
        });

        if (!record) {
            return res.status(400).json({ message: "No balance to settle." });
        }

        const { user1, user2, balance } = record;

        // Check if the user trying to settle is the one who owes money
        // In our schema, user2 owes user1. So, the payer (userId) must be user2.
        if (user2.toString() !== userId) {
            return res.status(400).json({ message: "You don't owe anything to this friend." });
        }

        if (amount > balance) {
            return res.status(400).json({ message: "You can't settle more than you owe." });
        }

        // 1. Update the overall balance
        record.balance -= amount;
        await record.save();

        // 2. Create a FriendTransaction to log this settlement event
        await FriendTransaction.create({
            description: "Settlement",
            category: "Settlement",
            totalAmount: amount,
            transactionNumber: "SETTLE-" + Date.now(),
            paidBy: [{ user: userId, amount: amount }],
            payees: [{ user: friendId, amount: amount }],
            settlements: [{ from: userId, to: friendId, amount: amount }]
        });

        return res.status(200).json({ message: "Settlement successful." });

    } catch (err) {
        console.error("Settlement error:", err);
        res.status(500).json({ message: "Settlement failed." });
    }
});

/* ------------------------------------------
💼 Personal Tracking (No Changes)
------------------------------------------- */
router.post("/add-personal-tracking-transaction", async (req, res) => {
    try {
        const newTransaction = new Transaction(req.body);
        await newTransaction.save();
        res.status(201).send("Transaction added successfully");
    } catch (err) {
        res.status(500).json(err);
    }
});

export default router;



// Model.find({ age: { $gte: 18 } })
// Model.findOne({ email: "alice@gmail.com" })
// Model.findById("64f123abc456def7890")
// Model.findByIdAndUpdate("64f123abc456def7890", { name: "Bob" }, { new: true })
// Model.findOneAndDelete({ email: "bob@gmail.com" })
// const user = new User({ name: "Alice", email: "alice@gmail.com" })
// user.save()

// User.create({ name: "Bob", email: "bob@gmail.com" })
// User.insertMany([{ name: "Charlie" }, { name: "David" }])

// User.updateOne({ email: "alice@gmail.com" }, { $set: { age: 25 } })
// User.updateMany({ status: "pending" }, { $inc: { counter: 1 } })

// User.deleteOne({ email: "charlie@gmail.com" })
// User.deleteMany({ status: "inactive" })

// $eq       → { age: { $eq: 30 } }
// $ne       → { status: { $ne: "active" } }
// $in       → { role: { $in: ["admin", "manager"] } }
// $nin      → { type: { $nin: ["guest"] } }
// $or       → { $or: [{ age: { $lt: 18 } }, { age: { $gt: 60 } }] }
// $and      → { $and: [{ status: "active" }, { role: "admin" }] }
// $all      → { tags: { $all: ["nodejs", "mongodb"] } }
// $elemMatch → { scores: { $elemMatch: { score: { $gte: 90 }, subject: "Math" } } }
// $exists   → { email: { $exists: true } }
// $regex    → { name: { $regex: /^A/i } }


