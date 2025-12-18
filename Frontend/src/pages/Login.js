import React, { useEffect, useState } from 'react';
import "tailwindcss/tailwind.css";
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import Spin from '../components/Spin';
import { message } from "antd";




function Login() {

    const [load, setLoad] = useState(false)
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    })

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoad(true)
            const response = await axios.post("api/users/login", formData)
            setLoad(false)
            message.success("Succesfully logged in")

            // Store response (contains token and user) and set axios default header
            const storeObj = { ...response.data, password: "" };
            localStorage.setItem("User", JSON.stringify(storeObj))
            if (response.data && response.data.token) {
                // set default Authorization header for subsequent requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            }
            navigate("/")

        } catch (error) {
            setLoad(false)
            message.error("Enter Correct Details")
            console.log(error)

        }

    };

    useEffect(() => {
        if (localStorage.getItem("User"))
            navigate("/")
    }, [])


    return (

        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            {load && <Spin />}
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">Sign In</h1>
                <p className="text-gray-600 mb-6">Enter your details to Login.</p>
                <form className="space-y-8" onSubmit={handleSubmit}>
                    <div >
                        <label className="block text-gray-700"></label>
                        <input
                            type="text"
                            placeholder="Enter Your Name"
                            className="mt-1 p-2 w-full border rounded"
                            name='name'
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700"></label>
                        <input
                            type="email"
                            placeholder="Enter Your email id "
                            className="mt-1 p-2 w-full border rounded"
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700"></label>
                        <input
                            type="password"
                            placeholder="Enter Your Password"
                            className="mt-1 p-2 w-full border rounded"
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button className="w-full bg-blue-500 text-white p-2 rounded mt-4">Log In</button>
                    <p className="text-center text-gray-700 mt-4">
                        Not registered yet? <a href="/Register" className="text-blue-500">Click Here To Register</a>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;

