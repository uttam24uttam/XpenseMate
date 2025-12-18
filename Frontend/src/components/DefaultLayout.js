import React from 'react';
import "tailwindcss/tailwind.css";
import { UserOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { useNavigate } from 'react-router-dom';

function DefaultLayout(props) {

    const navigate = useNavigate();
    const items = [
        {
            label: 'Sign out',  //LOGOUT
            key: '1',
            icon: <UserOutlined />,
            danger: true,
        },
    ];

    const menuProps = {
        items,
        onClick: (event) => {
            if (event.key === '1') {
                console.log('Sign out clicked');
                localStorage.removeItem('User');
                navigate("/login");
            }
        },
    };

    const user = JSON.parse(localStorage.getItem("User")) || { name: "Guest" };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-blue-gray-600 shadow-md py-4 px-6 flex justify-between items-center">
                <div className="cursor-pointer" onClick={() => navigate("/")}>
                    <h1 className="text-white text-2xl font-semibold tracking-wide hover:text-gray-200">
                        ExpenseMate
                    </h1>
                </div>
                <div className="flex items-center">
                    <Button
                        onClick={() => navigate("/manage-friends")}
                        className="bg-white text-black hover:text-white hover:bg-blue-gray-500 border-none mr-4"

                    >
                        Manage Friends
                    </Button>
                    <Dropdown.Button
                        menu={menuProps}
                        icon={<UserOutlined />}
                        className="bg-blue-gray-500 hover:bg-blue-gray-400 text-white border-none"
                    >
                        {user.name}
                    </Dropdown.Button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-grow container mx-auto my-6 px-4">
                <div className="bg-white shadow-lg rounded-lg p-6">
                    {props.children}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-blue-gray-700 py-4 text-center text-sm text-white">
                © {new Date().getFullYear()} Expense Tracker. All rights reserved.
            </footer>
        </div>
    );
}

export default DefaultLayout;
