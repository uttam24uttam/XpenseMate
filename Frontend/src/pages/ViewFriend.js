// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { message, Button } from "antd";
// import axios from "axios";
// import DefaultLayout from "../components/DefaultLayout";
// import moment from "moment";
// import SettleUp from "../components/SettleUpComponent";
// import {
//     ShoppingCartOutlined,
//     CoffeeOutlined,
//     AccountBookOutlined,    //entertainment icon
//     RocketOutlined,
//     CreditCardOutlined,    //for shopping icon
//     HomeOutlined,
//     CarOutlined,
//     GiftOutlined,
//     WalletOutlined,
//     CheckCircleFilled,    // for paid icon

// } from '@ant-design/icons';
// import { UserOutlined } from '@ant-design/icons'; //for profile pic

// import { Avatar } from 'antd';
// function ViewFriend() {
//     const { friendId } = useParams();    //friend id from the url params -> whose pge is being viewed
//     const [friendDetails, setFriendDetails] = useState({});
//     const [transactions, setTransactions] = useState([]);
//     const [balance, setBalance] = useState(0);
//     const [balanceMessage, setBalanceMessage] = useState(""); //for balanceMessage
//     const [settleUpModalVisible, setSettleUpModalVisible] = useState(false);

//     const categories = [
//         { label: "Groceries", value: "groceries", icon: <ShoppingCartOutlined /> },
//         { label: "Food & Drinks", value: "food_drinks", icon: <CoffeeOutlined /> },
//         { label: "Entertainment", value: "entertainment", icon: <AccountBookOutlined /> },
//         { label: "Travel", value: "travel", icon: <RocketOutlined /> },
//         { label: "Shopping", value: "shopping", icon: <CreditCardOutlined /> },
//         { label: "Rent", value: "rent", icon: <HomeOutlined /> },
//         { label: "Transportation", value: "transportation", icon: <CarOutlined /> },
//         { label: "Gifts", value: "gifts", icon: <GiftOutlined /> },
//         { label: "Others", value: "others", icon: <WalletOutlined /> },
//         { label: "Paid", value: "paid", icon: <CheckCircleFilled /> },

//     ];



//     const fetchFriendDetails = async () => {
//         try {
//             const user = JSON.parse(localStorage.getItem("User")); // Get user

//             if (!user || !user._id) {
//                 message.error("User not logged in.");
//                 return;
//             }

//             // fetching  friend details
//             const friendResponse = await axios.get(
//                 `http://localhost:5000/api/friends/get-friend-details/${friendId}`
//             );

//             if (!friendResponse.data.success || !friendResponse.data.friend) {
//                 throw new Error("Friend details not found.");
//             }

//             setFriendDetails(friendResponse.data.friend);

//             // Fetch balance message
//             try {
//                 const balanceResponse = await axios.get(
//                     `http://localhost:5000/api/friend-transactions/balance/${user._id}/${friendId}`
//                 );

//                 if (balanceResponse.data.balanceMessage) {
//                     setBalanceMessage(balanceResponse.data.balanceMessage); // Set balanceMessage here
//                 }
//             } catch (balanceError) {
//                 console.error("Error fetching balance:", balanceError);
//                 setBalanceMessage("Error fetching balance information.");
//             }

//             // fetch all friend-transactions
//             const transactionsResponse = await axios.get(
//                 `/api/friend-transactions/transactions/${user._id}/${friendId}`
//             );

//             setTransactions(transactionsResponse.data.transactions);
//             setBalance(transactionsResponse.data.balance);
//         } catch (error) {
//             console.error(error);
//             message.error("Error fetching friend details.");
//         }
//     };

//     const handleSettleUp = async (settleAmount) => {
//         try {
//             const user = JSON.parse(localStorage.getItem("User"));
//             const userId = user ? user._id : null;

//             if (!userId) {
//                 message.error("User not logged in.");
//                 return;
//             }

//             const response = await axios.post("http://localhost:5000/api/friend-transactions/settle-up", {
//                 userId,
//                 friendId,
//                 settleAmount: Number(settleAmount),
//             });

