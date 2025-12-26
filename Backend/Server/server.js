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

// JWT secret check
if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        console.error('FATAL: JWT_SECRET is not set.');
        process.exit(1);
    } else {
        console.warn('Warning: JWT_SECRET is not set.');
    }
}

// Configure CORS 
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',      // Vite default
    'http://127.0.0.1:5173',      // Vite default
    'http://192.168.49.2:30633',  // Minikube frontend-service
    'https://xpensemate.com'      // Ingress host
];

app.use(cors({
    origin: function (origin, callback) {

        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            console.error(`CORS Blocked: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '10kb' }));

// Public routes
app.use("/api/users/", userRoute);

// Protected routes 
app.use("/api/transactions/", protect, transactionRoute);
app.use("/api/friends/", protect, friendRoute);
app.use("/api/friendTransactions", protect, friendTransactionRoute);

// Health check
app.get('/', (req, res) => res.send('Backend Server is running'));

app.listen(port, () => {
    console.log(`Backend Server Listening at port ${port}`);
});