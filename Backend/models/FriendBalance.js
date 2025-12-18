// models/FriendBalance.js
//user2 owes user1 balance
import mongoose from 'mongoose';

const FriendBalanceSchema = new mongoose.Schema({
    user1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
        //user1 IS owed "BALANCE" by user2

    }
}, {
    timestamps: true
});

FriendBalanceSchema.index({ user1: 1, user2: 1 }, { unique: true }); // prevent duplicates

const FriendBalance = mongoose.model('FriendBalance', FriendBalanceSchema);
export default FriendBalance;


// ref
// Reference to another collection → enables .populate(), like a foreign key
// Done by mongoose, not by MongoDB at database level

// Per-transaction updates:
// Always run for every new transaction.
// Keeps balances accurate in real-time.

// Global optimization:
// Run occasionally to minimize overall transfers.
// Updates balances in FriendBalance without deleting friend relationships.