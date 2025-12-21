import express from "express";
import {
    addFriendTransaction,
    getTransactions,
    getBalance,
    settleUp,
    addPersonalTrackingTransaction
} from '../controllers/friendTransactionController.js';

const router = express.Router();

router.post("/add", addFriendTransaction);

router.get("/transactions/:userId/:friendId", getTransactions);

router.get("/balance/:userId/:friendId", getBalance);

router.post("/settle-up", settleUp);

router.post("/add-personal-tracking-transaction", addPersonalTrackingTransaction);

export default router;


