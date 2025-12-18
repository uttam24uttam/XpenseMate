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


// // // // // // // Get Friend Details Route

// // // // // // console.log("GETING FRIEND-1")
// // // // // // router.get('/get-friend-details/:friendId', async (req, res) => {
// // // // // //     console.log("GETING FRIEND-2")

// // // // // //     const { friendId } = req.params;

// // // // // //     try {
// // // // // //         // Fetch the friend details by their ID
// // // // // //         console.log("GETING FRIEND-3")

// // // // // //         const friendDetails = await usermodel.findById(friendId);
// // // // // //         console.log(friendDetails)

// // // // // //         if (!friendDetails) {
// // // // // //             console.log("GETING FRIEND-5")

// // // // // //             return res.status(404).json({ success: false, message: "Friend not found." });
// // // // // //         }

// // // // // //         // Respond with the friend details (you can adjust the fields as necessary)
// // // // // //         res.status(200).json({

// // // // // //             success: true,
// // // // // //             friend: {
// // // // // //                 name: friendDetails.name,
// // // // // //                 email: friendDetails.email,
// // // // // //                 // Add any other friend-specific details you need here
// // // // // //             }
// // // // // //         });
// // // // // //         console.log("GETING FRIEND-6")
// // // // // //         console.log("Friend:", {
// // // // // //             name: friendDetails.name,
// // // // // //             email: friendDetails.email,
// // // // // //             // Log other details of the friend here as needed
// // // // // //         });

// // // // // //     } catch (error) {
// // // // // //         console.error("Error fetching friend details:", error.message || error);
// // // // // //         res.status(500).json({ success: false, message: "Server error. Please try again later." });
// // // // // //     }
// // // // // // });

// // // // // // export default router;






// // // // // import express from "express";
// // // // // import usermodel from "../models/user.js"; // Ensure this path is correct
// // // // // const router = express.Router();

// // // // // // Add Friend Route
// // // // // router.post('/add-friend', async (req, res) => {
// // // // //     console.log("YOU ARE BEING HIT HARDDDDDDd23");
// // // // //     const { userId, friendEmail } = req.body;
// // // // //     console.log("YOU ARE BEING HIT HARDDDDDDd1");

// // // // //     try {
// // // // //         const loggedInUser = await usermodel.findById(userId);
// // // // //         console.log("YOU ARE BEING HIT HARDDDDDDd2");
// // // // //         if (!loggedInUser) {
// // // // //             return res.status(404).json({ message: "Logged-in user not found" });
// // // // //         }
// // // // //         console.log("YOU ARE BEING HIT HARDDDDDDd3");

// // // // //         const friend = await usermodel.findOne({ email: friendEmail });
// // // // //         console.log("YOU ARE BEING HIT HARDDDDDDd4");
// // // // //         console.log(friend);
// // // // //         if (!friend) {
// // // // //             return res.status(404).json({ message: "Friend not found" });
// // // // //         }

// // // // //         console.log("YOU ARE BEING HIT HARDDDDDDd5");
// // // // //         if (loggedInUser.friends.includes(friend._id)) {
// // // // //             console.log("YOU ARE BEING HIT HARDDDDDDd6");
// // // // //             return res.status(400).json({ message: "Friend already added" });
// // // // //         }
// // // // //         console.log("YOU ARE BEING HIT HARDDDDDDd7");

// // // // //         loggedInUser.friends.push(friend._id);
// // // // //         await loggedInUser.save();
// // // // //         console.log("YOU ARE BEING HIT HARDDDDDDd8");

// // // // //         // Send the response after adding the friend to the logged-in user's list
// // // // //         res.status(200).json({ message: "Friend added successfully", friend });
// // // // //         console.log("YOU ARE BEING HIT HARDDDDDDd9");

// // // // //         // Now, add mutual friendship: Add loggedInUser to the friend's friend list
// // // // //         friend.friends.push(loggedInUser._id);
// // // // //         console.log("YOU ARE BEING HIT HARDDDDDDd10");

// // // // //         await friend.save();
// // // // //         console.log("YOU ARE BEING HIT HARDDDDDDd11");

// // // // //         console.log("Mutual friend added successfully");

// // // // //         console.log("Mutual friendship established");

// // // // //     } catch (error) {
// // // // //         console.error(error);
// // // // //         res.status(500).json({ message: "Server error" });
// // // // //     }
// // // // // });






// // // // //view friend.js

// // // // // ViewFriend;


// // // // import React, { useEffect, useState } from "react";
// // // // import { useParams } from "react-router-dom";
// // // // import { message, Button } from "antd";
// // // // import axios from "axios";
// // // // import DefaultLayout from "../components/DefaultLayout";
// // // // import moment from "moment";
// // // // import SettleUp from "../components/SettleUpComponent";

// // // // function ViewFriend() {
// // // //     const { friendId } = useParams();
// // // //     const [friendDetails, setFriendDetails] = useState({});
// // // //     const [transactions, setTransactions] = useState([]);
// // // //     const [balance, setBalance] = useState(0);
// // // //     const [balanceMessage, setBalanceMessage] = useState(""); // Added state for balanceMessage
// // // //     const [settleUpModalVisible, setSettleUpModalVisible] = useState(false);

// // // //     const fetchFriendDetails = async () => {
// // // //         try {
// // // //             const user = JSON.parse(localStorage.getItem("User")); // Get user from localStorage

// // // //             if (!user || !user._id) {
// // // //                 message.error("User not logged in.");
// // // //                 return;
// // // //             }

// // // //             // Fetch friend details
// // // //             const friendResponse = await axios.get(
// // // //                 `http://localhost:5000/api/friends/get-friend-details/${friendId}`
// // // //             );

// // // //             if (!friendResponse.data.success || !friendResponse.data.friend) {
// // // //                 throw new Error("Friend details not found.");
// // // //             }

// // // //             setFriendDetails(friendResponse.data.friend);

// // // //             // Fetch balance message
// // // //             try {
// // // //                 const balanceResponse = await axios.get(
// // // //                     `http://localhost:5000/api/friend-transactions/balance/${user._id}/${friendId}`
// // // //                 );

// // // //                 if (balanceResponse.data.balanceMessage) {
// // // //                     setBalanceMessage(balanceResponse.data.balanceMessage); // Set balanceMessage here
// // // //                 }
// // // //             } catch (balanceError) {
// // // //                 console.error("Error fetching balance:", balanceError);
// // // //                 // Fallback: display default message if balance API fails
// // // //                 setBalanceMessage("Error fetching balance information.");
// // // //             }

// // // //             // Fetch transactions
// // // //             const transactionsResponse = await axios.get(
// // // //                 `/api/friend-transactions/transactions/${user._id}/${friendId}`
// // // //             );

// // // //             setTransactions(transactionsResponse.data.transactions); // Transactions are already sorted from the backend
// // // //             setBalance(transactionsResponse.data.balance);
// // // //         } catch (error) {
// // // //             console.error(error);
// // // //             message.error("Error fetching friend details.");
// // // //         }
// // // //     };

// // // //     const handleSettleUp = async (settleAmount) => {
// // // //         try {
// // // //             const user = JSON.parse(localStorage.getItem("User"));
// // // //             const userId = user ? user._id : null;

// // // //             if (!userId) {
// // // //                 message.error("User not logged in.");
// // // //                 return;
// // // //             }

// // // //             const response = await axios.post("http://localhost:5000/api/friend-transactions/settle-up", {
// // // //                 userId,
// // // //                 friendId,
// // // //                 settleAmount: Number(settleAmount),
// // // //             });

