// models/FriendBalance.js
// tracks both friendship relationship AND financial balance
// user2 owes user1 balance
import mongoose from 'mongoose';

const FriendBalanceSchema = new mongoose.Schema({
    user1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User1 is required']
    },
    user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User2 is required']
    },
    balance: {
        type: Number,
        required: [true, 'Balance is required'],
        default: 0
        // user1 IS owed "BALANCE" by user2
    },
    status: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active'
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deletedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Ensure user1 < user2 for consistency (prevents A-B and B-A duplicates)
FriendBalanceSchema.pre('save', function (next) {
    if (this.isNew && this.user1.toString() > this.user2.toString()) {
        [this.user1, this.user2] = [this.user2, this.user1];
        this.balance = -this.balance;
    }
    next();
});

FriendBalanceSchema.index({ user1: 1, user2: 1 }, { unique: true }); // prevent duplicates
FriendBalanceSchema.index({ user2: 1, user1: 1 }); // optimize reverse lookups
FriendBalanceSchema.index({ user1: 1, status: 1 }); // find user's active friends
FriendBalanceSchema.index({ user2: 1, status: 1 }); // find user's active friends (reverse)

const FriendBalance = mongoose.model('FriendBalance', FriendBalanceSchema);
export default FriendBalance;
