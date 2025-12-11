
import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Link } from 'react-router-dom';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../firebase';

const AdminDashboard = () => {
    const [scanResult, setScanResult] = useState(null);
    const [gateStatus, setGateStatus] = useState('CLOSED');
    const [gateTimer, setGateTimer] = useState(0);
    const [bookings, setBookings] = useState([]);
    const bookingsRef = React.useRef([]);

    useEffect(() => {
        // Listen to Bookings
        const bookingsDbRef = ref(db, 'bookings');
        const unsubscribeBookings = onValue(bookingsDbRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const bookingsList = Object.entries(data).map(([key, val]) => ({
                    key,
                    ...val
                })).sort((a, b) => b.timestamp - a.timestamp);
                setBookings(bookingsList);
                bookingsRef.current = bookingsList; // Update ref
            } else {
                setBookings([]);
                bookingsRef.current = [];
            }
        });

        // Listen to Gate Status (optional, if ESP32 updates it too)
        const gateRef = ref(db, 'gate');
        const unsubscribeGate = onValue(gateRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.status) {
                setGateStatus(data.status); // 'OPEN' or 'CLOSED'
            }
        });

        // Scanner Setup
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText, decodedResult) {
            console.log(`Code matched = ${decodedText} `, decodedResult);
            setScanResult(decodedText);
            verifyTicket(decodedText);
        }

        function onScanFailure(error) {
            // handle scan failure
        }

        return () => {
            unsubscribeBookings();
            unsubscribeGate();
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        };
    }, []);

    // Timer logic for UI countdown
    useEffect(() => {
        let interval;
        if (gateStatus === 'OPEN' && gateTimer > 0) {
            interval = setInterval(() => {
                setGateTimer((prev) => prev - 1);
            }, 1000);
        } else if (gateTimer === 0 && gateStatus === 'OPEN') {
            // Auto-close logic handled by ESP32 usually, but we can force it here too
            // closeGate(); 
        }
        return () => clearInterval(interval);
    }, [gateStatus, gateTimer]);

    const verifyTicket = async (ticketId) => {
        // Check against real bookings using Ref to avoid stale state
        const booking = bookingsRef.current.find(b => b.id === ticketId);

        if (booking) {
            if (booking.status === 'active') {
                // First Scan: Check-in
                if (window.confirm(`Check-in ${booking.name} (${booking.vehicleNo})?`)) {
                    await update(ref(db, `bookings/${booking.key}`), { status: 'checked-in' })
                        .catch(err => console.error("Error updating booking:", err));
                    openGate();
                    alert(`Check-in Successful! Gate Opening...`);
                }
            } else if (booking.status === 'checked-in') {
                // Second Scan: Check-out
                if (window.confirm(`Check-out ${booking.name} (${booking.vehicleNo})?`)) {
                    await update(ref(db, `bookings/${booking.key}`), { status: 'completed' })
                        .catch(err => console.error("Error updating booking:", err));
                    openGate();
                    alert(`Check-out Successful! Gate Opening...`);
                }
            } else if (booking.status === 'completed') {
                alert(`Ticket ${ticketId} has already been used.`);
            }
        } else {
            alert(`Invalid Ticket: ${ticketId}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
    };

    const openGate = () => {
        setGateStatus('OPEN');
        setGateTimer(30);
        // Update Firebase for ESP32 to read
        update(ref(db, 'gate'), {
            command: 'OPEN',
            status: 'OPEN',
            timestamp: Date.now()
        }).catch(err => {
            console.error("Error opening gate:", err);
            alert("Failed to open gate. Check console.");
        });

        // Auto-close command after 30s (optional, better handled by ESP32 firmware)
        setTimeout(() => closeGate(), 30000);
    };

    const closeGate = () => {
        setGateStatus('CLOSED');
        setGateTimer(0);
        update(ref(db, 'gate'), {
            command: 'CLOSE',
            status: 'CLOSED',
            timestamp: Date.now()
        }).catch(err => console.error("Error closing gate:", err));
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 text-center md:text-left">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500">Ticket Verification & Gate Control</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <Link to="/" className="text-blue-600 hover:text-blue-800">
                            ← Public View
                        </Link>
                        <button onClick={handleLogout} className="text-red-600 hover:text-red-800 font-medium">
                            Logout
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Scanner & Gate Control */}
                    <div className="space-y-6">
                        {/* Scanner Section */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">QR Code Scanner</h2>
                            <div id="reader" className="w-full"></div>
                            {scanResult && (
                                <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-center">
                                    Last Scanned: <span className="font-mono font-bold">{scanResult}</span>
                                </div>
                            )}
                        </div>

                        {/* Gate Control Section */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Gate Control</h2>
                                <span className={`px - 4 py - 1 rounded - full text - sm font - bold ${gateStatus === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    } `}>
                                    {gateStatus}
                                </span>
                            </div>

                            {gateStatus === 'OPEN' && (
                                <div className="mb-4 text-center">
                                    <p className="text-gray-500 text-sm">Closing in</p>
                                    <p className="text-4xl font-mono font-bold text-gray-800">{gateTimer}s</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={openGate}
                                    disabled={gateStatus === 'OPEN'}
                                    className={`py - 3 rounded - lg font - bold transition - colors ${gateStatus === 'OPEN'
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                        } `}
                                >
                                    Open Gate (30s)
                                </button>
                                <button
                                    onClick={closeGate}
                                    disabled={gateStatus === 'CLOSED'}
                                    className={`py - 3 rounded - lg font - bold transition - colors ${gateStatus === 'CLOSED'
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                        } `}
                                >
                                    Force Close
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Recent Bookings */}
                    <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Bookings</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                        <th className="pb-3">ID</th>
                                        <th className="pb-3">Name</th>
                                        <th className="pb-3">Vehicle</th>
                                        <th className="pb-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {bookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50">
                                            <td className="py-3 font-mono text-sm">{booking.id}</td>
                                            <td className="py-3">{booking.name}</td>
                                            <td className="py-3">{booking.vehicleNo}</td>
                                            <td className="py-3">
                                                <span className={`px - 2 py - 1 rounded text - xs ${booking.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                    } `}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