//             if (response.status === 200) {
//                 message.success("Settled successfully!");
//                 setSettleUpModalVisible(false);

//                 // Update balance and transactions 
//                 setBalance((prev) => prev - settleAmount);
//                 fetchFriendDetails();
//             } else {
//                 message.error(response.data.message || "Settlement failed.");
//             }
//         } catch (error) {
//             console.error(error);
//             message.error("Error settling the transaction.");
//         }
//     };

//     useEffect(() => {
//         fetchFriendDetails();
//     }, [friendId]);

//     return (
//         <DefaultLayout>
//             <div className="p-6">
//                 {/* Friend details and Balance */}

//                 <div className="p-6">
//                     <div className="flex justify-between items-center mb-6 py-8 border-b border-gray-300">
//                         {/* Friend Details and Profile Picture */}
//                         <div className="flex items-center w-1/2 pr-6 ml-20">
//                             <Avatar
//                                 icon={<UserOutlined />}
//                                 size={64}
//                                 className="mr-3 ml-20"
//                             />
//                             <div className="text-center ml-0">
//                                 <h1 className="text-3xl font-bold text-gray-800">{friendDetails.name}</h1>
//                                 <p className="text-xl text-gray-600">{friendDetails.email}</p>
//                             </div>
//                         </div>

//                         {/* Balance Message */}
//                         <div className="w-1/2 p-6 text-center">
//                             <p className="text-2xl font-semibold text-gray-800">
//                                 {balanceMessage || "Balance message loading..."}
//                             </p>
//                         </div>
//                     </div>

//                     {/* Settle Up Button */}
//                     <div className="flex justify-center mt-8">
//                         <Button
//                             type="primary"
//                             onClick={() => setSettleUpModalVisible(true)}
//                             disabled={
//                                 balanceMessage?.toLowerCase().includes("owes") || balanceMessage?.toLowerCase().includes("settled") //Disable button if everything settled + friend owes
//                             }
//                             size="large"
//                             className="bg-[#546E7A] hover:bg-[#4a5d66] text-white font-bold p-2 px-4 border border-blue-700 rounded-lg text-sm"
//                         >
//                             Settle Up
//                         </Button>

//                     </div>
//                 </div>


//             </div>

//             {/* TRANSACTIONS */}
//             <div>
//                 <h2 className="text-2xl font-bold mb-4">Transactions</h2>
//                 {transactions.length > 0 ? (
//                     transactions.map((txn) => (
//                         <div
//                             key={txn._id}
//                             className="grid grid-cols-4 gap-4 p-4 bg-gray-100 mb-4 rounded-lg shadow-lg"
//                         >
//                             {/* Date & Time */}
//                             <div className="flex flex-col items-start">
//                                 <p className="text-sm font-medium text-gray-700">
//                                     {moment(txn.date).format("HH:mm A")}
//                                 </p>
//                                 <p className="text-sm text-gray-500">
//                                     {moment(txn.date).format("DD MMM YYYY")}
//                                 </p>
//                             </div>

//                             {/* Category*/}
//                             <div className="flex items-center space-x-2">
//                                 {categories.map((category) =>
//                                     txn.category === category.value ? (
//                                         <div key={category.value} className="flex items-center space-x-2">
//                                             <div className="text-xl">{category.icon}</div>
//                                             <p className="text-sm text-gray-700">{category.label}</p>
//                                         </div>
//                                     ) : null
//                                 )}
//                             </div>

//                             {/* Description */}
//                             <div className="flex flex-col items-center mr-10 mt-4">
//                                 <p className={`text-sm font-bold ${txn.total_amount === "" ? "text-4xl" : "text-gray-800"}`}>
//                                     {txn.description}
//                                 </p>
//                                 {txn.total_amount !== "" && (
//                                     <p className="text-sm text-gray-600 mt-2">Total Amount: ₹{txn.total_amount}</p>
//                                 )}
//                             </div>

