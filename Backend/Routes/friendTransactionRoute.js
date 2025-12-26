import express from "express";
import {
    addFriendTransaction,
    getTransactions,
    getBalance,
    settleUp,
    addPersonalTrackingTransaction
} from '../controllers/friendTransactionController.js';
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, addFriendTransaction);

router.get("/transactions/:friendId", protect, getTransactions);

router.get("/balance/:friendId", protect, getBalance);

router.post("/settle-up", protect, settleUp);

router.post("/add-personal-tracking-transaction", protect, addPersonalTrackingTransaction);

export default router;
