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

// Ensure JWT secret is present in environments where tokens are used
if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        console.error('FATAL: JWT_SECRET is not set. Set JWT_SECRET in your environment.');
        process.exit(1);
    } else {
        console.warn('Warning: JWT_SECRET is not set. Using JWT will fail until configured.');
    }
}

// Configure CORS: allow explicit origins in production, otherwise allow local dev
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(',').map(s => s.trim());

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
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


// import express from "express";
// import cors from "cors";
// import dotenv from 'dotenv'; // Import dotenv

// dotenv.config({ path: '../.env' });

// import "../DB/dbConnect.js"; // Corrected path for dbConnect.js (assuming backend/DB)
// import userRoute from "../Routes/UserRoute.js"; // Corrected casing (assuming backend/routes)
// import transactionRoute from "../Routes/transactionRoute.js"; // Corrected casing
// import friendRoute from "../Routes/friendRoute.js"; // Corrected casing
// import friendTransactionRoute from "../Routes/friendTransactionRoute.js"; // Corrected casing
// import { protect } from "../middleware/authMiddleware.js"; // Import the protect middleware

// const app = express();
// const port = process.env.PORT || 5000; // Use process.env.PORT for flexibility

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Public routes (no authentication needed)
// app.use("/api/users/", userRoute); // Register and Login routes are here

// // Protected routes (authentication required)
// // Apply the 'protect' middleware before these routes
// app.use("/api/transactions/", protect, transactionRoute);
// app.use("/api/friends/", protect, friendRoute);
// app.use("/api/friend-transactions/", protect, friendTransactionRoute);

// // Basic route for testing server status
// app.get('/', (req, res) => {
//     res.send('Backend Server is running...');
// });

// app.listen(port, () => {
//     console.log(`Backend Server Listening at port ${port}`);
// });
