import express from "express";
import { addFriend, getFriends, getFriendDetails, getOverallBalance } from '../controllers/friendController.js';

const router = express.Router();

router.post('/add-friend', addFriend);

router.get('/get-friends/:userId', getFriends);

router.get('/get-friend-details/:friendId', getFriendDetails);

router.get("/get-overall-balance/:userId", getOverallBalance);

export default router;