//                             {/* Balance Message */}
//                             <div className="flex flex-col items-center">
//                                 <p
//                                     className={`text-sm font-medium ${txn.balanceMessage?.includes("borrowed")
//                                         ? "text-red-500"
//                                         : txn.balanceMessage?.includes("lent")
//                                             ? "text-green-500"
//                                             : txn.balanceMessage?.includes("paid")
//                                                 ? "text-gray-500"
//                                                 : "text-gray-500"
//                                         }`}
//                                 >
//                                     {txn.balanceMessage?.includes("paid")
//                                         ? `You paid Rs`
//                                         : txn.balanceMessage || "No Balance Info"}
//                                 </p>
//                                 {txn.balanceMessage && txn.amount && (
//                                     <p
//                                         className={`text-lg font-bold mt-1 ${txn.balanceMessage?.includes("borrowed")
//                                             ? "text-red-500"
//                                             : txn.balanceMessage?.includes("lent")
//                                                 ? "text-green-500"
//                                                 : "text-gray-500"
//                                             }`}
//                                     >
//                                         ₹{Math.abs(txn.amount).toFixed(0)}
//                                     </p>
//                                 )}
//                             </div>
//                         </div>
//                     ))
//                 ) : (
//                     <p className="text-gray-500">No transactions found.</p>
//                 )}
//             </div>


//             <SettleUp
//                 visible={settleUpModalVisible}
//                 onCancel={() => setSettleUpModalVisible(false)} //works only on condition 
//                 onSettleUp={handleSettleUp}
//             />
//         </DefaultLayout>
//     );



// }

// export default ViewFriend;






// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { message, Button } from "antd";
// import axios from "axios";
// import DefaultLayout from "../components/DefaultLayout";
// import moment from "moment";
// import SettleUp from "../components/SettleUpComponent";
// import {
//     ShoppingCartOutlined,
//     CoffeeOutlined,
//     AccountBookOutlined,
//     RocketOutlined,
//     CreditCardOutlined,
//     HomeOutlined,
//     CarOutlined,
//     GiftOutlined,
//     WalletOutlined,
//     CheckCircleFilled,
//     UserOutlined
// } from '@ant-design/icons';
// import { Avatar } from 'antd';

// function ViewFriend() {
//     const { friendId } = useParams();
//     const [friendDetails, setFriendDetails] = useState({});
//     const [transactions, setTransactions] = useState([]);
//     const [balance, setBalance] = useState(0);
//     const [balanceMessage, setBalanceMessage] = useState("");
//     const [settleUpModalVisible, setSettleUpModalVisible] = useState(false);

//     const categories = [
//         { label: "Groceries", value: "groceries", icon: <ShoppingCartOutlined /> },
//         { label: "Food & Drinks", value: "food_drinks", icon: <CoffeeOutlined /> },
//         { label: "Entertainment", value: "entertainment", icon: <AccountBookOutlined /> },
//         { label: "Travel", value: "travel", icon: <RocketOutlined /> },
//         { label: "Shopping", value: "shopping", icon: <CreditCardOutlined /> },
//         { label: "Rent", value: "rent", icon: <HomeOutlined /> },
//         { label: "Transportation", value: "transportation", icon: <CarOutlined /> },
//         { label: "Gifts", value: "gifts", icon: <GiftOutlined /> },
//         { label: "Others", value: "others", icon: <WalletOutlined /> },
//         { label: "Paid", value: "paid", icon: <CheckCircleFilled /> },
//     ];

//     const fetchFriendDetails = async () => {
//         try {
//             const user = JSON.parse(localStorage.getItem("User"));
//             if (!user || !user._id) {
//                 message.error("User not logged in.");
//                 return;
//             }

//             //friend name+mail
//             const friendResponse = await axios.get(
//                 `http://localhost:5000/api/friends/get-friend-details/${friendId}`
//             );

//             if (!friendResponse.data.success || !friendResponse.data.friend) {
//                 throw new Error("Friend details not found.");
//             }

//             setFriendDetails(friendResponse.data.friend);

