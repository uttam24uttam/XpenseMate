import mongoose from "mongoose";
import dotenv from 'dotenv';

// Load variables from .env file
dotenv.config();

const user = process.env.MONGO_USERNAME;
const pass = process.env.MONGO_PASSWORD;
const host = process.env.MONGO_HOST || "mongodb-service";
const db = process.env.MONGO_DB || "splitwise";

//dynamic URI
const mongoUri = process.env.MONGO_URI ||
    (user && pass
        ? `mongodb://${user}:${pass}@${host}:27017/${db}?authSource=admin`
        : `mongodb://${host}:27017/${db}`);


const sanitizedLog = mongoUri.replace(/:([^:@]{1,})@/, ':****@');
console.log(`System attempting connection to: ${sanitizedLog}`);

mongoose.connect(mongoUri)
    .then(() => {
        console.log(' MongoDB connected successfully');
    })
    .catch((err) => {
        console.error(' MongoDB connection error:', err.message);

        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    });

// Monitor connection events
mongoose.connection.on('error', err => {
    console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
});


process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose connection closed due to app termination');
    process.exit(0);
});

export default mongoose;