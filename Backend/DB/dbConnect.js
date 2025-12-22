import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();


const user = process.env.MONGO_USERNAME;
const pass = process.env.MONGO_PASSWORD;
const host = process.env.MONGO_HOST || "mongodb-service";
const db = process.env.MONGO_DB || "splitwise";
const mongoUri = process.env.MONGO_URL ||
    (user && pass ? `mongodb://${user}:${pass}@${host}:27017/${db}?authSource=admin` : `mongodb://${host}:27017/${db}`);

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
