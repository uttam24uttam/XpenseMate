import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/Expense_tracker";

mongoose.connect(mongoUri, {

}).then(() => {
    console.log('MongoDB connected');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDb disconnected');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose disconnected due to application termination');
    process.exit(0);
});