// // // //             if (response.data.success) {
// // // //                 message.success("Settled successfully!");
// // // //                 setSettleUpModalVisible(false);

// // // //                 // Update balance and transactions dynamically
// // // //                 setBalance((prev) => prev - settleAmount);
// // // //                 fetchFriendDetails(); // Refresh details
// // // //             } else {
// // // //                 message.error(response.data.message || "Settlement failed.");
// // // //             }
// // // //         } catch (error) {
// // // //             console.error(error);
// // // //             message.error("Error settling the transaction.");
// // // //         }
// // // //     };

// // // //     // Fetch friend details when the component mounts
// // // //     useEffect(() => {
// // // //         fetchFriendDetails();
// // // //     }, [friendId]);

// // // //     return (
// // // //         <DefaultLayout>
// // // //             <div className="p-4">
// // // //                 {/* Friend details */}
// // // //                 <div className="flex justify-center items-center mb-6 py-8 border-b border-gray-300">
// // // //                     <div className="text-center">
// // // //                         <h1 className="text-2xl font-bold text-gray-800">{friendDetails.name}</h1>
// // // //                         <p className="text-lg text-gray-600">{friendDetails.email}</p>
// // // //                     </div>
// // // //                 </div>

// // // //                 {/* Showing Balance */}
// // // //                 <div className={`mb-4 p-4 rounded ${balance > 0 ? "bg-green-100" : balance < 0 ? "bg-red-100" : "bg-gray-100"}`}>
// // // //                     {balanceMessage || "Balance message loading..."}
// // // //                 </div>

// // // //                 {/* Settle Up Button */}
// // // //                 <div className="flex justify-center mb-6">
// // // //                     <Button
// // // //                         type="primary"
// // // //                         onClick={() => setSettleUpModalVisible(true)}
// // // //                         disabled={balance === 0}
// // // //                     >
// // // //                         Settle Up
// // // //                     </Button>
// // // //                 </div>

// // // //                 {/* Transactions */}
// // // //                 <div>
// // // //                     <h2 className="text-lg font-bold mb-4">Transactions</h2>
// // // //                     {transactions.length > 0 ? (
// // // //                         transactions.map((txn) => (
// // // //                             <div
// // // //                                 key={txn._id}
// // // //                                 className="flex justify-between items-center p-4 bg-gray-100 mb-2 rounded shadow"
// // // //                             >
// // // //                                 {/* Date & Time */}
// // // //                                 <div className="flex flex-col items-center">
// // // //                                     <p className="text-sm font-medium text-gray-700">
// // // //                                         {moment(txn.date).format("HH:mm A")}
// // // //                                     </p>
// // // //                                     <p className="text-sm text-gray-500">
// // // //                                         {moment(txn.date).format("DD MMM YYYY")}
// // // //                                     </p>
// // // //                                 </div>

// // // //                                 {/* Description & Amount */}
// // // //                                 <div className="flex flex-col items-center">
// // // //                                     <p className="text-sm font-medium text-gray-800">{txn.description}</p>
// // // //                                     <p className="text-sm text-gray-600">Total Amount: ₹{txn.total_amount}</p>
// // // //                                 </div>

// // // //                                 {/* Balance Message */}
// // // //                                 <div className="flex flex-col items-center">
// // // //                                     <p
// // // //                                         className={`text-sm font-medium ${txn.balanceMessage.includes("borrowed")
// // // //                                             ? "text-red-500"
// // // //                                             : "text-green-500"
// // // //                                             }`}
// // // //                                     >
// // // //                                         {txn.balanceMessage}
// // // //                                     </p>
// // // //                                 </div>
// // // //                             </div>
// // // //                         ))
// // // //                     ) : (
// // // //                         <p>No transactions found.</p>
// // // //                     )}
// // // //                 </div>

// // // //                 {/* Settle Up Modal */}
// // // //                 <SettleUp
// // // //                     visible={settleUpModalVisible}
// // // //                     onCancel={() => setSettleUpModalVisible(false)}
// // // //                     onSettleUp={handleSettleUp}
// // // //                 />
// // // //             </div>
// // // //         </DefaultLayout>
// // // //     );
// // // // }

// // // // export default ViewFriend;



// // // //MANGAGE FRIEND




// // // // import React, { useState, useEffect } from "react";
// // // // import { Button, message, Modal, Input } from "antd";
// // // // import { useNavigate } from "react-router-dom";
// // // // import axios from "axios";
// // // // import DefaultLayout from "../components/DefaultLayout";
// // // // import AddFriendExpense from "../components/AddFriendExpense"; // Import the new component

// // // // function ManageFriends() {
// // // //     const [friends, setFriends] = useState([]);
// // // //     const [loading, setLoading] = useState(false);
// // // //     const [searchEmail, setSearchEmail] = useState("");
// // // //     const [showAddFriendModal, setShowAddFriendModal] = useState(false);
// // // //     const [addExpenseModalVisible, setAddExpenseModalVisible] = useState(false);
// // // //     const navigate = useNavigate();

// // // //     // Fetch friends list for the logged-in user
// // // //     const getFriends = async () => {
// // // //         setLoading(true);
// // // //         try {
// // // //             const user = JSON.parse(localStorage.getItem("User"));
// // // //             const response = await axios.get(`http://localhost:5000/api/friends/get-friends/${user._id}`);
// // // //             setFriends(response.data);
// // // //         } catch (error) {
// // // //             console.error(error);
// // // //             message.error("Error fetching friends.");
// // // //         } finally {
// // // //             setLoading(false);
// // // //         }
// // // //     };

// // // //     // Handle adding a friend by email
// // // //     const handleAddFriend = async () => {
// // // //         if (!searchEmail) {
// // // //             message.warning("Please enter an email.");
// // // //             return;
// // // //         }

// // // //         try {
// // // //             const user = JSON.parse(localStorage.getItem("User"));
// // // //             const response = await axios.post("http://localhost:5000/api/friends/add-friend", {
// // // //                 userId: user._id,
// // // //                 friendEmail: searchEmail,
// // // //             });

// // // //             message.success(response.data.message);
// // // //             setSearchEmail("");
// // // //             setShowAddFriendModal(false);
// // // //             getFriends();
// // // //         } catch (error) {
// // // //             console.error(error);
// // // //             message.error(error.response?.data?.message || "Error adding friend.");
// // // //         }
// // // //     };

// // // //     useEffect(() => {
// // // //         getFriends();
// // // //     }, []);

// // // //     return (
// // // //         <DefaultLayout>
// // // //             <div className="p-4">
// // // //                 <div className="flex justify-between items-center mb-6">
// // // //                     <h1 className="text-xl font-bold">Manage Friends</h1>
// // // //                     <Button
// // // //                         type="primary"
// // // //                         className="bg-[#546E7A] hover:bg-[#4a5d66] text-white font-bold p-2 px-4 border border-blue-700 rounded-lg text-sm"
// // // //                         onClick={() => setShowAddFriendModal(true)}
// // // //                     >
// // // //                         Add Friend
// // // //                     </Button>
// // // //                     <Button
// // // //                         type="primary"
// // // //                         className="bg-[#546E7A] hover:bg-[#4a5d66] text-white font-bold p-2 px-4 border border-blue-700 rounded-lg text-sm"
// // // //                         onClick={() => setAddExpenseModalVisible(true)}
// // // //                     >
// // // //                         Add Expense
// // // //                     </Button>
// // // //                 </div>

