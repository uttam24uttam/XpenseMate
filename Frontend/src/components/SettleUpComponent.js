import React, { useState } from "react";
import { Modal, Input, Button } from "antd";

function SettleUp({ visible, open, onCancel, onSettleUp }) {
    const [settleAmount, setSettleAmount] = useState("");

    const handleSettleUp = () => {
        if (!settleAmount || settleAmount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }
        onSettleUp(settleAmount);
    };

    const modalOpen = typeof open !== 'undefined' ? open : visible;

    return (
        <Modal
            title="Settle Up"
            open={modalOpen}
            onCancel={onCancel}
            onOk={handleSettleUp}
        >
            <p>Enter the amount you want to settle:</p>
            <Input
                type="number"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
            />
        </Modal>
    );
}

export default SettleUp;
