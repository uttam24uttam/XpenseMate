import React, { useState } from "react";
import { Modal, Input, Button } from "antd";

function SettleUp({ visible, open, onCancel, onSettleUp }) {
    const [settleAmount, setSettleAmount] = useState("");

    const modalOpen = typeof open !== 'undefined' ? open : visible;

    const handleRecordPaid = () => {
        const amt = parseFloat(settleAmount);
        if (isNaN(amt) || amt <= 0) {
            return Modal.error({ title: 'Invalid amount', content: 'Please enter a valid amount.' });
        }
        onSettleUp(amt);
    };

    return (
        <Modal
            title="Settle Up"
            open={modalOpen}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button key="record" type="primary" onClick={handleRecordPaid}>
                    Record as Paid
                </Button>
            ]}
        >
            <p>Enter the amount you want to settle:</p>
            <Input
                type="number"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
                placeholder="Amount in ₹"
            />
        </Modal>
    );
}

export default SettleUp;