// // // //                 <div>
// // // //                     {loading ? (
// // // //                         <p>Loading friends...</p>
// // // //                     ) : friends.length > 0 ? (
// // // //                         friends.map((friend) => (
// // // //                             <div
// // // //                                 key={friend._id}
// // // //                                 className="p-4 bg-gray-100 rounded-md mb-4 flex justify-between items-center shadow-md"
// // // //                             >
// // // //                                 <span>{friend.name}</span>
// // // //                                 <Button
// // // //                                     type="link"
// // // //                                     onClick={() => navigate(`/friends/view/${friend._id}`)} // Navigate to the View page
// // // //                                 >
// // // //                                     View Details
// // // //                                 </Button>
// // // //                             </div>
// // // //                         ))
// // // //                     ) : (
// // // //                         <p>No friends found.</p>
// // // //                     )}
// // // //                 </div>
// // // //             </div>

// // // //             {/* Add Friend Modal */}
// // // //             <Modal
// // // //                 title="Add Friend"
// // // //                 open={showAddFriendModal}
// // // //                 onCancel={() => setShowAddFriendModal(false)}
// // // //                 onOk={handleAddFriend}
// // // //                 okText="Add"
// // // //             >
// // // //                 <Input
// // // //                     placeholder="Enter friend's email"
// // // //                     value={searchEmail}
// // // //                     onChange={(e) => setSearchEmail(e.target.value)}
// // // //                 />
// // // //             </Modal>

// // // //             {/* Add Expense Component */}
// // // //             <AddFriendExpense
// // // //                 friends={friends}
// // // //                 visible={addExpenseModalVisible}
// // // //                 onCancel={() => setAddExpenseModalVisible(false)}
// // // //                 onExpenseAdded={getFriends} // Refresh the friend list after adding an expense
// // // //             />
// // // //         </DefaultLayout>
// // // //     );
// // // // }

// // // // export default ManageFriends;


// // // import React, { useState, useEffect } from "react";
// // // import { Button, message, Modal, Input } from "antd";
// // // import { useNavigate } from "react-router-dom";
// // // import axios from "axios";
// // // import DefaultLayout from "../components/DefaultLayout";
// // // import AddFriendExpense from "../components/AddFriendExpense"; // Import the new component

// // // function ManageFriends() {
// // //     const [friends, setFriends] = useState([]);
// // //     const [loading, setLoading] = useState(false);
// // //     const [searchEmail, setSearchEmail] = useState("");
// // //     const [showAddFriendModal, setShowAddFriendModal] = useState(false);
// // //     const [addExpenseModalVisible, setAddExpenseModalVisible] = useState(false);
// // //     const [overallBalanceMessage, setOverallBalanceMessage] = useState(""); // For displaying the overall balance message
// // //     const navigate = useNavigate();

// // //     // Fetch friends list for the logged-in user
// // //     const getFriends = async () => {
// // //         setLoading(true);
// // //         try {
// // //             const user = JSON.parse(localStorage.getItem("User"));
// // //             const response = await axios.get(`http://localhost:5000/api/friends/get-friends/${user._id}`);
// // //             setFriends(response.data);
// // //         } catch (error) {
// // //             console.error(error);
// // //             message.error("Error fetching friends.");
// // //         } finally {
// // //             setLoading(false);
// // //         }
// // //     };

// // //     // Fetch the overall balance message for the logged-in user
// // //     const getOverallBalance = async () => {
// // //         const user = JSON.parse(localStorage.getItem("User"));
// // //         try {
// // //             const response = await axios.get(`http://localhost:5000/api/friends/get-overall-balance/${user._id}`);
// // //             setOverallBalanceMessage(response.data.message);
// // //         } catch (error) {
// // //             console.error(error);
// // //             message.error("Error fetching overall balance.");
// // //         }
// // //     };

// // //     // Handle adding a friend by email
// // //     const handleAddFriend = async () => {
// // //         if (!searchEmail) {
// // //             message.warning("Please enter an email.");
// // //             return;
// // //         }

// // //         try {
// // //             const user = JSON.parse(localStorage.getItem("User"));
// // //             const response = await axios.post("http://localhost:5000/api/friends/add-friend", {
// // //                 userId: user._id,
// // //                 friendEmail: searchEmail,
// // //             });

// // //             message.success(response.data.message);
// // //             setSearchEmail("");
// // //             setShowAddFriendModal(false);
// // //             getFriends();
// // //         } catch (error) {
// // //             console.error(error);
// // //             message.error(error.response?.data?.message || "Error adding friend.");
// // //         }
// // //     };

// // //     useEffect(() => {
// // //         getFriends();
// // //         getOverallBalance(); // Fetch overall balance when the component loads
// // //     }, []);

// // //     return (
// // //         <DefaultLayout>
// // //             <div className="p-4">
// // //                 {/* Header Section */}
// // //                 <div className="flex justify-between items-center mb-6">
// // //                     <h1 className="text-xl font-bold">Manage Friends</h1>
// // //                     <div className="flex gap-4">
// // //                         <Button
// // //                             type="primary"
// // //                             className="bg-[#546E7A] hover:bg-[#4a5d66] text-white font-bold p-2 px-4 border border-blue-700 rounded-lg text-sm"
// // //                             onClick={() => setShowAddFriendModal(true)}
// // //                         >
// // //                             Add Friend
// // //                         </Button>
// // //                         <Button
// // //                             type="primary"
// // //                             className="bg-[#546E7A] hover:bg-[#4a5d66] text-white font-bold p-2 px-4 border border-blue-700 rounded-lg text-sm"
// // //                             onClick={() => setAddExpenseModalVisible(true)}
// // //                         >
// // //                             Add Expense
// // //                         </Button>
// // //                     </div>
// // //                 </div>

// // //                 {/* Overall Balance Section */}
// // //                 <div className="mb-6">
// // //                     <h2 className="text-lg font-semibold">Overall Balance</h2>
// // //                     <p className="text-gray-700">{overallBalanceMessage}</p>
// // //                 </div>

// // //                 {/* Friends List Section */}
// // //                 <div>
// // //                     {loading ? (
// // //                         <p>Loading friends...</p>
// // //                     ) : friends.length > 0 ? (
// // //                         friends.map((friend) => (
// // //                             <div
// // //                                 key={friend._id}
// // //                                 className="p-4 bg-gray-100 rounded-md mb-4 flex justify-between items-center shadow-md"
// // //                             >
// // //                                 <span>{friend.name}</span>
// // //                                 <Button
// // //                                     type="link"
// // //                                     onClick={() => navigate(`/friends/view/${friend._id}`)} // Navigate to the View page
// // //                                 >
// // //                                     View Details
// // //                                 </Button>
// // //                             </div>
// // //                         ))
// // //                     ) : (
// // //                         <p>No friends found.</p>
// // //                     )}
// // //                 </div>
// // //             </div>

// // //             {/* Add Friend Modal */}
// // //             <Modal
// // //                 title="Add Friend"
// // //                 open={showAddFriendModal}
// // //                 onCancel={() => setShowAddFriendModal(false)}
// // //                 onOk={handleAddFriend}
// // //                 okText="Add"
// // //             >
// // //                 <Input
// // //                     placeholder="Enter friend's email"
// // //                     value={searchEmail}
// // //                     onChange={(e) => setSearchEmail(e.target.value)}
// // //                 />
// // //             </Modal>