//             //overall friend balance
//             const balanceResponse = await axios.get(
//                 `http://localhost:5000/api/friend-transactions/balance/${user._id}/${friendId}`
//             );

//             if (balanceResponse.data.balanceMessage) {
//                 setBalanceMessage(balanceResponse.data.balanceMessage);
//             }


//             //transaction list
//             const transactionsResponse = await axios.get(
//                 `http://localhost:5000/api/friend-transactions/transactions/${user._id}/${friendId}`
//             );

//             setTransactions(transactionsResponse.data.transactions);
//             setBalance(transactionsResponse.data.balance);

//         } catch (error) {
//             console.error(error);
//             message.error("Error fetching friend details.");
//         }
//     };


//     //settle amount
//     const handleSettleUp = async (settleAmount) => {
//         try {
//             const user = JSON.parse(localStorage.getItem("User"));
//             const userId = user ? user._id : null;

//             if (!userId) {
//                 message.error("User not logged in.");
//                 return;
//             }

//             const response = await axios.post("http://localhost:5000/api/friend-transactions/settle-up", {
//                 userId,
//                 friendId,
//                 settleAmount: Number(settleAmount),
//             });

//             if (response.status === 200) {
//                 message.success("Settled successfully!");
//                 setSettleUpModalVisible(false);
//                 setBalance((prev) => prev - settleAmount);
//                 fetchFriendDetails();
//             } else {
//                 message.error(response.data.message || "Settlement failed.");
//             }
//         } catch (error) {
//             console.error(error);
//             message.error("Error settling the transaction.");
//         }
//     };

//     useEffect(() => {
//         fetchFriendDetails();
//     }, [friendId]);

//     return (
//         <DefaultLayout>
//             <div className="p-6">
//                 <div className="p-6">
//                     <div className="flex justify-between items-center mb-6 py-8 border-b border-gray-300">
//                         <div className="flex items-center w-1/2 pr-6 ml-20">
//                             <Avatar
//                                 icon={<UserOutlined />}
//                                 size={64}
//                                 className="mr-3 ml-20"
//                             />
//                             <div className="text-center ml-0">
//                                 <h1 className="text-3xl font-bold text-gray-800">{friendDetails.name}</h1>
//                                 <p className="text-xl text-gray-600">{friendDetails.email}</p>
//                             </div>
//                         </div>

//                         <div className="w-1/2 p-6 text-center">
//                             <p className="text-2xl font-semibold text-gray-800">
//                                 {balanceMessage || "Balance message loading..."}
//                             </p>
//                         </div>
//                     </div>

//                     <div className="flex justify-center mt-8">
//                         <Button
//                             type="primary"
//                             onClick={() => setSettleUpModalVisible(true)}
//                             disabled={
//                                 balanceMessage?.toLowerCase().includes("owes") ||
//                                 balanceMessage?.toLowerCase().includes("settled")
//                             }
//                             size="large"
//                             className="bg-[#546E7A] hover:bg-[#4a5d66] text-white font-bold p-2 px-4 border border-blue-700 rounded-lg text-sm"
//                         >
//                             Settle Up
//                         </Button>
//                     </div>
//                 </div>
//             </div>

//             <div>
//                 <h2 className="text-2xl font-bold mb-4">Transactions</h2>
//                 {transactions.length > 0 ? (
//                     [...transactions]
//                         .sort((a, b) => new Date(b.date) - new Date(a.date))
//                         .map((txn) => (

//                             <div
//                                 key={txn._id}
//                                 className="grid grid-cols-4 gap-4 p-4 bg-gray-100 mb-4 rounded-lg shadow-lg"
//                             >
//                                 <div className="flex flex-col items-start">
//                                     <p className="text-sm font-medium text-gray-700">
//                                         {moment(txn.date).format("HH:mm A")}
//                                     </p>
//                                     <p className="text-sm text-gray-500">
//                                         {moment(txn.date).format("DD MMM YYYY")}
//                                     </p>
//                                 </div>

