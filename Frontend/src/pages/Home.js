
import React, { useState, useEffect } from 'react';
import "tailwindcss/tailwind.css";
import DefaultLayout from '../components/DefaultLayout';
import "../resources/transaction.css";
import "../resources/table.css";
import CrudTransactions from "./CrudTransactions";
import Analytics from '../components/Analytics';
import Spin from '../components/Spin';
import axios from "axios";
import { message, Table, Select, DatePicker, Popconfirm } from "antd";
import { format } from 'date-fns';
import { UnorderedListOutlined, AreaChartOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import jsPDF from "jspdf";
import "jspdf-autotable";

function Home() {
    const [load, setLoad] = useState(false);
    const [showCrudTransactionModel, setShowCrudTransactionModel] = useState(false);
    const [transactionData, setTransactionData] = useState([]);
    const [frequency, setFrequency] = useState('1');
    const [dateRange, setDateRange] = useState([]);
    const [type, setType] = useState('all');
    const { RangePicker } = DatePicker;
    const [viewType, setViewType] = useState('table');      //to toggle b/w table and analytics
    const [selectedTransactionForEdit, setSelectedTransactionForEdit] = useState(null);

    const getTransaction = async () => {
        try {
            const rawUser = JSON.parse(localStorage.getItem("User") || "null");
            const userId = rawUser?.user?._id || rawUser?.user?.id || rawUser?._id || rawUser?.id;
            setLoad(true);
            if (!userId) throw new Error('User not logged in');
            const response = await axios.post("api/transactions/get-all-transactions", { userid: userId, frequency, ...(frequency === 'custom' && { dateRange }), type });
            setTransactionData(response.data);
            setLoad(false);
        } catch (error) {
            setLoad(false);
            console.log(error);
            message.error("Something went wrong");
        }
    };

    const deleteTransaction = async (record) => {
        try {
            setLoad(true);
            await axios.delete("api/transactions/delete-transaction", { data: { transactionId: record._id } });
            message.success("Transaction Deleted");
            getTransaction();
            setLoad(false);
        } catch (error) {
            setLoad(false);
            console.log(error);
            message.error("Something went wrong");
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Date", "Amount", "Type", "Category"];
        const tableRows = [];

        transactionData.forEach((transaction) => {      //each of the transaction table is pushed into tableRows
            const transactionData = [
                format(new Date(transaction.date), 'yyyy-MM-dd'),
                transaction.amount,
                transaction.type,
                transaction.category,
            ];
            tableRows.push(transactionData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.text("Transaction Data", 14, 15);
        doc.save("transaction_data.pdf");
    };

    useEffect(() => {
        getTransaction();
    }, [frequency, dateRange, type]);

    const columns = [
        {
            title: "Date",
            dataIndex: "date",
            render: (date) => format(new Date(date), 'yyyy-MM-dd')
        },
        {
            title: "Amount",
            dataIndex: "amount"
        },
        {
            title: "Type",
            dataIndex: "type"
        },
        {
            title: "Category",
            dataIndex: "category"
        },
        {
            title: "Action",
            dataIndex: "action",
            render: (text, record) => {
                return (
                    <div>
                        <EditOutlined onClick={() => {
                            setSelectedTransactionForEdit(record);
                            setShowCrudTransactionModel(true);
                        }} />
                        <Popconfirm
                            title="Are you sure you want to delete this transaction?"
                            onConfirm={() => deleteTransaction(record)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <DeleteOutlined className='mx-3' />
                        </Popconfirm>
                    </div>
                );
            }
        }
    ];

    return (
        <DefaultLayout>
            {load && <Spin />}

            <div className='filter flex justify-between items-center border p-4 rounded-lg shadow-lg'>   {/*top filter bar */}

                <div className='flex justify-between'>                {/* type and select freq  */}

                    <div className='frequency min-w-md ml-4 flex flex-col items-start'>       {/* freq */}
                        <div>
                            <h6 className='mb-1'>Select Frequency</h6>
                            <Select value={frequency} onChange={(value) => setFrequency(value)}>
                                <Select.Option value='1'>All Transactions</Select.Option>
                                <Select.Option value='7'>Last 1 Week</Select.Option>
                                <Select.Option value='30'>Last 1 Month</Select.Option>
                                <Select.Option value='180'>Last 6 Months</Select.Option>
                                <Select.Option value='365'>Last 1 Year</Select.Option>
                                <Select.Option value='custom'>Custom Range</Select.Option>
                            </Select>
                        </div>

                        <div className="mt-3">
                            {frequency === 'custom' && (
                                <RangePicker value={dateRange} onChange={(values) => setDateRange(values)} />
                            )}
                        </div>
                    </div>

                    <div className='flex flex-col mb-3 ml-5'>
                        <h6 className='mb-1'>Type</h6>
                        <Select value={type} onChange={(value) => setType(value)}>
                            <Select.Option value='all'>All Transactions</Select.Option>
                            <Select.Option value='expense'>Expense</Select.Option>
                            <Select.Option value='income'>Income</Select.Option>
                        </Select>
                    </div>
                </div>

                <div className='flex'>
                    <div className='mr-3 toggle'>
                        <div className='view-switch pt-2'>
                            <UnorderedListOutlined onClick={() => { setViewType('table') }}
                                className={`ml-2 mr-3 pt-1 size-30 ${viewType === 'table' ? 'active-icon' : 'inactive-icon'}`}
                            />
                            <AreaChartOutlined onClick={() => { setViewType('analytics') }} className={`mr-3  ${viewType === 'analytics' ? 'active-icon' : 'inactive-icon'}`} />
                        </div>
                    </div>

                    <button
                        onClick={() => setShowCrudTransactionModel(true)}
                        className="bg-[#546E7A] hover:bg-[#4a5d66] text-white font-bold p-2 px-4 border border-blue-700 rounded-lg text-sm mr-3"
                    >
                        ADD NEW
                    </button>
                    <button
                        onClick={downloadPDF}
                        className="bg-[#546E7A] hover:bg-[#4a5d66] text-white font-bold p-2 px-4 border border-blue-700 rounded-lg text-sm"
                    >
                        Download PDF
                    </button>
                </div>
            </div>

            {viewType === 'table' ? (<div className="table-analytics mt-4">
                <Table columns={columns} dataSource={transactionData} rowKey="_id" />
            </div>) : (<Analytics transactions={transactionData} />)}

            {showCrudTransactionModel && (
                <CrudTransactions
                    showCrudTransactionModel={showCrudTransactionModel}
                    setShowCrudTransactionModel={setShowCrudTransactionModel}
                    getTransaction={getTransaction}
                    selectedTransactionForEdit={selectedTransactionForEdit}
                    setSelectedTransactionForEdit={setSelectedTransactionForEdit}
                />
            )}
        </DefaultLayout>
    );
}

export default Home;


