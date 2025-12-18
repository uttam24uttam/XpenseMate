import express from "express";
import User from '../models/user.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

function generateToken(userId) {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    if (!secret) {
        // Fail fast with clear message if secret missing
        throw new Error('JWT_SECRET is not configured on the server');
    }
    return jwt.sign({ id: userId }, secret, { expiresIn });
}

// Register Route
router.post('/register', async function (req, res) {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const newUser = new User({ name, email, password });
        await newUser.save();

        // Generate token on registration
        const token = generateToken(newUser._id);

        res.status(201).json({
            message: 'User Registered Successfully',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login Route
router.post('/login', async function (req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Use comparePassword method from the model
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;









// import express from "express";
// import User from '../models/user.js';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';




// const router = express.Router();

// // Register Route
// router.post('/register', async function (req, res) {
//     try {
//         const { email, password, name } = req.body; // Destructure name as well

//         // Check if user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ message: "Email already registered" }); // Consistent error format
//         }

//         // Create new user (password hashing is handled by the pre('save') hook in the User model)
//         const newUser = new User({ name, email, password });
//         await newUser.save();

//         // Optionally, generate a token immediately after registration as well
//         // For now, we'll just send a success message and expect login after registration
//         res.status(201).json({ message: "User Registered Successfully" }); // 201 Created status

//     } catch (error) {
//         console.error("Registration error:", error); // Log the error for debugging
//         res.status(500).json({ message: "Server error during registration", error: error.message });
//     }
// });

// // Login Route
// router.post('/login', async function (req, res) {
//     try {
//         const { email, password } = req.body; // Destructure for clarity

//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.status(400).json({ message: "Invalid email or password" });
//         }

//         // Compare entered password with the hashed password using the method from the User model
//         const isMatch = await user.comparePassword(password); // Use the comparePassword method

//         if (!isMatch) {
//             return res.status(400).json({ message: "Invalid email or password" });
//         }

//         // If credentials are valid, generate a JWT
//         const token = jwt.sign(
//             { id: user._id }, // Payload: typically user ID
//             process.env.JWT_SECRET, // Your secret key from .env
//             { expiresIn: '1h' } // Token expires in 1 hour (adjust as needed)
//         );

//         // Send the token and basic user info back to the client
//         res.status(200).json({
//             message: "Logged in successfully",
//             token,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email
//                 // Do NOT send the hashed password or sensitive data here
//             }
//         });
//     } catch (error) {
//         console.error("Login error:", error); // Log the error for debugging
//         res.status(500).json({ message: "Server error during login", error: error.message });
//     }
// });

// export default router;

