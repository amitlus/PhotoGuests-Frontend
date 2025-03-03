import {getBackendBaseUrl} from "../utils/apiConfig";
import React, {useState, useEffect, useCallback} from "react";
import axios from "axios";
import {Link, useNavigate} from "react-router-dom";
import {motion} from "framer-motion";
import EventForm from "./EventForm";
import EventCard from "./EventCard";
import {Plus, X} from "lucide-react";

const listVariants = {
    hidden: {opacity: 0},
    visible: {opacity: 1, transition: {staggerChildren: 0.2}},
};

const itemVariants = {
    hidden: {opacity: 0, y: 20},
    visible: {opacity: 1, y: 0},
};

const EventList = ({user}) => {
    const [events, setEvents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();

    const fetchEvents = useCallback(async () => {
        try {
            const API_BASE_URL = getBackendBaseUrl();
            const response = await axios.get(`${API_BASE_URL}/events/`, {
                headers: {Authorization: `Bearer ${user.token}`},
            });
            setEvents(response.data);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            navigate("/");
            return;
        }
        fetchEvents();
    }, [user, navigate, fetchEvents]);

    return (
        <motion.div initial="hidden" animate="visible" exit="hidden">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <motion.div className="flex justify-between items-center mb-8" variants={itemVariants}>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name || "Guest"}!</h1>
                    <button
                        className={`${
                            showForm ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                        } text-white py-2 px-4 rounded-md flex items-center`}
                        onClick={() => setShowForm((prev) => !prev)}
                    >
                        {showForm ? <X className="h-5 w-5 mr-2"/> : <Plus className="h-5 w-5 mr-2"/>}
                        {showForm ? "Hide Form" : "Create New Event"}
                    </button>
                </motion.div>

                {showForm && <EventForm user={user} onEventCreated={fetchEvents}/>}

                <motion.div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" variants={listVariants}>
                    {events.length > 0 ? (
                        events.map((event) => (
                            <motion.div key={event.event_id} variants={itemVariants}>
                                <Link to={`/events/${event.event_id}`} className="block">
                                    <EventCard event={event}/>
                                </Link>
                            </motion.div>
                        ))
                    ) : (
                        <motion.p
                            className="text-xl text-gray-600 col-span-full text-center bg-gray-100 p-8 rounded-lg">
                            No events found. Create a new one!
                        </motion.p>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default EventList;