// // //             {/* Add Expense Modal */}
// // //             <AddFriendExpense
// // //                 friends={friends}
// // //                 visible={addExpenseModalVisible}
// // //                 onCancel={() => setAddExpenseModalVisible(false)}
// // //                 onExpenseAdded={getFriends} // Refresh the friend list after adding an expense
// // //             />
// // //         </DefaultLayout>
// // //     );
// // // }

// // // export default ManageFriends;






// // //route

// // //ROUTES

// // import express from "express";
// // import friendTransaction from "../models/friendTransaction.js"; // FriendTransaction model
// // import User from "../models/user.js"; // User model
// // import moment from "moment";
// // import FriendBalance from '../models/FriendBalance.js'; // Adjust the path according to your file structure


// // const router = express.Router();



// // // POST route to add transactions and update balance_amount
// // router.post("/add", async (req, res) => {
// //     console.log("=== Received request at /add ===");
// //     console.log("Request body:", req.body);

// //     const { transactions } = req.body;

// //     // Validate request body
// //     if (!transactions || !Array.isArray(transactions)) {
// //         console.log("Invalid transactions data. Expecting an array.");
// //         return res.status(400).json({ message: "Invalid transactions data." });
// //     }

// //     console.log("Number of transactions received:", transactions.length);
// //     console.log("Transactions array:");
// //     transactions.forEach((transaction, index) => {
// //         console.log(`Transaction ${index + 1}:`, transaction);
// //     });

// //     try {
// //         // Loop through all transactions and append usernames for user1 and user2
// //         const transactionsWithNames = await Promise.all(
// //             transactions.map(async (transaction) => {
// //                 const user1 = await User.findById(transaction.user1);
// //                 const user2 = await User.findById(transaction.user2);

// //                 // Add usernames to the transaction object
// //                 const updatedTransaction = {
// //                     ...transaction,
// //                     user1Name: user1 ? user1.name : 'Unknown User', // Handle cases where user is not found
// //                     user2Name: user2 ? user2.name : 'Unknown User',
// //                 };

// //                 // Check if the transaction amount is negative (i.e., user1 owes user2)
// //                 if (transaction.amount < 0) {
// //                     // Only update the balance for user1 -> user2 using absolute value of the amount
// //                     await updateFriendBalance(transaction.user1, transaction.user2, Math.abs(transaction.amount));
// //                 }

// //                 return updatedTransaction;
// //             })
// //         );

// //         // Insert all transactions into the database
// //         const savedTransactions = await friendTransaction.insertMany(transactionsWithNames);

// //         res.status(201).json({
// //             message: "Transactions added successfully!",
// //             transactions: savedTransactions,
// //         });
// //     } catch (error) {
// //         console.error("Error saving transactions:", error);
// //         res.status(500).json({ message: "Failed to add transactions." });
// //     }
// // });

// // console.log("DONE______1")
// // // Helper function to update the FriendBalance model
// // const updateFriendBalance = async (userId, friendId, amount) => {
// //     try {
// //         // Step 1: Find the FriendBalance for the user (user1)
// //         let friendBalance = await FriendBalance.findOne({ userId });
// //         console.log("FriendBalance for user1 found:", friendBalance);

// //         // If no FriendBalance exists for user1, create one
// //         if (!friendBalance) {
// //             friendBalance = new FriendBalance({ userId, balances: [] });
// //         }

// //         // Step 2: Look for the friend's balance entry (user2)
// //         const friendBalanceEntry = friendBalance.balances.find(
// //             (entry) => entry.friendId.toString() === friendId.toString()
// //         );
// //         console.log("FriendBalance entry found for user2:", friendBalanceEntry);

// //         // Step 3: If the friend is not in the balances list, add them
// //         if (!friendBalanceEntry) {
// //             friendBalance.balances.push({
// //                 friendId,
// //                 balanceAmount: Math.abs(amount), // Adding the absolute value of the amount
// //             });
// //         } else {
// //             // Step 4: If the friend exists, update the balance
// //             friendBalanceEntry.balanceAmount += Math.abs(amount); // Update with absolute value of the amount
// //         }

// //         // Step 5: Save the updated FriendBalance
// //         await friendBalance.save();
// //         console.log("Updated FriendBalance for user1:", friendBalance);
// //     } catch (error) {
// //         console.error("Error updating FriendBalance:", error);
// //     }

// // };








// // // GET route to fetch transactions for a specific user and their friend
// // router.get("/transactions/:userId/:friendId", async (req, res) => {
// //     console.log("=== Received request at /transactions ===");
// //     const { userId, friendId } = req.params;

// //     try {
// //         // Fetch all transactions between userId and friendId
// //         const transactions = await friendTransaction.find({
// //             $or: [
// //                 { user1: userId, user2: friendId }
// //             ]
// //         }
// //         ).sort({ date: -1 });


// //         if (transactions.length === 0) {
// //             return res.status(404).json({ message: "No transactions found between these users." });
// //         }

// //         // Map transactions to include 'You lent' or 'You borrowed' based on the amount sign
// //         const transactionsWithDetails = transactions.map((txn) => {
// //             let balanceMessage = '';
// //             let formattedDate = moment(txn.date).format('DD-MM-YYYY'); // Format the date

// //             // The total amount for the expense
// //             let totalAmount = txn.total_amount
// //             console.log(totalAmount)

// //             // Determine the amount based on whether the user is a lender or borrower
// //             let amount = 0;
// //             if (txn.user1.toString() === userId) {
// //                 // If user1 is the logged-in user, determine if they lent or borrowed
// //                 amount = txn.amount < 0 ? Math.abs(txn.amount).toFixed(2) : Math.abs(txn.amount).toFixed(2);
// //                 balanceMessage = txn.amount < 0 ? `You borrowed ₹${amount}` : `You lent ₹${amount}`;
// //             } else {
// //                 // If user2 is the logged-in user
// //                 amount = txn.amount < 0 ? Math.abs(txn.amount).toFixed(2) : Math.abs(txn.amount).toFixed(2);
// //                 balanceMessage = txn.amount < 0 ? `You lent ₹${amount}` : `You borrowed ₹${amount}`;
// //             }

// //             return {
// //                 ...txn.toObject(),
// //                 totalAmount,  // Showing the total amount of the transaction
// //                 amount,  // Individual user's owed/lent amount
// //                 balanceMessage, // Adding the balance message to each transaction
// //                 formattedDate,
// //                 formattedTime: moment(txn.date).format('HH:mm') // Formatting time to show hours only
// //             };
// //         });

// //         res.status(200).json({
// //             transactions: transactionsWithDetails,
// //         });
// //     } catch (error) {
// //         console.error("Error fetching transactions:", error);
// //         res.status(500).json({ message: "Failed to fetch transactions." });
// //     }
// // });



// // // Backend: balance calculation route

// // router.get("/balance/:userId/:friendId", async (req, res) => {
// //     console.log("WELCOME AGAIN FIXING BALANCE-1")
// //     try {
// //         const { userId, friendId } = req.params;

// //         console.log(`user ${userId} friend ${friendId}`);

// //         // Fetch the balance of the logged-in user (A)
// //         const userBalance = await FriendBalance.findOne({ userId: userId });
// //         console.log(`userBalance: ${userBalance}`);

// //         let userFriendBalance = 0; // Default balance if not found
// //         console.log(`userFriendBalance-1: ${userFriendBalance}`);

