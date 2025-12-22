import FriendTransaction from "../models/friendTransaction.js";
import FriendBalance from "../models/FriendBalance.js";
import User from "../models/user.js";
import Transaction from "../models/transaction.js";
import moment from "moment";
import { cacheUtils } from '../config/redis.js';

//update friend balance
const updateFriendBalance = async (fromUser, toUser, amount, session = null) => {
    let record = await FriendBalance.findOne({ user1: toUser, user2: fromUser }).session(session);

    if (record) {
        record.balance += amount;
    } else {
        let reverse = await FriendBalance.findOne({ user1: fromUser, user2: toUser }).session(session);
        if (reverse) {
            reverse.balance -= amount;
            await reverse.save({ session });
            await cacheUtils.invalidateBalance(fromUser, toUser);
            return;
        }

        record = new FriendBalance({ user1: toUser, user2: fromUser, balance: amount, status: 'active' });
    }

    await record.save({ session });
    await cacheUtils.invalidateBalance(fromUser, toUser);
};

// POST /api/friendTransactions/add
export const addFriendTransaction = async (req, res) => {
    let session = null;
    try {
        const {
            paidBy,
            payees,
            totalAmount,
            description,
            date,
            category
        } = req.body;

        if (!paidBy || !Array.isArray(paidBy) || paidBy.length === 0) {
            return res.status(400).json({ message: "paidBy must be a non-empty array" });
        }
        if (!payees || !Array.isArray(payees) || payees.length === 0) {
            return res.status(400).json({ message: "payees must be a non-empty array" });
        }
        if (!totalAmount || totalAmount <= 0) {
            return res.status(400).json({ message: "totalAmount must be positive" });
        }
        if (!description || description.trim().length === 0) {
            return res.status(400).json({ message: "description is required" });
        }

        for (const p of paidBy) {
            if (!p.user || !p.amount || p.amount <= 0) {
                return res.status(400).json({ message: "Invalid paidBy entry: user and positive amount required" });
            }
        }
        for (const p of payees) {
            if (!p.user || !p.amount || p.amount <= 0) {
                return res.status(400).json({ message: "Invalid payees entry: user and positive amount required" });
            }
        }

        const totalPaid = paidBy.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        if (Math.abs(totalPaid - totalAmount) > 0.01) {
            return res.status(400).json({
                message: `Total paid (${totalPaid}) must equal totalAmount (${totalAmount})`
            });
        }

        const totalOwed = payees.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        if (Math.abs(totalOwed - totalAmount) > 0.01) {
            return res.status(400).json({
                message: `Total owed (${totalOwed}) must equal totalAmount (${totalAmount})`
            });
        }

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

        const paidMap = {}, owedMap = {};
        for (const { user, amount } of paidBy) {
            paidMap[user.toString()] = (paidMap[user.toString()] || 0) + amount;
        }
        for (const { user, amount } of payees) {
            owedMap[user.toString()] = (owedMap[user.toString()] || 0) + amount;
        }

        const netBalances = {};
        const allUsers = new Set([...Object.keys(paidMap), ...Object.keys(owedMap)]);
        for (const uid of allUsers) {
            const paid = paidMap[uid] || 0;
            const owed = owedMap[uid] || 0;
            netBalances[uid] = paid - owed;
        }

        const creditors = [], debtors = [], settlements = [];
        for (const [uid, bal] of Object.entries(netBalances)) {
            if (bal > 0) creditors.push({ uid, balance: bal });
            else if (bal < 0) debtors.push({ uid, balance: bal });
        }

        creditors.sort((a, b) => b.balance - a.balance);
        debtors.sort((a, b) => a.balance - b.balance);

        session = await FriendTransaction.db.startSession();
        let usedTransaction = false;

        try {
            session.startTransaction();
            usedTransaction = true;

            while (creditors.length > 0 && debtors.length > 0) {
                const creditor = creditors[0];
                const debtor = debtors[0];
                const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

                await updateFriendBalance(debtor.uid, creditor.uid, amount, session);

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
            await newTxn.save({ session });

            await session.commitTransaction();
            session.endSession();

            res.status(201).json({ message: "Transaction added successfully", transaction: newTxn });
        } catch (txnError) {
            await session.abortTransaction();
            session.endSession();
            usedTransaction = false;

            if (txnError && (txnError.code === 20 || (txnError.message && txnError.message.includes('Transaction numbers are only allowed')))) {
                // Silently fall back to non-transactional mode for standalone MongoDB

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

                res.status(201).json({ message: "Transaction added successfully (non-transactional)", transaction: newTxn });
            } else {
                throw txnError;
            }
        }
    } catch (error) {
        if (session && session.inTransaction()) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error("Error in adding transaction:", error);
        res.status(500).json({
            message: "Error adding transaction",
            error: error.message
        });
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
            const getName = (val) => {
                if (!val) return "Unknown";
                if (typeof val === 'object' && val.name) return val.name;
                try { return (val && val.toString) ? val.toString() : String(val); } catch { return "Unknown"; }
            };

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

            if (!pair) return null;

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
        }).filter(Boolean);

        const sortedRecords = formattedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({ transactions: sortedRecords });
    } catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ message: "Failed to fetch transactions" });
    }
};

