
import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function Analytics({ transactions }) {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#C9CBCF'];

    const totalTransactions = transactions.length;
    const totalExpenseTransactions = transactions.filter(transaction => transaction.type === 'expense').length;
    const totalIncomeTransactions = transactions.filter(transaction => transaction.type === 'income').length;
    const totalIncomeTransactionsPercentage = (totalIncomeTransactions / totalTransactions) * 100;
    const totalExpenseTransactionsPercentage = (totalExpenseTransactions / totalTransactions) * 100;

    const totalExpense = transactions.reduce((acc, transaction) => transaction.type === "expense" ? acc + transaction.amount : acc, 0);
    const totalIncome = transactions.reduce((acc, transaction) => transaction.type === "income" ? acc + transaction.amount : acc, 0);
    const totalTurnover = totalExpense + totalIncome;
    const totalIncomePercentage = (totalIncome / totalTurnover) * 100;
    const totalExpensePercentage = (totalExpense / totalTurnover) * 100;

    const categories = ["salary", "freelance", "food", "travel", "invest", "education", "medical", "entertainment", "savings", "others"];

    const incomeData = categories.map((category) => {
        const amount = transactions.filter(t => t.type === 'income' && t.category === category).reduce((acc, t) => acc + t.amount, 0);
        return { name: category, value: amount };
    }).filter(data => data.value > 0);

    const expenseData = categories.map((category) => {
        const amount = transactions.filter(t => t.type === 'expense' && t.category === category).reduce((acc, t) => acc + t.amount, 0);
        return { name: category, value: amount };
    }).filter(data => data.value > 0);

    const averageTransactionValue = (totalTurnover / totalTransactions).toFixed(2);
    const largestIncomeCategory = incomeData.sort((a, b) => b.value - a.value)[0]?.name || 'None';
    const largestExpenseCategory = expenseData.sort((a, b) => b.value - a.value)[0]?.name || 'None';

    return (
        <div className="container mx-auto p-4">
            {/* Summary Row */}
            <div className="flex flex-wrap mb-8">
                <div className="w-full md:w-1/2 p-4">
                    <div className="bg-white p-6 shadow rounded">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Transaction Overview</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Income', value: totalIncomeTransactions },
                                        { name: 'Expense', value: totalExpenseTransactions },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label
                                >
                                    <Cell key="Income" fill="#00C49F" />
                                    <Cell key="Expense" fill="#FF8042" />
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <p className="text-sm text-gray-600">Income: {totalIncomeTransactions} | Expense: {totalExpenseTransactions}</p>
                    </div>
                </div>
                <div className="w-full md:w-1/2 p-4">
                    <div className="bg-white p-6 shadow rounded">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Turnover Overview</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={[
                                    { name: 'Income', value: totalIncome },
                                    { name: 'Expense', value: totalExpense },
                                ]}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                        <p className="text-sm text-gray-600">Total Turnover: {totalTurnover}</p>
                    </div>
                </div>
            </div>

            {/* Category-Wise Income and Expense */}
            <div className="flex flex-wrap -mx-2">
                <div className="w-full md:w-1/2 px-2 mb-4">
                    <div className="bg-white p-6 shadow rounded">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Income Category Distribution</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={incomeData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#82ca9d"
                                    dataKey="value"
                                    label
                                >
                                    {incomeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="w-full md:w-1/2 px-2 mb-4">
                    <div className="bg-white p-6 shadow rounded">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Expense Category Distribution</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={expenseData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#FF8042"
                                    dataKey="value"
                                    label
                                >
                                    {expenseData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white p-6 shadow rounded mt-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Key Insights</h4>
                <ul className="text-sm text-gray-700">
                    <li><strong>Total Transactions:</strong> {totalTransactions}</li>
                    <li><strong>Average Transaction Value:</strong> Rs. {averageTransactionValue}</li>
                    <li><strong>Largest Income Category:</strong> {largestIncomeCategory}</li>
                    <li><strong>Largest Expense Category:</strong> {largestExpenseCategory}</li>
                </ul>
            </div>
        </div>
    );
}

export default Analytics;
