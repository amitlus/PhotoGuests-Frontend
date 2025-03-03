import {getBackendBaseUrl} from "../utils/apiConfig";

import {useState, useEffect} from "react";
import axios from "axios";
import {useParams, useNavigate, Link} from "react-router-dom";
import EventQRCode from "./EventQRCode";
import {Calendar, Upload} from "lucide-react";

const EventDetail = () => {
    const [event, setEvent] = useState(null);
    const [albumFile, setAlbumFile] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [user, setUser] = useState(null);

    const {eventId} = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        setUser(storedUser);
    }, []);

    useEffect(() => {
        if (!eventId || !user?.token) return;

        const fetchEventDetails = async () => {
            try {
                const API_BASE_URL = getBackendBaseUrl();
                const response = await axios.get(`${API_BASE_URL}/events/${eventId}`, {
                    headers: {Authorization: `Bearer ${user.token}`},
                });
                setEvent(response.data);

                if (response.data.email !== user.email) {
                    alert("You are not authorized to view this event.");
                    navigate("/");
                } else {
                    setIsAuthorized(true);
                }
            } catch (error) {
                console.error("Error fetching event details:", error);
                alert("An error occurred while fetching event details.");
            }
        };

        fetchEventDetails();
    }, [eventId, user, navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return alert("No file selected.");
        setAlbumFile(file);
    };

    const handleUpload = async () => {
        if (!albumFile) return alert("Please select a file before uploading.");

        const formData = new FormData();
        formData.append("album", albumFile);

        try {
            const API_BASE_URL = getBackendBaseUrl();
            await axios.post(`${API_BASE_URL}/albums/${eventId}/upload-event-album`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            alert("File uploaded successfully!");
            setAlbumFile(null);
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("An error occurred while uploading the file.");
        }
    };

    if (!event) return <div className="text-center text-lg text-gray-700">Loading...</div>;
    if (!isAuthorized) return <div className="text-center text-lg text-red-600">You are not authorized to view this
        event.</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{event.name}</h2>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="h-5 w-5 mr-2"/>
                    <span>Date: {event.date}</span>
                </div>
                <p className="text-sm text-gray-600 mb-6">Status: {event.status}</p>

                <div className="bg-gray-50 p-4 rounded-md mb-6">
                    <h3 className="text-lg font-semibold mb-2">Upload or Replace the Album</h3>
                    <input
                        type="file"
                        accept=".zip"
                        onChange={handleFileChange}
                        className="w-full border border-gray-300 rounded p-2 mb-4"
                    />
                    <button
                        onClick={handleUpload}
                        className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition flex items-center justify-center"
                    >
                        <Upload className="h-5 w-5 mr-2"/> Upload Album
                    </button>
                </div>

                <div className="mb-6">
                    <EventQRCode eventId={event.event_id}/>
                </div>

                <Link
                    to={`/events/${event.event_id}/guest-form`}
                    className="block text-center bg-green-600 text-white p-3 rounded-md hover:bg-green-700 transition"
                >
                    Fill out the Guest Submission Form
                </Link>
            </div>
        </div>
    );
};

export default EventDetail;
