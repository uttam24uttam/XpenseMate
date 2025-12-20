import express from "express";
import usermodel from "../models/user.js";
import friendTransaction from "../models/friendTransaction.js";
import User from "../models/user.js";
import moment from "moment";
import FriendBalance from '../models/FriendBalance.js';

const router = express.Router();



//ADD FRIEND
router.post('/add-friend', async (req, res) => {
    console.log(" add friend being hit-1");

    const { userId, friendEmail } = req.body;

    console.log(" add friend being hit -2");

    try {
        const loggedInUser = await usermodel.findById(userId);
        if (!loggedInUser) {
            return res.status(404).json({ message: "Logged-in user not found" });
        }
        console.log("add friend -3");

        const friend = await usermodel.findOne({ email: friendEmail });
        console.log(friend);
        if (!friend) {
            return res.status(404).json({ message: "Friend not found" });
        }

        // Prevent adding oneself as a friend
        if (friend._id.equals(loggedInUser._id)) {
            return res.status(400).json({ message: "Cannot add yourself as a friend" });
        }

        // Check if friendship already exists
        const [smallerId, largerId] = [userId, friend._id.toString()].sort();
        const existingFriendship = await FriendBalance.findOne({
            user1: smallerId,
            user2: largerId,
            status: 'active'
        });

        if (existingFriendship) {
            return res.status(400).json({ message: "Friend already added" });
        }

        // Create new friendship with zero balance
        const newFriendship = new FriendBalance({
            user1: smallerId,
            user2: largerId,
            balance: 0,
            status: 'active'
        });
        await newFriendship.save();
        console.log("add friend ----4");

        res.status(200).json({ message: "Friend added successfully", friend });
        console.log("Friendship established");

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});




// Get Friends Route for LIST
router.get('/get-friends/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log("getttttttt1");
    try {
        console.log("getttttttt2");

        // Find all friendships where user is either user1 or user2
        const friendships = await FriendBalance.find({
            $or: [{ user1: userId }, { user2: userId }],
            status: 'active'
        });

        console.log("getttttttt3");

        if (!friendships || friendships.length === 0) {
            return res.status(200).json([]);
        }

        // Extract friend IDs
        const friendIds = friendships.map(f =>
            f.user1.toString() === userId ? f.user2 : f.user1
        );

        // Fetch friend details
        const friends = await usermodel.find({ _id: { $in: friendIds } }, 'name email');

        console.log("getttttttt4");

        res.status(200).json(friends);
        console.log("getttttttt5");

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});




// Get Friend Details Route
console.log("GETING FRIEND-1")
router.get('/get-friend-details/:friendId', async (req, res) => {
    console.log("GETING FRIEND-2")

    const { friendId } = req.params;

    try {
        console.log("GETING FRIEND-3")

        const friendDetails = await usermodel.findById(friendId);
        console.log(friendDetails)

        if (!friendDetails) {
            console.log("GETING FRIEND-5")

            return res.status(404).json({ success: false, message: "Friend not found." });
        }

        res.status(200).json({

            success: true,
            friend: {
                name: friendDetails.name,
                email: friendDetails.email,
            }
        });
        console.log("GETING FRIEND-6")
        console.log("Friend:", {
            name: friendDetails.name,
            email: friendDetails.email,
        });

    } catch (error) {
        console.error("Error fetching friend details:", error.message || error);
        res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
});





// //get the overall balance for the logged-in user
// router.get("/get-overall-balance/:userId", async (req, res) => {
//     const userId = req.params.userId;
//     console.log(`overall balance - ${userId}`)
//     try {
//         let total_I_owe = 0;
//         let total_they_owe = 0;

//         const userBalance = await FriendBalance.findOne({ userId });

//         // userBalance is found -> calculate total_I_owe by adding up all balanceAmount for the user
//         if (userBalance) {
//             total_I_owe = userBalance.balances.reduce((acc, balance) => acc + balance.balanceAmount, 0);
//         } else {
//             total_I_owe = 0;
//         }
//         console.log(`overall total_I_owe - ${total_I_owe}`)

//         // iterating  through all FriendBalance models to calculate total_they_owe
//         const allFriendBalances = await FriendBalance.find();

//         allFriendBalances.forEach((friendBalance) => {
//             const balance = friendBalance.balances.find(
//                 (b) => b.friendId.toString() === userId.toString()
//             );
//             if (balance) {
//                 total_they_owe += balance.balanceAmount;
//             }
//         });

//         const difference = total_I_owe - total_they_owe;  //overall  balance

//         let message = "";
//         if (difference > 0) {
//             message = `Overall, You owe ₹${Math.abs(difference).toFixed(0)}`;
//         } else if (difference < 0) {
//             message = `Overall, You are owed ₹${Math.abs(difference).toFixed(0)}`;
//         } else {
//             message = "Everything is settled!";
//         }

//         res.status(200).json({ message });
//     } catch (error) {
//         console.error("Error calculating overall balance:", error);
//         res.status(500).json({ message: "Failed to calculate overall balance." });
//     }
// });


router.get("/get-overall-balance/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        let totalIOwe = 0;
        let totalTheyOwe = 0;

        const balances = await FriendBalance.find({
            $or: [{ user1: userId }, { user2: userId }]
        });

        for (const record of balances) {
            const { user1, user2, balance } = record;

            // user1 owes user2 balance
            if (user1.toString() === userId) {
                // YOU are user1 → you owe
                totalTheyOwe += balance;
            } else if (user2.toString() === userId) {
                // YOU are user2 → you are owed
                totalIOwe += balance;
            }
        }

        const netBalance = totalTheyOwe - totalIOwe;

        let message = "";
        if (netBalance > 0) {
            message = `Overall, you are owed ₹${netBalance.toFixed(0)}`;
        } else if (netBalance < 0) {
            message = `Overall, you owe ₹${Math.abs(netBalance.toFixed(0))}`;
        } else {
            message = "Everything is settled!";
        }

        res.status(200).json({ message });
    } catch (error) {
        console.error("Error calculating overall balance:", error);
        res.status(500).json({ message: "Failed to calculate overall balance." });
    }
});



export default router;