//                                 <div className="flex items-center space-x-2">
//                                     {txn.category === "Settlement" ? (
//                                         <div className="flex items-center space-x-2">
//                                             <div className="text-xl text-green-600"><CheckCircleFilled /></div>
//                                             <p className="text-sm text-green-700 font-semibold">Settlement</p>
//                                         </div>
//                                     ) : (
//                                         categories.map((category) =>
//                                             txn.category === category.value ? (
//                                                 <div key={category.value} className="flex items-center space-x-2">
//                                                     <div className="text-xl">{category.icon}</div>
//                                                     <p className="text-sm text-gray-700">{category.label}</p>
//                                                 </div>
//                                             ) : null
//                                         )
//                                     )}
//                                 </div>

//                                 <div className="flex flex-col items-center mr-10 mt-4">
//                                     <p className={`text-sm font-bold ${txn.total_amount === "" ? "text-4xl" : "text-gray-800"}`}>
//                                         {txn.description}
//                                     </p>
//                                     {(txn.totalAmount || txn.total_amount) && (
//                                         <p className="text-sm text-gray-600 mt-2">
//                                             Total Amount: ₹{txn.totalAmount || txn.total_amount}
//                                         </p>
//                                     )}
//                                 </div>

//                                 <div className="flex flex-col items-center">
//                                     <p
//                                         className={`text-sm font-medium ${txn.balanceMessage?.includes("borrowed")
//                                             ? "text-red-500"
//                                             : txn.balanceMessage?.includes("lent")
//                                                 ? "text-green-500"
//                                                 : txn.balanceMessage?.includes("paid")
//                                                     ? "text-gray-500"
//                                                     : "text-gray-500"
//                                             }`}
//                                     >
//                                         {txn.balanceMessage?.includes("paid")
//                                             ? `You paid Rs`
//                                             : txn.balanceMessage || "No Balance Info"}
//                                     </p>
//                                     {txn.balanceMessage && txn.amount && (
//                                         <p
//                                             className={`text-lg font-bold mt-1 ${txn.balanceMessage?.includes("borrowed")
//                                                 ? "text-red-500"
//                                                 : txn.balanceMessage?.includes("lent")
//                                                     ? "text-green-500"
//                                                     : "text-gray-500"
//                                                 }`}
//                                         >
//                                             ₹{Math.abs(txn.amount).toFixed(0)}
//                                         </p>
//                                     )}
//                                 </div>
//                             </div>
//                         ))
//                 ) : (
//                     <p className="text-gray-500">No transactions found.</p>
//                 )}
//             </div>

//             <SettleUp
//                 visible={settleUpModalVisible}
//                 onCancel={() => setSettleUpModalVisible(false)}
//                 onSettleUp={handleSettleUp}
//             />
//         </DefaultLayout>
//     );
// }

// export default ViewFriend;

























import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { message, Button } from "antd";
import axios from "axios";
import DefaultLayout from "../components/DefaultLayout";
import moment from "moment";
import SettleUp from "../components/SettleUpComponent";
import {
    ShoppingCartOutlined,
    CoffeeOutlined,
    AccountBookOutlined,
    RocketOutlined,
    CreditCardOutlined,
    HomeOutlined,
    CarOutlined,
    GiftOutlined,
    WalletOutlined,
    CheckCircleFilled,
    UserOutlined
} from '@ant-design/icons';
import { Avatar } from 'antd';