// GET /api/friendTransactions/balance/:userId/:friendId
export const getBalance = async (req, res) => {
    const { userId, friendId } = req.params;

    const internalSecretHeader = req.headers['x-internal-secret'];
    const hasValidInternalSecret = internalSecretHeader && process.env.INTERNAL_SECRET && internalSecretHeader === process.env.INTERNAL_SECRET;

    if (!hasValidInternalSecret && !req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    try {
        const cached = await cacheUtils.getBalance(userId, friendId);
        if (cached) {
            return res.status(200).json(cached);
        }

        const record = await FriendBalance.findOne({
            $or: [
                { user1: userId, user2: friendId },
                { user1: friendId, user2: userId }
            ]
        });

        if (!record) {
            const result = { balanceMessage: `Everything is settled with this friend.`, balanceValue: 0, payerIsUser: false };
            await cacheUtils.setBalance(userId, friendId, result, 300);
            return res.status(200).json(result);
        }

        const { user1, user2, balance } = record;
        const friend = await User.findById(friendId);

        if (!friend) {
            return res.status(404).json({ message: "Friend not found." });
        }

        let message = "";
        let absoluteBalance = Math.abs(balance);

        // Schema: user2 owes user1 the balance amount
        // If balance is POSITIVE: user2 owes user1
        // If balance is NEGATIVE: user1 owes user2

        if (user1.toString() === userId) {
            // You are user1
            if (balance > 0) {
                message = `${friend.name} owes you ₹${absoluteBalance}`;
            } else if (balance < 0) {
                message = `You owe ${friend.name} ₹${absoluteBalance}`;
            } else {
                message = `Everything is settled with ${friend.name}`;
            }
        } else if (user2.toString() === userId) {
            // You are user2
            if (balance > 0) {
                message = `You owe ${friend.name} ₹${absoluteBalance}`;
            } else if (balance < 0) {
                message = `You are owed by ${friend.name} ₹${absoluteBalance}`;
            } else {
                message = `Everything is settled with ${friend.name}`;
            }
        }

        const payerIsUser = (user2.toString() === userId && balance > 0) || (user1.toString() === userId && balance < 0);
        const result = { balanceMessage: message, balanceValue: absoluteBalance, payerIsUser };

        await cacheUtils.setBalance(userId, friendId, result, 300);

        res.status(200).json(result);
    } catch (error) {
        console.error("Balance error:", error);
        res.status(500).json({ message: "Balance check failed" });
    }
};

// POST /api/friendTransactions/settle-up
export const settleUp = async (req, res) => {
    const { userId, friendId, settleAmount, idempotencyKey } = req.body;
    const amount = Number(settleAmount);

    try {
        const internalSecretHeader = req.headers['x-internal-secret'];
        if (internalSecretHeader && process.env.INTERNAL_SECRET && internalSecretHeader !== process.env.INTERNAL_SECRET) {
            return res.status(403).json({ message: 'Invalid internal secret' });
        }
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

        // Schema: user2 owes user1 the balance amount
        // If balance is POSITIVE: user2 owes user1
        // If balance is NEGATIVE: user1 owes user2

        let payerIsCurrentUser = false;
        let amountOwed = 0;

        if (user1.toString() === userId) {
            // Current user is user1
            if (balance < 0) {
                // You (user1) owe user2
                payerIsCurrentUser = true;
                amountOwed = Math.abs(balance);
            } else {
                // user2 owes you
                return res.status(400).json({ message: "You don't owe anything to this friend." });
            }
        } else if (user2.toString() === userId) {
            // Current user is user2
            if (balance > 0) {
                // You (user2) owe user1
                payerIsCurrentUser = true;
                amountOwed = Math.abs(balance);
            } else {
                // user1 owes you
                return res.status(400).json({ message: "You don't owe anything to this friend." });
            }
        }

        if (!payerIsCurrentUser) {
            return res.status(400).json({ message: "You don't owe anything to this friend." });
        }

        if (amount > amountOwed) {
            return res.status(400).json({ message: `You can't settle more than you owe. You owe ₹${amountOwed}.` });
        }

        let usedTransaction = false;
        try {
            const session = await FriendTransaction.db.startSession();
            try {
                session.startTransaction();
                usedTransaction = true;

                // Update balance based on who owes whom
                // If user1 owes user2 (balance < 0), settling adds to balance (makes it less negative)
                // If user2 owes user1 (balance > 0), settling subtracts from balance
                if (user1.toString() === userId && balance < 0) {
                    record.balance += amount; // User1 settling debt increases balance
                } else if (user2.toString() === userId && balance > 0) {
                    record.balance -= amount; // User2 settling debt decreases balance
                }
                await record.save({ session });

                const newTxn = new FriendTransaction({
                    description: "Settlement",
                    category: "Settlement",
                    totalAmount: amount,
                    transactionNumber: "SETTLE-" + Date.now(),
                    paidBy: [{ user: userId, amount: amount }],
                    payees: [{ user: friendId, amount: amount }],
                    settlements: [{ from: userId, to: friendId, amount: amount }]
                });
                await newTxn.save({ session });

                await session.commitTransaction();
                session.endSession();

                // Invalidate cache so fresh balance is fetched
                await cacheUtils.invalidateBalance(userId, friendId);

                return res.status(200).json({ message: "Settlement successful." });
            } catch (err) {
                await session.abortTransaction().catch(() => { });
                session.endSession();
                usedTransaction = false;
                if (err && (err.code === 20 || (err.message && err.message.includes('Transaction numbers are only allowed')))) {
                    // Silently fall back to non-transactional mode for standalone MongoDB
                } else {
                    console.error('Settlement apply error (transaction):', err);
                    return res.status(500).json({ message: 'Settlement failed.' });
                }
            }
        } catch (startErr) {
            // Silently fall back to non-transactional mode
        }

        if (!usedTransaction) {
            try {
                const freshRecord = await FriendBalance.findOne({
                    $or: [
                        { user1: userId, user2: friendId },
                        { user1: friendId, user2: userId }
                    ]
                });

                if (!freshRecord) {
                    return res.status(400).json({ message: "No balance to settle." });
                }

                const { user1: u1, user2: u2, balance: bal } = freshRecord;

                // Update balance based on who owes whom
                if (u1.toString() === userId && bal < 0) {
                    freshRecord.balance += amount; // User1 settling debt increases balance
                } else if (u2.toString() === userId && bal > 0) {
                    freshRecord.balance -= amount; // User2 settling debt decreases balance
                }
                await freshRecord.save();

                const newTxn = new FriendTransaction({
                    description: "Settlement",
                    category: "Settlement",
                    totalAmount: amount,
                    transactionNumber: "SETTLE-" + Date.now(),
                    paidBy: [{ user: userId, amount: amount }],
                    payees: [{ user: friendId, amount: amount }],
                    settlements: [{ from: userId, to: friendId, amount: amount }]
                });
                await newTxn.save();

                // Invalidate cache so fresh balance is fetched
                await cacheUtils.invalidateBalance(userId, friendId);

                return res.status(200).json({ message: "Settlement successful (non-transactional)." });
            } catch (err) {
                console.error('Settlement apply error (fallback):', err);
                return res.status(500).json({ message: 'Settlement failed.' });
            }
        }

    } catch (err) {
        console.error("Settlement error:", err);
        res.status(500).json({ message: "Settlement failed." });
    }
};

// POST /api/friendTransactions/add-personal-tracking-transaction
export const addPersonalTrackingTransaction = async (req, res) => {
    try {
        console.log("Personal tracking transaction request:", req.body);

        // Handle both userid and userId for backward compatibility
        const transactionData = {
            ...req.body,
            userId: req.body.userId || req.body.userid
        };

        const newTransaction = new Transaction(transactionData);
        await newTransaction.save();
        res.status(201).send("Transaction added successfully");
    } catch (err) {
        console.error("Personal tracking transaction error:", err);
        res.status(500).json({ message: "Failed to add transaction", error: err.message });
    }
};
