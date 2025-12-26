import express from "express";
import { addFriend, getFriends, getFriendDetails, getOverallBalance } from '../controllers/friendController.js';
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post('/add-friend', protect, addFriend);

router.get('/get-friends', protect, getFriends);

router.get('/get-friend-details/:friendId', protect, getFriendDetails);

router.get("/get-overall-balance", protect, getOverallBalance);

export default router;