// //         // If userBalance is found, check if friend exists in balances array
// //         if (userBalance) {
// //             const balance = userBalance.balances.find(
// //                 (balance) => balance.friendId.toString() === friendId
// //             );
// //             if (balance) {
// //                 userFriendBalance = balance.balanceAmount;
// //             }
// //         }
// //         // If no balance data is found, the default value remains 0
// //         console.log(`userFriendBalance-2: ${userFriendBalance}`);
// //         // Fetch the balance of the friend's account (B)
// //         const friendBalance = await FriendBalance.findOne({ userId: friendId });
// //         console.log(`friendbalance ${friendBalance} `)

// //         let friendUserBalance = 0;

// //         if (friendBalance) {
// //             const balance = friendBalance.balances.find(
// //                 (balance) => balance.friendId.toString() === userId
// //             );
// //             if (balance) {
// //                 friendUserBalance = balance.balanceAmount;
// //             }
// //         }

// //         console.log(`user-friend-Balance ${userFriendBalance}`);
// //         console.log(`friend-user-Balance ${friendUserBalance}`);

// //         // Fetch the friend's details
// //         const friend = await User.findById(friendId);
// //         if (!friend) {
// //             return res.status(404).json({ message: "Friend not found." });
// //         }

// //         const friendName = friend.name;

// //         // Calculate the difference between user and friend's balance
// //         const balanceDifference = userFriendBalance - friendUserBalance;
// //         let balanceMessage = '';

// //         // Determine the message based on who owes whom
// //         if (balanceDifference > 0) {
// //             balanceMessage = `You owe ${friendName} ₹${balanceDifference}`;
// //         } else if (balanceDifference < 0) {
// //             balanceMessage = `${friendName} owes you ₹${Math.abs(balanceDifference)}`;
// //         } else {
// //             balanceMessage = `Everything is settled between you and ${friendName}.`;
// //         }

// //         res.status(200).json({
// //             balanceMessage,
// //         });
// //     } catch (error) {
// //         console.error("Error calculating balance:", error);
// //         res.status(500).json({ message: "Failed to calculate balance." });
// //     }
// // });








// // // Settle Up Route
// // // POST route to settle up
// // router.post("/settle-up", async (req, res) => {
// //     const { userId, friendId, settleAmount } = req.body;

// //     try {
// //         // Find the balance record for the user
// //         const userBalance = await FriendBalance.findOne({ userId });

// //         if (!userBalance) {
// //             return res.status(404).json({ success: false, message: "Balance record not found." });
// //         }

// //         // Find the specific friend's balance
// //         const friendBalance = userBalance.balances.find(
// //             (balance) => balance.friendId.toString() === friendId
// //         );

// //         if (!friendBalance) {
// //             return res.status(404).json({ success: false, message: "Friend balance not found." });
// //         }

// //         // Update the balance amount
// //         friendBalance.balanceAmount -= settleAmount;

// //         // Save the updated balance
// //         await userBalance.save();

// //         res.status(200).json({ success: true, message: "Settlement successful." });
// //     } catch (error) {
// //         console.error("Error in settling up:", error);
// //         res.status(500).json({ success: false, message: "Settlement failed." });
// //     }
// // });










// // export default router;




// //AddFriendExpense

// // import React, { useState } from "react";
// // import { Modal, Input, DatePicker, Radio, Select, message } from "antd";
// // import {
// //     calculateExpenseBalances,
// //     settleBalances,
// //     generateFriendTransactions,
// //     postTransactionsToBackend,
// // } from "./FriendExpenseLogic";

// // function AddFriendExpense({ friends, visible, onCancel, onExpenseAdded }) {
// //     const user = JSON.parse(localStorage.getItem("User")); // Fetch the current user from localStorage

// //     const [newExpense, setNewExpense] = useState({
// //         description: "",
// //         totalAmount: "",
// //         paidBy: user._id, // Set the default "paidBy" to the current user
// //         splitOption: "percentage", // Default to percentage
// //         splitDetails: {},
// //         date: null,
// //         selectedFriends: [], // Track selected friends to split with
// //         whoPaid: [], // Track who paid
// //         amountsPaid: {}, // Track how much each person paid
// //     });

// //     const handleAddExpense = async () => {
// //         try {
// //             // Calculate the balances based on the user's input
// //             const balances = calculateExpenseBalances(newExpense, user);

// //             // Generate the transactions based on the calculated balances
// //             const settledTransactions = settleBalances(balances); // Ensure this line is present
// //             const transactions = generateFriendTransactions(settledTransactions, newExpense);

// //             // Post the transactions to the backend
// //             await postTransactionsToBackend(transactions);

// //             // For now, handle expense addition logic locally (add expense data)
// //             onExpenseAdded(); // Refresh the list of friends after adding an expense
// //             onCancel(); // Close the modal
// //         } catch (error) {
// //             console.error(error);
// //             message.error("Error adding expense.");
// //         }
// //     };

// //     return (
// //         <Modal
// //             title="Add Expense"
// //             visible={visible}
// //             onCancel={onCancel}
// //             onOk={handleAddExpense}
// //             width={600}
// //         >
// //             <Input
// //                 placeholder="Description"
// //                 value={newExpense.description}
// //                 onChange={(e) =>
// //                     setNewExpense({ ...newExpense, description: e.target.value })
// //                 }
// //                 className="mb-2"
// //             />
// //             <Input
// //                 placeholder="Total Amount"
// //                 type="number"
// //                 value={newExpense.totalAmount}
// //                 onChange={(e) =>
// //                     setNewExpense({ ...newExpense, totalAmount: e.target.value })
// //                 }
// //                 className="mb-2"
// //             />
// //             <DatePicker
// //                 className="w-full mb-2"
// //                 onChange={(date) => setNewExpense({ ...newExpense, date })}
// //             />

// //             {/* Split Between YOU and Friends */}
// //             <div className="mb-2">
// //                 <p>Split Between You and:</p>
// //                 <Select
// //                     mode="multiple"
// //                     placeholder="Select friends to split with"
// //                     value={newExpense.selectedFriends}
// //                     onChange={(value) =>
// //                         setNewExpense({ ...newExpense, selectedFriends: value })
// //                     }
// //                     style={{ width: "100%" }}
// //                 >
// //                     {friends.map((friend) => (
// //                         <Select.Option key={friend._id} value={friend._id}>
// //                             {friend.name}
// //                         </Select.Option>
// //                     ))}
// //                 </Select>
// //             </div>

// //             {/* Who Paid Option */}
// //             <div className="mb-2">
// //                 <p>Who Paid:</p>
// //                 <Select
// //                     mode="multiple"
// //                     value={newExpense.whoPaid}
// //                     onChange={(value) =>
// //                         setNewExpense({ ...newExpense, whoPaid: value })
// //                     }
// //                     style={{ width: "100%" }}
// //                 >
// //                     <Select.Option value={user._id}>YOU</Select.Option> {/* Display YOU */}
// //                     {newExpense.selectedFriends.map((friendId) => {
// //                         const friend = friends.find((f) => f._id === friendId);
// //                         return (
// //                             <Select.Option key={friendId} value={friendId}>
// //                                 {friend.name}
// //                             </Select.Option>
// //                         );
// //                     })}
// //                 </Select>
// //             </div>

