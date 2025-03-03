import React, {useState, useEffect} from "react";
import axios from "axios";
import {Calendar, Phone, User, Users, Image} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {getBackendBaseUrl, getVipUsers} from "../utils/apiConfig";

const pricingTiers = [
    {guests: 100, images: 1000, price: 120},
    {guests: 100, images: 2500, price: 240},
    {guests: 100, images: 5000, price: 440},
    {guests: 100, images: 10000, price: 840},
    {guests: 250, images: 1000, price: 180},
    {guests: 250, images: 2500, price: 300},
    {guests: 250, images: 5000, price: 500},
    {guests: 250, images: 10000, price: 900},
    {guests: 500, images: 1000, price: 280},
    {guests: 500, images: 2500, price: 400},
    {guests: 500, images: 5000, price: 600},
    {guests: 500, images: 10000, price: 1000},
    {guests: 1000, images: 1000, price: 480},
    {guests: 1000, images: 2500, price: 600},
    {guests: 1000, images: 5000, price: 800},
    {guests: 1000, images: 10000, price: 1200}
];

const EventForm = ({user, onEventCreated}) => {
    const [formData, setFormData] = useState({
        name: "",
        date: "",
        phone: "",
        num_guests: "",
        num_images: "",
        username: user?.name || "",
        email: user?.email || "",
    });

    const [price, setPrice] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [validationError, setValidationError] = useState("");
    const [typingTimeout, setTypingTimeout] = useState(null);

    const validateForm = () => {
        const {num_guests, num_images} = formData;

        if (!num_guests || isNaN(num_guests) || num_guests < 10 || num_guests > 1000) {
            setValidationError("Guests must be between 10 and 1000.");
            return false;
        }
        if (!num_images || isNaN(num_images) || num_images < 100 || num_images > 10000) {
            setValidationError("Images must be between 100 and 10,000.");
            return false;
        }
        setValidationError("");
        return true;
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: (name === "num_guests" || name === "num_images")
                ? (value.trim() === "" ? "" : parseInt(value, 10) || "")
                : value
        }));
    };

    const handleDateChange = (date) => {
        setFormData({...formData, date: date ? date.toISOString().split('T')[0] : ""});
    };

    // Auto-update price when num_guests or num_images change
    useEffect(() => {
        if (typingTimeout) clearTimeout(typingTimeout);

        const timeout = setTimeout(() => {
            const {num_guests, num_images} = formData;

            if (num_guests && num_images) {
                const tier = pricingTiers.find(t => t.guests >= num_guests && t.images >= num_images);
                setPrice(tier ? tier.price : 0);
            }
        }, 100);

        setTypingTimeout(timeout);
    }, [formData.num_guests, formData.num_images]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const API_BASE_URL = getBackendBaseUrl();
            const token = user?.token;
            if (!token) {
                setError("Authentication required. Please log in again.");
                setLoading(false);
                return;
            }

            const dataWithToken = {...formData, price, token};

            const VIP_USERS = getVipUsers();
            if (VIP_USERS.includes(user.email)) {
                const eventResponse = await axios.post(`${API_BASE_URL}/events/`, dataWithToken, {
                    headers: {Authorization: `Bearer ${token}`},
                });

                if (eventResponse.status === 200) {
                    setSuccessMessage("🎉 Event created successfully!");
                    setFormData({
                        name: "",
                        date: "",
                        phone: "",
                        num_guests: "",
                        num_images: "",
                        username: user.name,
                        email: user.email
                    });
                    onEventCreated();
                    return;
                } else {
                    throw new Error("Failed to create event.");
                }
            }

            const paymentResponse = await axios.post(`${API_BASE_URL}/payment/create-payment`, dataWithToken, {
                headers: {Authorization: `Bearer ${token}`},
            });

            if (paymentResponse.data.approval_url) {
                window.location.href = paymentResponse.data.approval_url;
            } else {
                throw new Error("Failed to create PayPal payment.");
            }
        } catch (err) {
            setError("Failed to process request. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/30 backdrop-blur-md shadow-lg border border-white/20 rounded-xl p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create a New Event</h2>
            {validationError && <p className="text-red-500 mb-4">{validationError}</p>}
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {successMessage &&
                <p className="text-green-600 mb-4">{successMessage}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField icon={<User/>} name="name" value={formData.name} onChange={handleInputChange}
                            placeholder="Enter event name"/>
                <DateInputField icon={<Calendar/>} name="date" value={formData.date} onChange={handleDateChange}/>
                <InputField icon={<Phone/>} name="phone" value={formData.phone} onChange={handleInputChange}
                            placeholder="Enter phone number"/>
                <InputField icon={<Users/>} name="num_guests" value={formData.num_guests} onChange={handleInputChange}
                            placeholder="Enter number of guests (10-1000)"/>
                <InputField icon={<Image/>} name="num_images" value={formData.num_images} onChange={handleInputChange}
                            placeholder="Enter number of images (100-10,000)"/>
                <p className="text-lg font-semibold">Estimated Price: {price} ILS</p>
                <button type="submit"
                        className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition"
                        disabled={loading}>{loading ? "Creating..." : "Create Event"}</button>
            </form>
        </div>
    );
};

const InputField = ({icon, ...props}) => (
    <div className="flex items-center bg-gray-100 border rounded-md p-3">
        {icon}
        <input {...props}
               className="flex-1 bg-transparent border-none outline-none ml-3 text-gray-900 placeholder-gray-500"
               required/>
    </div>
);

const DateInputField = ({icon, value, onChange}) => (
    <div className="flex items-center bg-gray-100 border rounded-md p-3">
        {icon}
        <DatePicker selected={value ? new Date(value) : null} onChange={onChange} dateFormat="yyyy-MM-dd"
                    className="flex-1 bg-transparent border-none outline-none ml-3 text-gray-900 placeholder-gray-500"
                    required/>
    </div>
);

export default EventForm;
