import FriendTransaction from "../models/friendTransaction.js";
import FriendBalance from "../models/FriendBalance.js";
import User from "../models/user.js";
import Transaction from "../models/transaction.js";
import moment from "moment";
import { cacheUtils } from '../config/redis.js';

// update friend balance
const updateFriendBalance = async (fromUser, toUser, amount, session = null) => {
    const [u1, u2] = [fromUser, toUser].sort();
    const isOriginalOrder = u1 === fromUser;

    let record = await FriendBalance.findOne({ user1: u1, user2: u2 }).session(session);

    if (!record) {
        const initialBalance = isOriginalOrder ? amount : -amount;
        record = new FriendBalance({ user1: u1, user2: u2, balance: initialBalance, status: 'active' });
    } else {
        if (isOriginalOrder) {
            record.balance += amount;
        } else {
            record.balance -= amount;
        }
    }

    await record.save({ session });
    //redis cache invalidation
    await cacheUtils.invalidateBalance(fromUser, toUser);
};

// POST /api/friendTransactions/add
export const addFriendTransaction = async (req, res) => {
    let session = null;
    try {
        const { paidBy, payees, totalAmount, description, date, category } = req.body;


        if (!paidBy || !Array.isArray(paidBy) || paidBy.length === 0) return res.status(400).json({ message: "paidBy must be a non-empty array" });
        if (!payees || !Array.isArray(payees) || payees.length === 0) return res.status(400).json({ message: "payees must be a non-empty array" });
        if (!totalAmount || totalAmount <= 0) return res.status(400).json({ message: "totalAmount must be positive" });
        if (!description || description.trim().length === 0) return res.status(400).json({ message: "description is required" });

        const totalPaid = paidBy.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        if (Math.abs(totalPaid - totalAmount) > 0.01) return res.status(400).json({ message: `Total paid (${totalPaid}) must equal totalAmount (${totalAmount})` });

        const totalOwed = payees.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        if (Math.abs(totalOwed - totalAmount) > 0.01) return res.status(400).json({ message: `Total owed (${totalOwed}) must equal totalAmount (${totalAmount})` });

        const transactionNumber = "TXN" + Date.now();
        const newTxn = new FriendTransaction({
            paidBy, payees, totalAmount, description,
            date: date || new Date(),
            category: category || "Uncategorized",
            transactionNumber
        });

        const paidMap = {}, owedMap = {};
        for (const { user, amount } of paidBy) paidMap[user.toString()] = (paidMap[user.toString()] || 0) + amount;
        for (const { user, amount } of payees) owedMap[user.toString()] = (owedMap[user.toString()] || 0) + amount;

        const netBalances = {};
        const allUsers = new Set([...Object.keys(paidMap), ...Object.keys(owedMap)]);
        for (const uid of allUsers) netBalances[uid] = (paidMap[uid] || 0) - (owedMap[uid] || 0);

        const creditors = [], debtors = [], settlements = [];
        for (const [uid, bal] of Object.entries(netBalances)) {
            if (bal > 0) creditors.push({ uid, balance: bal });
            else if (bal < 0) debtors.push({ uid, balance: bal });
        }
        creditors.sort((a, b) => b.balance - a.balance);
        debtors.sort((a, b) => a.balance - b.balance);

        session = await FriendTransaction.db.startSession();
        try {
            session.startTransaction();
            while (creditors.length > 0 && debtors.length > 0) {
                const creditor = creditors[0];
                const debtor = debtors[0];
                const amount = Math.min(creditor.balance, Math.abs(debtor.balance));
                await updateFriendBalance(debtor.uid, creditor.uid, amount, session);
                settlements.push({ from: debtor.uid, to: creditor.uid, amount });
                creditor.balance -= amount;
                debtor.balance += amount;
                if (creditor.balance === 0) creditors.shift();
                if (debtor.balance === 0) debtors.shift();
            }
            newTxn.settlements = settlements;
            await newTxn.save({ session });
            await session.commitTransaction();
            session.endSession();
            res.status(201).json({ message: "Transaction added successfully", transaction: newTxn });
        } catch (txnError) {

            await session.abortTransaction();
            session.endSession();
            if (txnError && (txnError.code === 20 || txnError.message?.includes('Transaction numbers'))) {
                const fallbackSettlements = [];
                while (creditors.length > 0 && debtors.length > 0) {
                    const creditor = creditors[0];
                    const debtor = debtors[0];
                    const amount = Math.min(creditor.balance, Math.abs(debtor.balance));
                    await updateFriendBalance(debtor.uid, creditor.uid, amount);
                    fallbackSettlements.push({ from: debtor.uid, to: creditor.uid, amount });
                    creditor.balance -= amount;
                    debtor.balance += amount;
                    if (creditor.balance === 0) creditors.shift();
                    if (debtor.balance === 0) debtors.shift();
                }
                newTxn.settlements = fallbackSettlements;
                await newTxn.save();
                res.status(201).json({ message: "Transaction added successfully (non-transactional)", transaction: newTxn });
            } else {
                throw txnError;
            }
        }
    } catch (error) {
        if (session && session.inTransaction()) { await session.abortTransaction(); session.endSession(); }
        res.status(500).json({ message: "Error adding transaction", error: error.message });
    }
};

