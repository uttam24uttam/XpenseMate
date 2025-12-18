import React, { useState, useEffect } from 'react';
import "tailwindcss/tailwind.css";
import axios from "axios"
import { useNavigate } from 'react-router-dom';

function Register() {

    const navigate = useNavigate()

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
            const response = await axios.post("api/users/register", formData)
            alert("Registration Succesfull")
            console.log("Succesfully sent", response.data)

        } catch (error) {
            console.log(error)

        }

    };

    useEffect(() => {
        if (localStorage.getItem("User"))
            navigate("/")
    }, [])


    return (

        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
                <p className="text-gray-600 mb-6">Enter your details to register.</p>
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

                    <button className="w-full bg-blue-500 text-white p-2 rounded mt-4">Sign Up</button>
                    <p className="text-center text-gray-700 mt-4">
                        Already have an account? <a href="/Login" className="text-blue-500">Sign In</a> {/* redirect to sign in  */}

                    </p>
                </form>
            </div>
        </div>
    );
}

export default Register;



