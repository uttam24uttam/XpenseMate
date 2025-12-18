import React from 'react'
import { Modal, Form, Input, Select, message } from "antd";
import axios from "axios"
import "../resources/transaction.css"
import { render, fireEvent, waitFor } from '@testing-library/react';



function CrudTransactions(props) {


    //when the form is submitted , the save buttons is clicked , then this function is called. It saves it into db and shows in table
    const onFinish = async (values) => {

        const user = JSON.parse(localStorage.getItem("User"))
        // user object shape may vary: older code expects top-level fields, newer returns { token, user: { id, name, email } }
        const userId = user?.user?._id || user?.user?.id || user?._id || user?.id;

        try {
            if (props.selectedTransactionForEdit) {
                const response = await axios.post("api/transactions/edit-transaction", { payload: { ...values, userid: userId }, transactionID: props.selectedTransactionForEdit._id }) //sends to db
                message.success("Transaction Edited Succesfully")
                props.getTransaction()       //gets the whole db , and inside this function it sets the whole db into trasactionData which is used to form table
                console.log("Succesfully sent", response.data)
            }
            else {
                const response = await axios.post("api/transactions/add-transaction", { ...values, userid: userId }) //sends to db
                message.success("Saved")
                props.getTransaction()       //gets the whole db , and inside this function it sets the whole db into trasactionData which is used to form table
                console.log("Succesfully sent", response.data)
            }
            props.setShowCrudTransactionModel(false)
            props.setSelectedTransactionForEdit(null)


        } catch (error) {
            message.error("Something went wrong")
            console.log(error)

        }

    };
    return (

        <Modal
            title={props.selectedTransactionForEdit ? "Edit Transaction" : "Add Transaction"}
            open={props.showCrudTransactionModel}    //open when show is true 
            // onOk={() => toggleModal(0, false)}
            onCancel={() => props.setShowCrudTransactionModel(false)} //on cancel , it show should be false
            footer={false} >


            <Form layout='vertical' className='transaction-form' onFinish={onFinish} initialValues={props.selectedTransactionForEdit}>

                <Form.Item label="Amount" name="amount">
                    <Input type='text ' />
                </Form.Item>

                <Form.Item label="Date" name="date">
                    <Input type='date' />
                </Form.Item>


                <Form.Item label="Type" name="type">
                    <Select>
                        <Select.Option value="income"> Income </Select.Option>
                        <Select.Option value="expense"> Expense </Select.Option>
                    </Select>

                </Form.Item>


                <Form.Item label="Category" name="category">
                    <Select>
                        <Select.Option value="salary"> Salary </Select.Option>
                        <Select.Option value="freelance"> Freelance </Select.Option>
                        <Select.Option value="food"> Food </Select.Option>
                        <Select.Option value="travel"> Travel </Select.Option>
                        <Select.Option value="invest"> Invest </Select.Option>
                        <Select.Option value="education"> Education </Select.Option>
                        <Select.Option value="medical"> Medical </Select.Option>
                        <Select.Option value="savings"> Savings </Select.Option>
                        <Select.Option value="entertainment"> Entertainment </Select.Option>
                        <Select.Option value="housing"> Housing </Select.Option>
                        <Select.Option value="utilities"> Utilities </Select.Option>
                        <Select.Option value="insurance"> Insurance </Select.Option>
                        <Select.Option value="subscription"> Subscription </Select.Option>
                        <Select.Option value="groceries"> Groceries </Select.Option>
                        <Select.Option value="others"> Others </Select.Option>

                    </Select>
                </Form.Item>


                <Form.Item label="Description" name="description">
                    <Input type='text ' />
                </Form.Item>

                <div className='flex justify-center'>
                    <button type='submit' className="bg-[#546E7A] hover:bg-[#4a5d66] text-white font-bold p-2 px-4  border border-blue-700 rounded-lg text-sm">
                        Save
                    </button>
                </div>


            </Form>









        </Modal>
    )
}

export default CrudTransactions