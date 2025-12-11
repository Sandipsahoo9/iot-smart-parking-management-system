import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const Ticket = ({ booking }) => {
    const ticketRef = useRef();

    const handlePrint = () => {
        const printContent = ticketRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // Reload to restore state
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden my-8 border border-gray-200">
            <div ref={ticketRef} className="p-8">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Parking Ticket</h2>
                    <p className="text-gray-500 text-sm">Smart Parking System</p>
                </div>

                <div className="flex justify-center mb-6">
                    <QRCodeCanvas value={booking.id} size={150} />
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Booking ID</span>
                        <span className="font-mono font-medium">{booking.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Name</span>
                        <span className="font-medium">{booking.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Vehicle No</span>
                        <span className="font-medium">{booking.vehicleNo}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Slot</span>
                        <span className="font-medium">Slot {booking.slotId}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Date</span>
                        <span className="font-medium">{new Date(booking.timestamp).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="text-center text-xs text-gray-400">
                    Please scan this ticket at the gate entry.
                </div>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-center">
                <button
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <span>🖨️</span> Print Ticket
                </button>
            </div>
        </div>
    );
};

export default Ticket;