// GET /api/friendTransactions/transactions/:userId/:friendId
export const getTransactions = async (req, res) => {
    const { userId, friendId } = req.params;
    try {
        const allTransactions = await FriendTransaction.find({
            $or: [
                { "paidBy.user": { $all: [userId, friendId] } },
                { "payees.user": { $all: [userId, friendId] } },
                { "settlements.from": { $in: [userId, friendId] }, "settlements.to": { $in: [userId, friendId] } }
            ]
        }).populate("settlements.from", "name").populate("settlements.to", "name").lean();

        const formattedTransactions = allTransactions.map((txn) => {
            const getId = (val) => (val?._id ? val._id.toString() : val?.toString());
            const getName = (val) => (typeof val === 'object' ? val?.name : "Unknown");

            if (txn.category === 'Settlement') {
                const s = txn.settlements?.[0];
                const isPayer = getId(s?.from) === userId;
                const otherName = getName(isPayer ? s?.to : s?.from);
                return {
                    ...txn,
                    description: isPayer ? `You settled with ${otherName}` : `${otherName} settled with you`,
                    balanceMessage: isPayer ? `Paid` : `Received`,
                    amount: s?.amount || 0,
                    formattedDate: moment(txn.date).format("DD-MM-YYYY"),
                    formattedTime: moment(txn.date).format("HH:mm"),
                };
            }

            const pair = txn.settlements.find(s => {
                const f = getId(s.from);
                const t = getId(s.to);
                return (f === userId && t === friendId) || (f === friendId && t === userId);
            });

            if (!pair) return null;
            const isLender = getId(pair.to) === userId;
            return {
                ...txn,
                formattedDate: moment(txn.date).format("DD-MM-YYYY"),
                formattedTime: moment(txn.date).format("HH:mm"),
                balanceMessage: isLender ? `You lent` : `You borrowed`,
                amount: pair.amount || 0
            };
        }).filter(Boolean);

        res.status(200).json({ transactions: formattedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)) });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch transactions" });
    }
};

// GET /api/friendTransactions/balance/:userId/:friendId
export const getBalance = async (req, res) => {
    const { friendId } = req.params;
    if (!req.user || !req.user.id) return res.status(401).json({ message: "Not authorized" });
    const loggedInUserId = req.user.id;

    try {
        //redis cache check
        let balance = await cacheUtils.getRawBalance(loggedInUserId, friendId);
        let user1, user2;

        if (balance === null) {
            const record = await FriendBalance.findOne({
                $or: [
                    { user1: loggedInUserId, user2: friendId },
                    { user1: friendId, user2: loggedInUserId }
                ]
            });

            if (!record) {
                const result = { balanceMessage: "Everything is settled.", balanceValue: 0, payerIsUser: false };
                await cacheUtils.setRawBalance(loggedInUserId, friendId, 0);
                return res.status(200).json(result);
            }

            balance = record.balance;
            user1 = record.user1.toString();
            user2 = record.user2.toString();
            await cacheUtils.setRawBalance(user1, user2, balance);
        } else {
            [user1, user2] = [loggedInUserId, friendId].sort();
        }

        const friend = await User.findById(friendId).select("name");
        const absBalance = Math.abs(balance);
        let balanceMessage = "";
        let payerIsUser = false;

        const loggedUserIsUser1 = user1 === loggedInUserId;

        if (loggedUserIsUser1) {
            if (balance > 0) { balanceMessage = `${friend?.name || 'Friend'} owes you ₹${absBalance}`; payerIsUser = false; }
            else if (balance < 0) { balanceMessage = `You owe ${friend?.name || 'Friend'} ₹${absBalance}`; payerIsUser = true; }
            else { balanceMessage = `Everything is settled with ${friend?.name || 'Friend'}`; }
        } else {
            if (balance > 0) { balanceMessage = `You owe ${friend?.name || 'Friend'} ₹${absBalance}`; payerIsUser = true; }
            else if (balance < 0) { balanceMessage = `${friend?.name || 'Friend'} owes you ₹${absBalance}`; payerIsUser = false; }
            else { balanceMessage = `Everything is settled with ${friend?.name || 'Friend'}`; }
        }

        return res.status(200).json({ balanceMessage, balanceValue: absBalance, payerIsUser });
    } catch (error) {
        return res.status(500).json({ message: "Balance check failed" });
    }
};

