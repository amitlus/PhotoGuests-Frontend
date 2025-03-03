import {QRCodeCanvas} from "qrcode.react";
import {getBackendBaseUrl} from "../utils/apiConfig";

const EventQRCode = ({eventId}) => {
    const API_BASE_URL = getBackendBaseUrl();
    const eventFormUrl = `${API_BASE_URL}/guest-form/${eventId}`;

    return (
        <div className="text-center bg-white/30 backdrop-blur-md shadow-lg border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scan to Fill the Guest Form</h3>
            <div className="inline-block p-4 bg-white rounded-lg shadow-md">
                <QRCodeCanvas value={eventFormUrl} size={256}/>
            </div>
        </div>
    );
};

export default EventQRCode;
