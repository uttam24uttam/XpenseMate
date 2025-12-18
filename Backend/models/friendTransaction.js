// In my schema design, I keep transaction history in one place only — the FriendTransaction collection.
// The FriendBalance collection is used purely as a net ledger, i.e., the running balance between two users.
// This avoids duplicating the same transaction data in multiple places, which can lead to data inconsistency if updates fail.

import mongoose from 'mongoose';
//For both transactions and settlements 

const friendTransactionSchema = new mongoose.Schema({
    description: {
        type: String,
        default: "No description provided"
    },
    category: {
        type: String,
        default: "Uncategorized"
    },
    date: {
        type: Date,
        default: Date.now
    },
    totalAmount: {
        type: Number,
        required: true
    },
    transactionNumber: {
        type: String,
        required: true,
        unique: true
    },

    //  MULTIPLE PAYERS
    paidBy: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            amount: { type: Number, required: true } // how much this user paid
        }
    ],

    //  MULTIPLE PAYEES (split of each guy)
    payees: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            amount: { type: Number, required: true }
        }
    ],

    settlements: [
        {
            //from->to means """"from owes to""""" amount
            from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            amount: { type: Number, required: true }
        }
    ]

});

const FriendTransaction = mongoose.model('FriendTransaction', friendTransactionSchema);
export default FriendTransaction;