// //             {/* Amount Paid by Selected */}
// //             {newExpense.whoPaid.length > 0 && (
// //                 <div className="mb-2">
// //                     <p>Enter Amount Paid by Each:</p>
// //                     {newExpense.whoPaid.map((id) => (
// //                         <Input
// //                             key={id}
// //                             type="number"
// //                             value={newExpense.amountsPaid[id] || ""}
// //                             placeholder={`Amount paid by ${id === user._id ? "YOU" : friends.find(friend => friend._id === id)?.name}`}
// //                             onChange={(e) =>
// //                                 setNewExpense({
// //                                     ...newExpense,
// //                                     amountsPaid: {
// //                                         ...newExpense.amountsPaid,
// //                                         [id]: e.target.value,
// //                                     },
// //                                 })
// //                             }
// //                             className="mb-2"
// //                         />
// //                     ))}
// //                 </div>
// //             )}

// //             {/* Adjust Split Option */}
// //             <div>
// //                 <p>Adjust Split Method:</p>
// //                 <Radio.Group
// //                     value={newExpense.splitOption}
// //                     onChange={(e) =>
// //                         setNewExpense({ ...newExpense, splitOption: e.target.value })
// //                     }
// //                 >
// //                     <Radio value="percentage">Percentage</Radio>
// //                     <Radio value="manual">Manual Amount</Radio>
// //                     <Radio value="equally">Equally</Radio> {/* Option for Equal Split */}
// //                 </Radio.Group>
// //                 <div className="mt-2">
// //                     {newExpense.splitOption === "percentage" ? (
// //                         <>
// //                             {newExpense.selectedFriends.map((friendId) => (
// //                                 <Input
// //                                     key={friendId}
// //                                     placeholder={`Percentage for ${friends.find(friend => friend._id === friendId)?.name}`}
// //                                     type="number"
// //                                     value={newExpense.splitDetails[friendId] || ""}
// //                                     onChange={(e) =>
// //                                         setNewExpense({
// //                                             ...newExpense,
// //                                             splitDetails: {
// //                                                 ...newExpense.splitDetails,
// //                                                 [friendId]: e.target.value,
// //                                             },
// //                                         })
// //                                     }
// //                                     className="mb-2"
// //                                 />
// //                             ))}
// //                             <Input
// //                                 placeholder="Your Percentage"
// //                                 type="number"
// //                                 value={newExpense.splitDetails[user._id] || ""}
// //                                 onChange={(e) =>
// //                                     setNewExpense({
// //                                         ...newExpense,
// //                                         splitDetails: {
// //                                             ...newExpense.splitDetails,
// //                                             [user._id]: e.target.value,
// //                                         },
// //                                     })
// //                                 }
// //                                 className="mb-2"
// //                             />
// //                         </>
// //                     ) : newExpense.splitOption === "manual" ? (
// //                         <>
// //                             {newExpense.selectedFriends.map((friendId) => (
// //                                 <Input
// //                                     key={friendId}
// //                                     placeholder={`Amount for ${friends.find(friend => friend._id === friendId)?.name}`}
// //                                     type="number"
// //                                     value={newExpense.splitDetails[friendId] || ""}
// //                                     onChange={(e) =>
// //                                         setNewExpense({
// //                                             ...newExpense,
// //                                             splitDetails: {
// //                                                 ...newExpense.splitDetails,
// //                                                 [friendId]: e.target.value,
// //                                             },
// //                                         })
// //                                     }
// //                                     className="mb-2"
// //                                 />
// //                             ))}
// //                             <Input
// //                                 placeholder="Your Share"
// //                                 type="number"
// //                                 value={newExpense.splitDetails[user._id] || ""}
// //                                 onChange={(e) =>
// //                                     setNewExpense({
// //                                         ...newExpense,
// //                                         splitDetails: {
// //                                             ...newExpense.splitDetails,
// //                                             [user._id]: e.target.value,
// //                                         },
// //                                     })
// //                                 }
// //                                 className="mb-2"
// //                             />
// //                         </>
// //                     ) : (
// //                         <>
// //                             {/* Display the equal share rounded to 2 decimal places */}
// //                             <p>Each participant gets an equal share: ${(parseFloat(newExpense.totalAmount) / (newExpense.selectedFriends.length + 1)).toFixed(2)}</p>
// //                         </>
// //                     )}
// //                 </div>
// //             </div>
// //         </Modal>
// //     );
// // }

// // export default AddFriendExpense;

// //FriendExpenseLogic
// // import { message } from "antd";

// // // Calculate balances for each participant
// // export const calculateExpenseBalances = (newExpense, user) => {
// //     const totalAmount = parseFloat(newExpense.totalAmount);
// //     const balances = {};

// //     // Initialize balances
// //     balances[user._id] = 0; // User starts at 0

// //     // Split option calculations
// //     if (newExpense.splitOption === "percentage") {
// //         let totalPercentage = 0;
// //         newExpense.selectedFriends.forEach((friendId) => {
// //             totalPercentage += parseFloat(newExpense.splitDetails[friendId] || 0);
// //         });

// //         // if (totalPercentage !== 100) {
// //         //     message.error("Total percentage must equal 100.");
// //         //     throw new Error("Total percentage must equal 100.");
// //         // }

// //         // Calculate balances based on percentage
// //         newExpense.selectedFriends.forEach((friendId) => {
// //             balances[friendId] = (parseFloat(newExpense.splitDetails[friendId]) / 100) * totalAmount;
// //         });
// //     } else if (newExpense.splitOption === "manual") {
// //         let totalAssigned = 0;
// //         newExpense.selectedFriends.forEach((friendId) => {
// //             balances[friendId] = parseFloat(newExpense.splitDetails[friendId] || 0);
// //             totalAssigned += balances[friendId];
// //         });

// //         if (totalAssigned !== totalAmount) {
// //             message.error("The sum of manual amounts does not match the total.");
// //             throw new Error("The sum of manual amounts does not match the total.");
// //         }
// //     } else if (newExpense.splitOption === "equally") {
// //         const numberOfParticipants = newExpense.selectedFriends.length + 1; // Include the user
// //         const equalShare = totalAmount / numberOfParticipants;

// //         balances[user._id] = equalShare;
// //         newExpense.selectedFriends.forEach((friendId) => {
// //             balances[friendId] = equalShare;
// //         });
// //     }

// //     // Calculate each member's balance (total paid - total owed)
// //     Object.keys(balances).forEach((memberId) => {
// //         // The balance is the amount paid minus the amount owed
// //         const totalPaid = parseFloat(newExpense.amountsPaid[memberId] || 0);
// //         const totalOwed = parseFloat(balances[memberId] || 0);

// //         balances[memberId] = totalPaid - totalOwed;
// //     });

// //     console.log("Calculated balances:", balances);
// //     return balances;
// // };

// // // Settle balances into transactions
// // export const settleBalances = (balances, totalAmount) => {
// //     const creditors = [];
// //     const debtors = [];

// //     // Separate creditors and debtors
// //     Object.entries(balances).forEach(([memberId, balance]) => {
// //         if (balance > 0) {
// //             creditors.push({ memberId, balance });
// //         } else if (balance < 0) {
// //             debtors.push({ memberId, balance });
// //         }
// //     });

// //     // Sort creditors and debtors
// //     creditors.sort((a, b) => b.balance - a.balance); // Largest creditor first
// //     debtors.sort((a, b) => a.balance - b.balance);   // Smallest debtor first

// //     const transactions = [];

// //     // Settle balances
// //     while (creditors.length > 0 && debtors.length > 0) {
// //         const creditor = creditors[0];
// //         const debtor = debtors[0];

// //         const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

// //         transactions.push({
// //             payerId: debtor.memberId,
// //             payeeId: creditor.memberId,
// //             amount: -amount, // Negative for payer
// //         });