function ViewFriend() {
    const { friendId } = useParams();
    const [friendDetails, setFriendDetails] = useState({});
    const [transactions, setTransactions] = useState([]);
    // FIX: Removed unused 'balance' state variable. The 'balanceMessage' is used for display.
    const [balanceMessage, setBalanceMessage] = useState("");
    const [settleUpModalVisible, setSettleUpModalVisible] = useState(false);

    const categories = [
        { label: "Groceries", value: "groceries", icon: <ShoppingCartOutlined /> },
        { label: "Food & Drinks", value: "food_drinks", icon: <CoffeeOutlined /> },
        { label: "Entertainment", value: "entertainment", icon: <AccountBookOutlined /> },
        { label: "Travel", value: "travel", icon: <RocketOutlined /> },
        { label: "Shopping", value: "shopping", icon: <CreditCardOutlined /> },
        { label: "Rent", value: "rent", icon: <HomeOutlined /> },
        { label: "Transportation", value: "transportation", icon: <CarOutlined /> },
        { label: "Gifts", value: "gifts", icon: <GiftOutlined /> },
        { label: "Others", value: "others", icon: <WalletOutlined /> },
        { label: "Paid", value: "paid", icon: <CheckCircleFilled /> },
    ];

    // FIX: Wrapped the fetch function in useCallback to create a stable function reference.
    const fetchFriendDetails = useCallback(async () => {
        try {
            const user = JSON.parse(localStorage.getItem("User"));
            const userId = user?.user?._id || user?.user?.id || user?._id || user?.id;
            if (!user || !userId) {
                message.error("User not logged in.");
                return;
            }

            //friend name+mail
            const friendResponse = await axios.get(
                `http://localhost:5000/api/friends/get-friend-details/${friendId}`
            );

            if (!friendResponse.data.success || !friendResponse.data.friend) {
                throw new Error("Friend details not found.");
            }

            setFriendDetails(friendResponse.data.friend);

            //overall friend balance
            const balanceResponse = await axios.get(
                `http://localhost:5000/api/friend-transactions/balance/${userId}/${friendId}`
            );

            if (balanceResponse.data.balanceMessage) {
                setBalanceMessage(balanceResponse.data.balanceMessage);
            }

            //transaction list
            const transactionsResponse = await axios.get(
                `http://localhost:5000/api/friend-transactions/transactions/${userId}/${friendId}`
            );

            setTransactions(transactionsResponse.data.transactions);
            // The 'balance' state was removed, so this line is no longer needed.
            // setBalance(transactionsResponse.data.balance);

        } catch (error) {
            console.error(error);
            message.error("Error fetching friend details.");
        }
    }, [friendId]); // friendId is a dependency of this function.


    //settle amount
    const handleSettleUp = async (settleAmount) => {
        try {
            const user = JSON.parse(localStorage.getItem("User"));
            const userId = user?.user?._id || user?.user?.id || user?._id || user?.id || null;

            if (!userId) {
                message.error("User not logged in.");
                return;
            }

            const response = await axios.post("http://localhost:5000/api/friend-transactions/settle-up", {
                userId,
                friendId,
                settleAmount: Number(settleAmount),
            });

            if (response.status === 200) {
                message.success("Settled successfully!");
                setSettleUpModalVisible(false);
                // The 'balance' state was removed, so this line is no longer needed.
                // setBalance((prev) => prev - settleAmount);
                fetchFriendDetails(); // Refetch all data to ensure consistency.
            } else {
                message.error(response.data.message || "Settlement failed.");
            }
        } catch (error) {
            console.error(error);
            message.error("Error settling the transaction.");
        }
    };

    // FIX: Added 'fetchFriendDetails' to the dependency array.
    useEffect(() => {
        fetchFriendDetails();
    }, [fetchFriendDetails]);

    return (
        <DefaultLayout>
            <div className="p-6">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6 py-8 border-b border-gray-300">
                        <div className="flex items-center w-1/2 pr-6 ml-20">
                            <Avatar
                                icon={<UserOutlined />}
                                size={64}
                                className="mr-3 ml-20"
                            />
                            <div className="text-center ml-0">
                                <h1 className="text-3xl font-bold text-gray-800">{friendDetails.name}</h1>
                                <p className="text-xl text-gray-600">{friendDetails.email}</p>
                            </div>
                        </div>

                        <div className="w-1/2 p-6 text-center">
                            <p className="text-2xl font-semibold text-gray-800">
                                {balanceMessage || "Balance message loading..."}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center mt-8">
                        <Button
                            type="primary"
                            onClick={() => setSettleUpModalVisible(true)}
                            disabled={
                                balanceMessage?.toLowerCase().includes("owes") ||
                                balanceMessage?.toLowerCase().includes("settled")
                            }
                            size="large"
                            className="bg-[#546E7A] hover:bg-[#4a5d66] text-white font-bold p-2 px-4 border border-blue-700 rounded-lg text-sm"
                        >
                            Settle Up
                        </Button>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4">Transactions</h2>
                {transactions.length > 0 ? (
                    [...transactions]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((txn) => (

                            <div
                                key={txn._id}
                                className="grid grid-cols-4 gap-4 p-4 bg-gray-100 mb-4 rounded-lg shadow-lg"
                            >
                                <div className="flex flex-col items-start">
                                    <p className="text-sm font-medium text-gray-700">
                                        {moment(txn.date).format("HH:mm A")}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {moment(txn.date).format("DD MMM YYYY")}
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {txn.category === "Settlement" ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="text-xl text-green-600"><CheckCircleFilled /></div>
                                            <p className="text-sm text-green-700 font-semibold">Settlement</p>
                                        </div>
                                    ) : (
                                        categories.map((category) =>
                                            txn.category === category.value ? (
                                                <div key={category.value} className="flex items-center space-x-2">
                                                    <div className="text-xl">{category.icon}</div>
                                                    <p className="text-sm text-gray-700">{category.label}</p>
                                                </div>
                                            ) : null
                                        )
                                    )}
                                </div>

                                <div className="flex flex-col items-center mr-10 mt-4">
                                    <p className={`text-sm font-bold ${txn.total_amount === "" ? "text-4xl" : "text-gray-800"}`}>
                                        {txn.description}
                                    </p>
                                    {(txn.totalAmount || txn.total_amount) && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            Total Amount: ₹{txn.totalAmount || txn.total_amount}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col items-center">
                                    <p
                                        className={`text-sm font-medium ${txn.balanceMessage?.includes("borrowed")
                                            ? "text-red-500"
                                            : txn.balanceMessage?.includes("lent")
                                                ? "text-green-500"
                                                : txn.balanceMessage?.includes("paid")
                                                    ? "text-gray-500"
                                                    : "text-gray-500"
                                            }`}
                                    >
                                        {txn.balanceMessage?.includes("paid")
                                            ? `You paid Rs`
                                            : txn.balanceMessage || "No Balance Info"}
                                    </p>
                                    {txn.balanceMessage && txn.amount && (
                                        <p
                                            className={`text-lg font-bold mt-1 ${txn.balanceMessage?.includes("borrowed")
                                                ? "text-red-500"
                                                : txn.balanceMessage?.includes("lent")
                                                    ? "text-green-500"
                                                    : "text-gray-500"
                                                }`}
                                        >
                                            ₹{Math.abs(txn.amount).toFixed(0)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                ) : (
                    <p className="text-gray-500">No transactions found.</p>
                )}
            </div>

            <SettleUp
                visible={settleUpModalVisible}
                onCancel={() => setSettleUpModalVisible(false)}
                onSettleUp={handleSettleUp}
            />
        </DefaultLayout>
    );
}

export default ViewFriend;

// localStorage in browsers can only store strings, not objects, arrays, or numbers directly.

//setItem:
// setItem(stringKey, stringValue)
// localStorage.setItem("User", JSON.stringify(userObject));
// JSON.stringify(...) → converts a JavaScript object into a JSON string.

//getItem:
// localStorage.getItem("User") → retrieves the stored value (always as a string).
// JSON.parse(...) → converts that JSON string back into a JavaScript object.
// const user = JSON.parse(localStorage.getItem("User"));


// Page → Usually a component that is tied to a route and represents a full view in your app.

// States
// friendDetails
// transactions
// balanceMessage
// settleUpModalVisible

// Functions
// fetchFriendDetails
// handleSettleUp

// API Calls
// GET /api/friends/get-friend-details/:friendId
// GET /api/friend-transactions/balance/:userId/:friendId
// GET /api/friend-transactions/transactions/:userId/:friendId
// POST /api/friend-transactions/settle-up