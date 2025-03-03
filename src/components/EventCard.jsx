import React from "react";
import {Calendar, Clock} from "lucide-react";

const EventCard = ({event}) => {
    return (
        <div
            className="bg-white/30 backdrop-blur-md shadow-lg border border-white/20 rounded-xl p-6 transition-transform transform hover:scale-105 hover:shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.name}</h3>
            <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar className="h-4 w-4 mr-2"/>
                <span>{event.date}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2"/>
                <span>{event.status}</span>
            </div>
        </div>
    );
};

export default EventCard;