// //         creditor.balance -= amount;
// //         debtor.balance += amount;

// //         if (creditor.balance === 0) creditors.shift();
// //         if (debtor.balance === 0) debtors.shift();
// //     }

// //     console.log("Settled transactions:", transactions);
// //     return transactions;
// // };

// // // Generate friend transactions for each pair
// // // Generate friend transactions for each pair
// // export const generateFriendTransactions = (settledTransactions, newExpense) => {
// //     const friendTransactions = [];

// //     settledTransactions.forEach(({ payerId, payeeId, amount }) => {
// //         // Add both the debtor and creditor transactions
// //         friendTransactions.push({
// //             user1: payerId,
// //             user2: payeeId,
// //             amount, // Negative for payer (amount owed)
// //             description: newExpense.description,
// //             date: newExpense.date || new Date(),
// //             total_amount: newExpense.totalAmount, // Correctly include total_amount in transaction
// //         });

// //         friendTransactions.push({
// //             user1: payeeId,
// //             user2: payerId,
// //             amount: -amount, // Positive for payee (amount paid back)
// //             description: newExpense.description,
// //             date: newExpense.date || new Date(),
// //             total_amount: newExpense.totalAmount, // Correctly include total_amount in transaction
// //         });
// //     });

// //     console.log("Generated friend transactions:", friendTransactions);
// //     return friendTransactions;
// // };


// // // Post transactions to the backend
// // export const postTransactionsToBackend = async (transactions) => {
// //     try {
// //         const response = await fetch("http://localhost:5000/api/friend-transactions/add", {
// //             method: "POST",
// //             headers: {
// //                 "Content-Type": "application/json",
// //             },
// //             body: JSON.stringify({ transactions }),
// //         });

// //         const data = await response.json();
// //         if (response.ok) {
// //             message.success("Transactions added successfully!");
// //         } else {
// //             message.error(data.message || "Error adding transactions.");
// //         }
// //     } catch (error) {
// //         console.error(error);
// //         message.error("Error posting transactions to the server.");
// //     }
// // };
// //ROUTES

// import express from "express";
// import friendTransaction from "../models/friendTransaction.js"; // FriendTransaction model
// import User from "../models/user.js"; // User model
// import moment from "moment";
// import FriendBalance from '../models/FriendBalance.js'; // Adjust the path according to your file structure
// import Settlement from "../models/Settlement.js";
// import multer from 'multer';

// const router = express.Router();



// // POST route to add transactions and update balance_amount
// router.post("/add", async (req, res) => {
//     console.log("=== Received request at /add ===");
//     console.log("Request body:", req.body);

//     const { transactions } = req.body;

//     // Validate request body
//     if (!transactions || !Array.isArray(transactions)) {
//         console.log("Invalid transactions data. Expecting an array.");
//         return res.status(400).json({ message: "Invalid transactions data." });
//     }

//     console.log("Number of transactions received:", transactions.length);
//     console.log("Transactions array:");
//     transactions.forEach((transaction, index) => {
//         console.log(`Transaction ${index + 1}:`, transaction);
//     });

//     try {
//         // Loop through all transactions and append usernames for user1 and user2
//         const transactionsWithNames = await Promise.all(
//             transactions.map(async (transaction) => {
//                 const user1 = await User.findById(transaction.user1);
//                 const user2 = await User.findById(transaction.user2);

//                 // Add usernames to the transaction object
//                 const updatedTransaction = {
//                     ...transaction,
//                     user1Name: user1 ? user1.name : 'Unknown User', // Handle cases where user is not found
//                     user2Name: user2 ? user2.name : 'Unknown User',
//                 };

//                 // Check if the transaction amount is negative (i.e., user1 owes user2)
//                 if (transaction.amount < 0) {
//                     // Only update the balance for user1 -> user2 using absolute value of the amount
//                     await updateFriendBalance(transaction.user1, transaction.user2, Math.abs(transaction.amount));
//                 }

//                 return updatedTransaction;
//             })
//         );

//         // Insert all transactions into the database
//         const savedTransactions = await friendTransaction.insertMany(transactionsWithNames);

//         res.status(201).json({
//             message: "Transactions added successfully!",
//             transactions: savedTransactions,
//         });
//     } catch (error) {
//         console.error("Error saving transactions:", error);
//         res.status(500).json({ message: "Failed to add transactions." });
//     }
// });

// console.log("DONE______1")
// // Helper function to update the FriendBalance model
// const updateFriendBalance = async (userId, friendId, amount) => {
//     try {
//         // Step 1: Find the FriendBalance for the user (user1)
//         let friendBalance = await FriendBalance.findOne({ userId });
//         console.log("FriendBalance for user1 found:", friendBalance);

//         // If no FriendBalance exists for user1, create one
//         if (!friendBalance) {
//             friendBalance = new FriendBalance({ userId, balances: [] });
//         }

//         // Step 2: Look for the friend's balance entry (user2)
//         const friendBalanceEntry = friendBalance.balances.find(
//             (entry) => entry.friendId.toString() === friendId.toString()
//         );
//         console.log("FriendBalance entry found for user2:", friendBalanceEntry);

//         // Step 3: If the friend is not in the balances list, add them
//         if (!friendBalanceEntry) {
//             friendBalance.balances.push({
//                 friendId,
//                 balanceAmount: Math.abs(amount), // Adding the absolute value of the amount
//             });
//         } else {
//             // Step 4: If the friend exists, update the balance
//             friendBalanceEntry.balanceAmount += Math.abs(amount); // Update with absolute value of the amount
//         }

//         // Step 5: Save the updated FriendBalance
//         await friendBalance.save();
//         console.log("Updated FriendBalance for user1:", friendBalance);
//     } catch (error) {
//         console.error("Error updating FriendBalance:", error);
//     }

// };













// router.get("/transactions/:userId/:friendId", async (req, res) => {
//     const { userId, friendId } = req.params;

//     try {
//         // Fetch transactions
//         const transactions = await friendTransaction.find({
//             $or: [
//                 { user1: userId, user2: friendId }
//             ],
//         }).lean();

//         // Add balanceMessage and format transaction details
//         const formattedTransactions = transactions.map((txn) => {
//             const isUser1 = txn.user1.toString() === userId;
//             const amount = Math.abs(txn.amount).toFixed(2);

//             const balanceMessage = isUser1
//                 ? txn.amount < 0
//                     ? `You borrowed `
//                     : `You lent`
//                 : txn.amount < 0
//                     ? `You lent `
//                     : `You borrowed`;

//             return {
//                 ...txn,
//                 total_amount: txn.total_amount,
//                 balanceMessage,
//                 formattedDate: moment(txn.date).format("DD-MM-YYYY"),
//                 formattedTime: moment(txn.date).format("HH:mm"),
//             };
//         });

//         // Fetch settlements
//         const settlements = await Settlement.find({
//             $or: [
//                 { payer: userId, payee: friendId }
//             ],
//         }).lean();

//         // Format settlement data to match transaction structure
//         const formattedSettlements = settlements.map((settle) => {
//             const isPayer = settle.payer.toString() === userId;
//             return {
//                 _id: settle._id,
//                 description: isPayer
//                     ? `You paid ₹${settle.amount} to your friend`
//                     : `Your friend paid ₹${settle.amount} to you`,
//                 date: settle.date,
//                 total_amount: "",
//                 balanceMessage: isPayer
//                     ? `You paid ₹${settle.amount}`
//                     : `You received ₹${settle.amount}`,
//                 formattedDate: moment(settle.date).format("DD-MM-YYYY"),
//                 formattedTime: moment(settle.date).format("HH:mm"),
//             };
//         });

