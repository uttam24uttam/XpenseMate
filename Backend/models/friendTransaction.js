// In my schema design, I keep transaction history in one place only — the FriendTransaction collection.
// The FriendBalance collection is used purely as a net ledger, i.e., the running balance between two users.
// This avoids duplicating the same transaction data in multiple places, which can lead to data inconsistency if updates fail.

import mongoose from 'mongoose';
//For both transactions and settlements 

const friendTransactionSchema = new mongoose.Schema({
    description: {
        type: String,
        default: "No description provided",
        trim: true
    },
    category: {
        type: String,
        default: "Uncategorized",
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0.01, 'Amount must be positive']
    },
    transactionNumber: {
        type: String,
        required: [true, 'Transaction number is required'],
        unique: true
    },

    //  MULTIPLE PAYERS
    paidBy: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            amount: { type: Number, required: true, min: 0 }
        }
    ],

    //  MULTIPLE PAYEES (split of each guy)
    payees: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            amount: { type: Number, required: true, min: 0 }
        }
    ],

    settlements: [
        {
            //from->to means """"from owes to""""" amount
            from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            amount: { type: Number, required: true, min: 0 }
        }
    ],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active'
    },
    deletedAt: {
        type: Date
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes for performance optimization
friendTransactionSchema.index({ transactionNumber: 1 }, { unique: true }); // fast lookup by transaction number
friendTransactionSchema.index({ 'paidBy.user': 1, date: -1 }); // queries by payer with recent-first sorting
friendTransactionSchema.index({ 'payees.user': 1, date: -1 }); // queries by payee with recent-first sorting
// Note: Cannot create compound index on two array fields (paidBy.user + payees.user)
// MongoDB limitation: "cannot index parallel arrays"
friendTransactionSchema.index({ date: -1 }); // general date-based sorting
friendTransactionSchema.index({ status: 1 }); // filter by status

const FriendTransaction = mongoose.model('FriendTransaction', friendTransactionSchema);
export default FriendTransaction;
