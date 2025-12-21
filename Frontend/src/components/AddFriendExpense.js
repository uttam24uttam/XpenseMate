import React, { useState } from "react";
import {
    Modal,
    Input,
    DatePicker,
    Radio,
    Select,
    message
} from "antd";
import {
    WalletOutlined,
    ShoppingCartOutlined,
    CoffeeOutlined,
    RocketOutlined,
    CreditCardOutlined,
    HomeOutlined,
    CarOutlined,
    AccountBookOutlined,
    GiftOutlined
} from "@ant-design/icons";
import axios from "axios";

// AddFriendExpense: collects expense details split between user and friends
export default function AddFriendExpense({ friends = [], visible, open, onCancel, onExpenseAdded, okText }) {
    const rawUser = JSON.parse(localStorage.getItem("User") || "null");
    const userId = rawUser?.user?._id || rawUser?.user?.id || rawUser?._id || rawUser?.id || null;
    const userObj = rawUser?.user || rawUser || null;

    const [newExpense, setNewExpense] = useState({
        description: "",
        totalAmount: "",
        splitOption: "equally",
        splitDetails: {},
        date: null,
        selectedFriends: [],
        whoPaid: [],
        amountsPaid: {},
        category: "",
        addToPersonalFinance: false
    });

    // Do not render the modal if no user present
    if (!rawUser || !userId) return null;

    const categories = [
        { label: "Groceries", value: "groceries", icon: <ShoppingCartOutlined /> },
        { label: "Food & Drinks", value: "food_drinks", icon: <CoffeeOutlined /> },
        { label: "Entertainment", value: "entertainment", icon: <AccountBookOutlined /> },
        { label: "Travel", value: "travel", icon: <RocketOutlined /> },
        { label: "Shopping", value: "shopping", icon: <CreditCardOutlined /> },
        { label: "Rent", value: "rent", icon: <HomeOutlined /> },
        { label: "Transportation", value: "transportation", icon: <CarOutlined /> },
        { label: "Gifts", value: "gifts", icon: <GiftOutlined /> },
        { label: "Others", value: "others", icon: <WalletOutlined /> }
    ];

    const modalOpen = typeof open !== 'undefined' ? open : visible;

    const normalizeId = (id) => (id && id.toString ? id.toString() : id);
    const findFriendName = (id) => {
        const sid = normalizeId(id);
        const f = friends.find(fr => normalizeId(fr._id) === sid);
        return f?.name || "Unknown";
    };

    const handleAddExpense = async () => {
        try {
            const {
                description,
                totalAmount,
                date,
                selectedFriends,
                whoPaid,
                amountsPaid,
                splitOption,
                splitDetails,
                category,
                addToPersonalFinance
            } = newExpense;

            if (!description || !totalAmount || !date || (selectedFriends.length === 0) || !category || whoPaid.length === 0) {
                message.error("Please fill all required fields, including who paid.");
                return;
            }

            const allParticipants = [...selectedFriends.map(normalizeId), normalizeId(userId)];

            const paidBy = whoPaid.map((uid) => ({
                user: normalizeId(uid),
                amount: parseFloat(amountsPaid[uid] || 0)
            }));

            const payees = allParticipants.map((uid) => {
                let amountOwed = 0;
                if (splitOption === "equally") {
                    amountOwed = parseFloat(totalAmount) / allParticipants.length;
                } else if (splitOption === "percentage") {
                    amountOwed = (parseFloat(splitDetails[uid] || 0) / 100) * parseFloat(totalAmount);
                } else if (splitOption === "manual") {
                    amountOwed = parseFloat(splitDetails[uid] || 0);
                }
                return {
                    user: uid,
                    amount: amountOwed
                };
            });

            const payload = {
                description,
                totalAmount: parseFloat(totalAmount),
                date,
                category,
                payees,
                paidBy
            };

            await axios.post("/api/friend-transactions/add", payload);

            if (addToPersonalFinance) {
                const userShare = payees.find(p => normalizeId(p.user) === normalizeId(userId))?.amount || 0;
                const personalFinanceTransaction = {
                    userid: normalizeId(userId),
                    amount: userShare,
                    type: "expense",
                    category,
                    description,
                    date
                };
                await axios.post("/api/friend-transactions/add-personal-tracking-transaction", personalFinanceTransaction);
                message.success("Personal finance transaction added!");
            }

            message.success("Expense added successfully!");
            onExpenseAdded && onExpenseAdded();
            onCancel && onCancel();
        } catch (error) {
            console.error("Error adding friend expense:", error);
            const errMsg = error?.response?.data?.message || error.message || "Error adding expense.";
            message.error(errMsg);
        }
    };

    return (
        <Modal
            title="Add Expense"
            open={modalOpen}
            onCancel={onCancel}
            onOk={handleAddExpense}
            width={600}
            okText={okText || "Add Expense"}
        >
            <Input
                placeholder="Description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="mb-2"
                required
            />

            <Input
                placeholder="Total Amount"
                type="number"
                value={newExpense.totalAmount}
                onChange={(e) => setNewExpense({ ...newExpense, totalAmount: e.target.value })}
                className="mb-2"
                required
            />

            <DatePicker
                className="w-full mb-2"
                onChange={(date) => setNewExpense({ ...newExpense, date })}
                required
            />

            <div className="mb-2">
                <p>Category:</p>
                <Select
                    placeholder="Select category"
                    value={newExpense.category}
                    onChange={(value) => setNewExpense({ ...newExpense, category: value })}
                    style={{ width: "100%" }}
                    required
                >
                    {categories.map((category) => (
                        <Select.Option key={category.value} value={category.value}>
                            {category.icon} {category.label}
                        </Select.Option>
                    ))}
                </Select>
            </div>

            <div className="mb-2">
                <p>Split Between You and:</p>
                <Select
                    mode="multiple"
                    placeholder="Select friends to split with"
                    value={newExpense.selectedFriends}
                    onChange={(value) => setNewExpense({ ...newExpense, selectedFriends: value })}
                    style={{ width: "100%" }}
                    required
                >
                    {friends.map((friend) => (
                        <Select.Option key={normalizeId(friend._id)} value={normalizeId(friend._id)}>
                            {friend.name}
                        </Select.Option>
                    ))}
                </Select>
            </div>

            <div className="mb-2">
                <p>Who Paid?</p>
                <Select
                    mode="multiple"
                    placeholder="Select who paid"
                    value={newExpense.whoPaid}
                    onChange={(value) => setNewExpense({ ...newExpense, whoPaid: value })}
                    style={{ width: "100%" }}
                    required
                >
                    <Select.Option value={normalizeId(userId)}>You</Select.Option>
                    {newExpense.selectedFriends.map((fid) => (
                        <Select.Option key={fid} value={fid}>
                            {findFriendName(fid)}
                        </Select.Option>
                    ))}
                </Select>
            </div>

            {newExpense.whoPaid.length > 0 && (
                <div className="mb-2">
                    <p>Enter Amount Paid by Each:</p>
                    {newExpense.whoPaid.map((id) => (
                        <Input
                            key={id}
                            type="number"
                            value={newExpense.amountsPaid[id] || ""}
                            placeholder={`Amount paid by ${normalizeId(id) === normalizeId(userId) ? "You" : findFriendName(id)}`}
                            onChange={(e) =>
                                setNewExpense({
                                    ...newExpense,
                                    amountsPaid: {
                                        ...newExpense.amountsPaid,
                                        [id]: e.target.value
                                    }
                                })
                            }
                            className="mb-2"
                            required
                        />
                    ))}
                </div>
            )}

            <div>
                <p>Adjust Split Method:</p>
                <Radio.Group
                    value={newExpense.splitOption}
                    onChange={(e) => setNewExpense({ ...newExpense, splitOption: e.target.value })}
                >
                    <Radio value="equally">Equally</Radio>
                    <Radio value="percentage">Percentage</Radio>
                    <Radio value="manual">Manual Amount</Radio>
                </Radio.Group>
                <div className="mt-2">
                    {newExpense.splitOption === "percentage" &&
                        [...newExpense.selectedFriends, normalizeId(userId)].map((id) => (
                            <Input
                                key={id}
                                placeholder={`Percentage for ${normalizeId(id) === normalizeId(userId) ? "You" : findFriendName(id)}`}
                                type="number"
                                value={newExpense.splitDetails[id] || ""}
                                onChange={(e) =>
                                    setNewExpense({
                                        ...newExpense,
                                        splitDetails: {
                                            ...newExpense.splitDetails,
                                            [id]: e.target.value
                                        }
                                    })
                                }
                                className="mb-2"
                            />
                        ))}

                    {newExpense.splitOption === "manual" &&
                        [...newExpense.selectedFriends, normalizeId(userId)].map((id) => (
                            <Input
                                key={id}
                                placeholder={`Amount for ${normalizeId(id) === normalizeId(userId) ? "You" : findFriendName(id)}`}
                                type="number"
                                value={newExpense.splitDetails[id] || ""}
                                onChange={(e) =>
                                    setNewExpense({
                                        ...newExpense,
                                        splitDetails: {
                                            ...newExpense.splitDetails,
                                            [id]: e.target.value
                                        }
                                    })
                                }
                                className="mb-2"
                            />
                        ))}

                    {newExpense.splitOption === "equally" && newExpense.totalAmount > 0 && (
                        <p>
                            Each participant pays: ₹
                            {(parseFloat(newExpense.totalAmount) / (newExpense.selectedFriends.length + 1)).toFixed(2)}
                        </p>
                    )}
                </div>
            </div>

            <div className="mb-2 mt-4">
                <p>Do you want to add your share to personal finance?</p>
                <Select
                    value={newExpense.addToPersonalFinance}
                    onChange={(value) => setNewExpense({ ...newExpense, addToPersonalFinance: value })}
                    style={{ width: "100%" }}
                >
                    <Select.Option value={true}>Yes</Select.Option>
                    <Select.Option value={false}>No</Select.Option>
                </Select>
            </div>
        </Modal>
    );
}


// handleAddExpense → validates inputs, constructs payload, calls backend APIs, and handles personal finance tracking
// A payload is the data in object you send to the backend when making an API request.
// const payload = {
//     description,
//     totalAmount: parseFloat(totalAmount),
//     date,
//     category,
//     payees,   // who owes how much
//     paidBy    // who paid how much
// };



// API Calls
// POST /api/friend-transactions/add → add the expense for friends
// POST /api/friend-transactions/add-personal-tracking-transaction → optionally add the user’s share to personal finance