// POST /api/friendTransactions/settle-up
export const settleUp = async (req, res) => {
    const { userId, friendId, settleAmount } = req.body;
    const amount = Number(settleAmount);

    try {

        const internalSecretHeader = req.headers['x-internal-secret'];
        if (internalSecretHeader && process.env.INTERNAL_SECRET && internalSecretHeader !== process.env.INTERNAL_SECRET) {
            return res.status(403).json({ message: 'Invalid internal secret' });
        }

        const record = await FriendBalance.findOne({
            $or: [{ user1: userId, user2: friendId }, { user1: friendId, user2: userId }]
        });

        if (!record) return res.status(400).json({ message: "No balance to settle." });

        const { user1, user2, balance } = record;
        let payerIsCurrentUser = (user1.toString() === userId && balance < 0) || (user2.toString() === userId && balance > 0);
        let amountOwed = Math.abs(balance);

        if (!payerIsCurrentUser) return res.status(400).json({ message: "You don't owe anything to this friend." });
        if (amount > amountOwed) return res.status(400).json({ message: `You can't settle more than you owe. You owe ₹${amountOwed}.` });

        // Logic for applying settlement
        const applySettlement = async (rec, sess = null) => {
            if (rec.user1.toString() === userId && rec.balance < 0) rec.balance += amount;
            else if (rec.user2.toString() === userId && rec.balance > 0) rec.balance -= amount;
            await rec.save({ session: sess });

            const newTxn = new FriendTransaction({
                description: "Settlement",
                category: "Settlement",
                totalAmount: amount,
                transactionNumber: "SETTLE-" + Date.now(),
                paidBy: [{ user: userId, amount: amount }],
                payees: [{ user: friendId, amount: amount }],
                settlements: [{ from: userId, to: friendId, amount: amount }]
            });
            await newTxn.save({ session: sess });
        };


        let session = await FriendTransaction.db.startSession();
        try {
            session.startTransaction();
            await applySettlement(record, session);
            await session.commitTransaction();
            session.endSession();
            await cacheUtils.invalidateBalance(userId, friendId);
            return res.status(200).json({ message: "Settlement successful." });
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            // Fallback for standalone
            if (err && (err.code === 20 || err.message?.includes('Transaction numbers'))) {
                const freshRecord = await FriendBalance.findOne({ $or: [{ user1: userId, user2: friendId }, { user1: friendId, user2: userId }] });
                await applySettlement(freshRecord);
                await cacheUtils.invalidateBalance(userId, friendId);
                return res.status(200).json({ message: "Settlement successful (non-transactional)." });
            }
            throw err;
        }
    } catch (err) {
        res.status(500).json({ message: "Settlement failed." });
    }
};

// POST /api/friendTransactions/add-personal-tracking-transaction
export const addPersonalTrackingTransaction = async (req, res) => {
    try {
        const transactionData = { ...req.body, userId: req.body.userId || req.body.userid };
        const newTransaction = new Transaction(transactionData);
        await newTransaction.save();
        res.status(201).send("Transaction added successfully");
    } catch (err) {
        res.status(500).json({ message: "Failed to add transaction", error: err.message });
    }
};