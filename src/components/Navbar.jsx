import React from "react";
import {Link, useNavigate} from "react-router-dom";
import {Home, Calendar, LogOut, LogIn} from "lucide-react";
import {GoogleLogin} from "@react-oauth/google";
import {getBackendBaseUrl} from "../utils/apiConfig";

const Navbar = ({user, setUser}) => {
    const navigate = useNavigate();

    const handleSignOut = () => {
        localStorage.removeItem("user");
        setUser(null);
        navigate("/");
    };

    const handleLoginSuccess = async (credentialResponse) => {
        const {credential} = credentialResponse;

        try {
            const API_BASE_URL = getBackendBaseUrl();
            const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({token: credential}),
            });

            if (!response.ok) throw new Error("Token verification failed");

            const data = await response.json();
            const userWithToken = {...data.user, token: data.user.token};

            localStorage.setItem("user", JSON.stringify(userWithToken));
            setUser(userWithToken);
        } catch (error) {
            console.error("Error verifying Google token:", error);
        }
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-blue-600">
                    PhotoGuestsAI
                </Link>
                <div className="flex space-x-4">
                    <Link to="/" className="text-gray-700 hover:text-blue-600 flex items-center">
                        <Home className="h-5 w-5 mr-1"/> Home
                    </Link>
                    {user ? (
                        <>
                            <Link to="/events" className="text-gray-700 hover:text-blue-600 flex items-center">
                                <Calendar className="h-5 w-5 mr-1"/> Events
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="text-gray-700 hover:text-blue-600 flex items-center"
                            >
                                <LogOut className="h-5 w-5 mr-1"/> Sign Out
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <LogIn className="h-5 w-5 text-gray-700"/>
                            <GoogleLogin onSuccess={handleLoginSuccess} onError={() => console.error("Login Failed")}/>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
