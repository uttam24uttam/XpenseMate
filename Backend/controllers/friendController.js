import usermodel from "../models/user.js";
import FriendBalance from '../models/FriendBalance.js';

// POST /api/friends/add-friend
export const addFriend = async (req, res) => {
    console.log(" add friend being hit-1");

    const userId = req.user.id;
    const { friendEmail } = req.body;

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

        if (friend._id.equals(loggedInUser._id)) {
            return res.status(400).json({ message: "Cannot add yourself as a friend" });
        }

        const [smallerId, largerId] = [userId, friend._id.toString()].sort();
        const existingFriendship = await FriendBalance.findOne({
            user1: smallerId,
            user2: largerId,
            status: 'active'
        });

        if (existingFriendship) {
            return res.status(400).json({ message: "Friend already added" });
        }

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
};

// GET /api/friends/get-friends
export const getFriends = async (req, res) => {
    const userId = req.user.id;
    console.log("getttttttt1");
    try {
        console.log("getttttttt2");

        const friendships = await FriendBalance.find({
            $or: [{ user1: userId }, { user2: userId }],
            status: 'active'
        });

        console.log("getttttttt3");

        if (!friendships || friendships.length === 0) {
            return res.status(200).json([]);
        }

        const friendIds = friendships.map(f =>
            f.user1.toString() === userId ? f.user2 : f.user1
        );

        const friends = await usermodel.find({ _id: { $in: friendIds } }, 'name email');

        console.log("getttttttt4");

        res.status(200).json(friends);
        console.log("getttttttt5");

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// GET /api/friends/get-friend-details/:friendId
export const getFriendDetails = async (req, res) => {
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
};

// GET /api/friends/get-overall-balance
export const getOverallBalance = async (req, res) => {
    const userId = req.user.id;

    try {
        let totalIOwe = 0;
        let totalTheyOwe = 0;

        const balances = await FriendBalance.find({
            $or: [{ user1: userId }, { user2: userId }]
        });

        for (const record of balances) {
            const { user1, user2, balance } = record;

            if (user1.toString() === userId) {
                // YOU are user1 → user2 owes YOU
                totalTheyOwe += balance;
            } else if (user2.toString() === userId) {
                // YOU are user2 → YOU owe user1
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
};