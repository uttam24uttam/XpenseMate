import mongoose from "mongoose";
//personal finance tracker 
const transactionSchema = new mongoose.Schema({

    userid: {

        type: String
    },

    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
})

const transactionmodel = mongoose.model("Transactions", transactionSchema)

export default transactionmodel