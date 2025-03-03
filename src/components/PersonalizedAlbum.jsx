import React, {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import {getBackendBaseUrl} from "../utils/apiConfig";
import {motion} from "framer-motion";
import {X} from "lucide-react";

const listVariants = {
    hidden: {opacity: 0},
    visible: {opacity: 1, transition: {staggerChildren: 0.2}},
};

const itemVariants = {
    hidden: {opacity: 0, y: 20},
    visible: {opacity: 1, y: 0},
};

const PersonalizedAlbum = () => {
    const {event_id, phone_number, guest_uuid} = useParams();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPhoto, setSelectedPhoto] = useState(null); // State for full-size image
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {

        const fetchPhotos = async () => {
            try {
                const API_BASE_URL = getBackendBaseUrl();
                const response = await axios.get(
                    `${API_BASE_URL}/albums/get-personalized-album-photos/${event_id}/${phone_number}/${guest_uuid}`,
                );

                setPhotos(response.data.photos || []);
            } catch (err) {
                console.error("Error fetching photos:", err);
                setError("Failed to load album.");
            } finally {
                setLoading(false);
            }
        };

        fetchPhotos();
    }, [event_id, phone_number, guest_uuid]);

    const handleDownloadAlbum = async () => {
        setDownloading(true);
        try {
            const API_BASE_URL = getBackendBaseUrl();
            const response = await axios.get(
                `${API_BASE_URL}/albums/get-personalized-album/${event_id}/${phone_number}/${guest_uuid}`,
                {
                    responseType: "blob", // Ensure the response is treated as a file
                }
            );

            // Create a download link
            const blob = new Blob([response.data], {type: "application/zip"});
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${guest_uuid}.zip`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Error downloading album:", err);
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return <p className="text-center text-lg">Loading album...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <motion.div initial="hidden" animate="visible" exit="hidden">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <motion.div className="flex justify-between items-center mb-8" variants={itemVariants}>
                    <h1 className="text-3xl font-bold text-gray-900">Your Personalized Album</h1>

                    {/* Download Album Button */}
                    <button
                        onClick={handleDownloadAlbum}
                        className={`px-6 py-2 text-white rounded-md flex items-center 
                            ${downloading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                        disabled={downloading}
                    >
                        {downloading ? "Downloading..." : "Download Album"}
                    </button>
                </motion.div>

                {photos.length === 0 ? (
                    <motion.p className="text-xl text-gray-600 col-span-full text-center bg-gray-100 p-8 rounded-lg">
                        No photos found for this album.
                    </motion.p>
                ) : (
                    <motion.div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" variants={listVariants}>
                        {photos.map((photo, index) => (
                            <motion.div key={index} variants={itemVariants}>
                                <img
                                    src={photo}
                                    alt={`Album ${index + 1}`}
                                    className="w-full h-40 object-cover rounded-lg shadow-md cursor-pointer"
                                    onClick={() => setSelectedPhoto(photo)} // Open modal on click
                                    onError={(e) => {
                                        e.target.src = "https://via.placeholder.com/150";
                                    }}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Full-size image modal */}
                {selectedPhoto && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                        <motion.div
                            initial={{opacity: 0, scale: 0.8}}
                            animate={{opacity: 1, scale: 1}}
                            exit={{opacity: 0, scale: 0.8}}
                            className="relative p-4"
                        >
                            <button
                                className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-200"
                                onClick={() => setSelectedPhoto(null)}
                            >
                                <X className="h-6 w-6 text-black"/>
                            </button>
                            <img
                                src={selectedPhoto}
                                alt="Full-size"
                                className="max-w-full max-h-[90vh] rounded-lg shadow-lg"
                            />
                        </motion.div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default PersonalizedAlbum;
