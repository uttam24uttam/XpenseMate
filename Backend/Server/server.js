import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import "../DB/dbConnect.js";
import userRoute from "../Routes/UserRoute.js";
import transactionRoute from "../Routes/transactionRoute.js";
import friendRoute from "../Routes/friendRoute.js";
import friendTransactionRoute from "../Routes/friendTransactionRoute.js";
import { protect } from "../middleware/authMiddleware.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

//JWT secret 
if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        console.error('FATAL: JWT_SECRET is not set. Set JWT_SECRET in your environment.');
        process.exit(1);
    } else {
        console.warn('Warning: JWT_SECRET is not set. Using JWT will fail until configured.');
    }
}

// Configure CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(',').map(s => s.trim());

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (process.env.NODE_ENV !== 'production') return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));

// Public routes
app.use("/api/users/", userRoute);

// Protected routes 
app.use("/api/transactions/", protect, transactionRoute);
app.use("/api/friends/", protect, friendRoute);
app.use("/api/friend-transactions/", protect, friendTransactionRoute);

// Health check
app.get('/', (req, res) => res.send('Backend Server is running'));

app.listen(port, () => {
    console.log(`Backend Server Listening at port ${port}`);
});

