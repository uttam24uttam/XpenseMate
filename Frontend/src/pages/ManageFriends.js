import React, { useState, useEffect } from "react";
import { Button, message, Modal, Input } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DefaultLayout from "../components/DefaultLayout";
import AddFriendExpense from "../components/AddFriendExpense"; // Import the new component
import { UserAddOutlined, SplitCellsOutlined } from '@ant-design/icons';

function ManageFriends() {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchEmail, setSearchEmail] = useState("");
    const [showAddFriendModal, setShowAddFriendModal] = useState(false);
    const [addExpenseModalVisible, setAddExpenseModalVisible] = useState(false);
    const [overallBalanceMessage, setOverallBalanceMessage] = useState(""); // For displaying the overall balance message
    const navigate = useNavigate();

    // friends list for the logged-in user is fetched here
    const getFriends = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem("User"));
            const userId = user?.user?._id || user?.user?.id || user?._id || user?.id;
            const response = await axios.get(`/api/friends/get-friends`);
            setFriends(response.data);
        } catch (error) {
            console.error(error);
            message.error("Error fetching friends.");
        } finally {
            setLoading(false);
        }
    };

    // overall balance message for the logged-in user is fetched 
    const getOverallBalance = async () => {
        const user = JSON.parse(localStorage.getItem("User"));
        const userId = user?.user?._id || user?.user?.id || user?._id || user?.id;
        try {
            const response = await axios.get(`/api/friends/get-overall-balance`);
            setOverallBalanceMessage(response.data.message || "");
        } catch (error) {
            console.error(error);
            message.error("Error fetching overall balance.");
        }
    };

    // adding a friend by email is handled
    const handleAddFriend = async () => {
        if (!searchEmail) {
            message.warning("Please enter an email.");
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem("User"));
            const userId = user?.user?._id || user?.user?.id || user?._id || user?.id;
            const response = await axios.post("/api/friends/add-friend", {
                userId: userId,
                friendEmail: searchEmail,   //email of friend
            });

            message.success(response.data.message);
            setSearchEmail("");
            setShowAddFriendModal(false);
            getFriends();
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || "Error adding friend.");
        }
    };

    useEffect(() => {
        getFriends();
        getOverallBalance(); //overall balance when the component loads
    }, []);

    return (
        <DefaultLayout>
            <div className="p-4">
                {/* Header of the page , add Friends opton + Balance message + split expese option  */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold">Your Friends</h1>
                    <div className="flex gap-4">
                        <Button
                            type="primary"
                            className="bg-[#546E7A] hover:bg-[#4a5d66] text-white font-bold p-2 px-4 border border-blue-700 rounded-lg text-sm"
                            onClick={() => setShowAddFriendModal(true)}
                        >
                            <UserAddOutlined className="mr-0" /> Add Friend  {/* outline icon */}
                        </Button>

                        <Button
                            type="primary"
                            className="bg-[#546E7A] hover:bg-[#4a5d66] text-white font-bold p-2 px-4 border border-blue-700 rounded-lg text-sm"
                            onClick={() => setAddExpenseModalVisible(true)}
                        >
                            <SplitCellsOutlined className="mr-0" /> Split Expense {/* iconon + option */}
                        </Button>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">Overall Balance</h2>
                    <p
                        className={`text-xl ${(overallBalanceMessage || '').toLowerCase().includes('settled') ? 'text-gray-700' : (overallBalanceMessage || '').toLowerCase().includes('owed') ? 'text-green-800' : 'text-red-800'
                            }`}
                    >
                        {overallBalanceMessage || ''}
                    </p>
                </div>


                <div>                  {/* friends List Section */}

                    {loading ? (
                        <p>Loading friends...</p>
                    ) : friends.length > 0 ? (
                        friends.map((friend) => (
                            <div
                                key={friend._id}
                                className="  p-4 bg-gray-100 rounded-md mb-4 flex justify-between items-center shadow-md"
                            >
                                <span className="ml-7">{friend.name}</span>
                                <Button
                                    type="link"
                                    onClick={() => navigate(`/friends/view/${(friend._id && friend._id.toString) ? friend._id.toString() : friend._id}`)} //navigate to thaht friend's viewfriend page
                                >
                                    View Details
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p>No friends found.</p>
                    )}
                </div>
            </div>

            <Modal        //Add friend option from firnd expense logic 
                title="Add Friend"
                open={showAddFriendModal}
                onCancel={() => setShowAddFriendModal(false)}
                onOk={handleAddFriend}
                okText="Add"
            >
                <Input
                    placeholder="Enter friend's email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                />
            </Modal>

            <AddFriendExpense //add expense logic optoin
                friends={friends}
                visible={addExpenseModalVisible}
                onCancel={() => setAddExpenseModalVisible(false)}
                onExpenseAdded={getFriends} // Refresh
                okText="Split"
            />
        </DefaultLayout>
    );
}

export default ManageFriends;


