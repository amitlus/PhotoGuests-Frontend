import {getBackendBaseUrl} from "../utils/apiConfig";

import React, {useState} from "react";
import axios from "axios";
import {useParams} from "react-router-dom";
import {User, Phone, Image, Send} from "lucide-react";

const countryCodes = {
    IL: "+972",
    US: "+1",
    UK: "+44",
    IN: "+91",
};

const GuestSubmissionForm = () => {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [countryCode, setCountryCode] = useState("+972");
    const [photo, setPhoto] = useState(null);
    const [message, setMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const {eventId} = useParams();

    const validatePhoneNumber = (phoneNumber) => /^[0-9]{7,12}$/.test(phoneNumber);

    const formatPhoneNumberForWhatsApp = (countryCode, phone) => {
        let formattedPhone = phone.replace(/^0+/, "");
        if (countryCode === "+54" && !formattedPhone.startsWith("9")) formattedPhone = "9" + formattedPhone;
        if (countryCode === "+52" && !formattedPhone.startsWith("1")) formattedPhone = "1" + formattedPhone;
        return countryCode.replace("+", "") + formattedPhone;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePhoneNumber(phone)) {
            setErrorMessage("Please enter a valid phone number.");
            return;
        }

        const finalPhoneNumber = formatPhoneNumberForWhatsApp(countryCode, phone);
        const formData = new FormData();
        formData.append("name", name);
        formData.append("phone", finalPhoneNumber);
        formData.append("photo", photo);

        try {
            const API_BASE_URL = getBackendBaseUrl();
            const response = await axios.post(`${API_BASE_URL}/guests/${eventId}/submit-guest`, formData, {
                headers: {"Content-Type": "multipart/form-data"},
            });
            setMessage(response.data.message);
            setErrorMessage("");
            setName("");
            setPhone("");
            setPhoto(null);
        } catch (error) {
            console.error("Error submitting guest:", error);
            setErrorMessage("An error occurred while submitting your details.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-lg w-full p-6">
                <h2 className="text-3xl font-extrabold text-gray-900 text-center">Guest Submission</h2>
                <p className="mt-2 text-gray-500 text-center">Submit your details to receive event photos.</p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div className="flex items-center bg-gray-100 border rounded-md p-3">
                        <User className="text-gray-400 w-5 h-5"/>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Enter your full name"
                            className="flex-1 bg-transparent border-none outline-none ml-3 text-gray-900 placeholder-gray-500"
                        />
                    </div>

                    <div className="flex items-center bg-gray-100 border rounded-md p-3">
                        <Phone className="text-gray-400 w-5 h-5"/>
                        <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="bg-transparent border-none outline-none ml-3 text-gray-900"
                        >
                            {Object.entries(countryCodes).map(([country, code]) => (
                                <option key={country} value={code}>
                                    {country} ({code})
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            placeholder="Phone number"
                            className="flex-1 bg-transparent border-none outline-none ml-3 text-gray-900 placeholder-gray-500"
                        />
                    </div>

                    <div className="flex items-center bg-gray-100 border rounded-md p-3">
                        <Image className="text-gray-400 w-5 h-5"/>
                        <input
                            type="file"
                            onChange={(e) => setPhoto(e.target.files[0])}
                            accept="image/*"
                            required
                            className="ml-3 text-gray-900"
                        />
                    </div>

                    <button
                        type="submit"
                        className="flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-150 ease-in-out"
                    >
                        Submit
                        <Send className="ml-2 w-5 h-5"/>
                    </button>
                </form>

                {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
                {errorMessage && <p className="mt-4 text-red-600 text-center">{errorMessage}</p>}
            </div>
        </div>
    );
};

export default GuestSubmissionForm;