//         // Merge transactions and settlements
//         const allRecords = [...formattedTransactions, ...formattedSettlements];

//         // Sort by date (most recent first)
//         allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

//         res.status(200).json({ transactions: allRecords });
//     } catch (error) {
//         console.error("Error fetching transactions and settlements:", error);
//         res.status(500).json({ message: "Failed to fetch data." });
//     }
// });






// // // GET route to fetch transactions for a specific user and their friend
// // router.get("/transactions/:userId/:friendId", async (req, res) => {
// //     console.log("=== Received request at /transactions ===");
// //     const { userId, friendId } = req.params;

// //     try {
// //         // Fetch all transactions between userId and friendId
// //         const transactions = await friendTransaction.find({
// //             $or: [
// //                 { user1: userId, user2: friendId }
// //             ]
// //         }
// //         ).sort({ date: -1 });


// //         if (transactions.length === 0) {
// //             return res.status(404).json({ message: "No transactions found between these users." });
// //         }

// //         // Map transactions to include 'You lent' or 'You borrowed' based on the amount sign
// //         const transactionsWithDetails = transactions.map((txn) => {
// //             let balanceMessage = '';
// //             let formattedDate = moment(txn.date).format('DD-MM-YYYY'); // Format the date

// //             // The total amount for the expense
// //             let totalAmount = txn.total_amount
// //             console.log(totalAmount)

// //             // Determine the amount based on whether the user is a lender or borrower
// //             let amount = 0;
// //             if (txn.user1.toString() === userId) {
// //                 // If user1 is the logged-in user, determine if they lent or borrowed
// //                 amount = txn.amount < 0 ? Math.abs(txn.amount).toFixed(2) : Math.abs(txn.amount).toFixed(2);
// //                 balanceMessage = txn.amount < 0 ? `You borrowed ₹${amount}` : `You lent ₹${amount}`;
// //             } else {
// //                 // If user2 is the logged-in user
// //                 amount = txn.amount < 0 ? Math.abs(txn.amount).toFixed(2) : Math.abs(txn.amount).toFixed(2);
// //                 balanceMessage = txn.amount < 0 ? `You lent ₹${amount}` : `You borrowed ₹${amount}`;
// //             }

// //             return {
// //                 ...txn.toObject(),
// //                 totalAmount,  // Showing the total amount of the transaction
// //                 amount,  // Individual user's owed/lent amount
// //                 balanceMessage, // Adding the balance message to each transaction
// //                 formattedDate,
// //                 formattedTime: moment(txn.date).format('HH:mm') // Formatting time to show hours only
// //             };
// //         });

// //         res.status(200).json({
// //             transactions: transactionsWithDetails,
// //         });
// //     } catch (error) {
// //         console.error("Error fetching transactions:", error);
// //         res.status(500).json({ message: "Failed to fetch transactions." });
// //     }
// // });













// // Backend: balance calculation route

// router.get("/balance/:userId/:friendId", async (req, res) => {
//     console.log("WELCOME AGAIN FIXING BALANCE-1")
//     try {
//         const { userId, friendId } = req.params;

//         console.log(`user ${userId} friend ${friendId}`);

//         // Fetch the balance of the logged-in user (A)
//         const userBalance = await FriendBalance.findOne({ userId: userId });
//         console.log(`userBalance: ${userBalance}`);

//         let userFriendBalance = 0; // Default balance if not found
//         console.log(`userFriendBalance-1: ${userFriendBalance}`);

//         // If userBalance is found, check if friend exists in balances array
//         if (userBalance) {
//             const balance = userBalance.balances.find(
//                 (balance) => balance.friendId.toString() === friendId
//             );
//             if (balance) {
//                 userFriendBalance = balance.balanceAmount;
//             }
//         }
//         // If no balance data is found, the default value remains 0
//         console.log(`userFriendBalance-2: ${userFriendBalance}`);
//         // Fetch the balance of the friend's account (B)
//         const friendBalance = await FriendBalance.findOne({ userId: friendId });
//         console.log(`friendbalance ${friendBalance} `)

//         let friendUserBalance = 0;

//         if (friendBalance) {
//             const balance = friendBalance.balances.find(
//                 (balance) => balance.friendId.toString() === userId
//             );
//             if (balance) {
//                 friendUserBalance = balance.balanceAmount;
//             }
//         }

//         console.log(`user-friend-Balance ${userFriendBalance}`);
//         console.log(`friend-user-Balance ${friendUserBalance}`);

//         // Fetch the friend's details
//         const friend = await User.findById(friendId);
//         if (!friend) {
//             return res.status(404).json({ message: "Friend not found." });
//         }

//         const friendName = friend.name;

//         // Calculate the difference between user and friend's balance
//         const balanceDifference = userFriendBalance - friendUserBalance;
//         let balanceMessage = '';

//         // Determine the message based on who owes whom
//         if (balanceDifference > 0) {
//             balanceMessage = `You owe ${friendName} ₹${balanceDifference}`;
//         } else if (balanceDifference < 0) {
//             balanceMessage = `${friendName} owes you ₹${Math.abs(balanceDifference)}`;
//         } else {
//             balanceMessage = `Everything is settled between you and ${friendName}.`;
//         }

//         res.status(200).json({
//             balanceMessage,
//         });
//     } catch (error) {
//         console.error("Error calculating balance:", error);
//         res.status(500).json({ message: "Failed to calculate balance." });
//     }
// });








// Settle Up Route
// POST route to settle up
// router.post("/settle-up", async (req, res) => {
//     const { userId, friendId, settleAmount } = req.body;

//     try {
//         // Find the balance record for the user
//         const userBalance = await FriendBalance.findOne({ userId });

//         if (!userBalance) {
//             return res.status(404).json({ success: false, message: "Balance record not found." });
//         }

//         // Find the specific friend's balance
//         const friendBalance = userBalance.balances.find(
//             (balance) => balance.friendId.toString() === friendId
//         );

//         if (!friendBalance) {
//             return res.status(404).json({ success: false, message: "Friend balance not found." });
//         }

//         // Update the balance amount
//         friendBalance.balanceAmount -= settleAmount;

//         // Save the updated balance
//         await userBalance.save();

//         res.status(200).json({ success: true, message: "Settlement successful." });
//     } catch (error) {
//         console.error("Error in settling up:", error);
//         res.status(500).json({ success: false, message: "Settlement failed." });
//     }
// });


router.post("/settle-up", async (req, res) => {
    const { userId, friendId, settleAmount } = req.body;

    try {
        // Update the balance
        const userBalance = await FriendBalance.findOne({ userId });

        if (!userBalance) {
            return res.status(404).json({ success: false, message: "Balance record not found." });
        }

        const friendBalance = userBalance.balances.find(
            (balance) => balance.friendId.toString() === friendId
        );

        if (!friendBalance) {
            return res.status(404).json({ success: false, message: "Friend balance not found." });
        }

        friendBalance.balanceAmount -= settleAmount;
        await userBalance.save();

        // Log the settlement
        await Settlement.create({
            payer: userId,
            payee: friendId,
            amount: settleAmount,
        });

        res.status(200).json({ success: true, message: "Settlement successful." });
    } catch (error) {
        console.error("Error in settling up:", error);
        res.status(500).json({ success: false, message: "Settlement failed." });
    }
});









export default router;
