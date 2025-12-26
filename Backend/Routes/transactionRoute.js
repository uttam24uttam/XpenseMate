import express from "express";
import {
    addTransaction,
    editTransaction,
    deleteTransaction,
    getAllTransactions
} from '../controllers/transactionController.js';

const router = express.Router();

router.post('/add-transaction', addTransaction);

router.put('/edit-transaction', editTransaction);

router.delete('/delete-transaction', deleteTransaction);

router.post('/get-all-transactions', getAllTransactions);

export default router;