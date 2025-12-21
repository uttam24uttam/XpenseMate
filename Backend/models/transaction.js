import mongoose from "mongoose";
//personal finance tracker 
const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be positive']
    },
    type: {
        type: String,
        required: [true, 'Type is required'],
        enum: ['income', 'expense']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    status: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active'
    },
    deletedAt: {
        type: Date
    }
}, {
    timestamps: true
})


transactionSchema.index({ userId: 1, date: -1 }); // user's transactions sorted by date
transactionSchema.index({ userId: 1, category: 1 }); // category-based filtering
transactionSchema.index({ userId: 1, type: 1 }); // type-based filtering (income/expense)
transactionSchema.index({ userId: 1, status: 1 }); // filtr active transactions

const transactionmodel = mongoose.model("Transactions", transactionSchema)

export default transactionmodel