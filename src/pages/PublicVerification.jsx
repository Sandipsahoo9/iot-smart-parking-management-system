import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ref, get, update } from 'firebase/database';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

const PublicVerification = () => {
    const [scanResult, setScanResult] = useState(null);
    const [manualId, setManualId] = useState('');
    const [verificationStatus, setVerificationStatus] = useState(null); // 'valid', 'invalid', 'loading', 'used'
    const [gateTimer, setGateTimer] = useState(0);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Scanner Setup
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText) {
            setScanResult(decodedText);
            verifyTicket(decodedText);
            scanner.clear();
        }

        function onScanFailure(error) {
            // ignore
        }

        return () => {
            scanner.clear().catch(err => console.error(err));
        };
    }, []);

    // Gate Timer Logic
    useEffect(() => {
        let interval;
        if (gateTimer > 0) {
            interval = setInterval(() => {
                setGateTimer((prev) => prev - 1);
            }, 1000);
        } else if (gateTimer === 0 && verificationStatus === 'valid') {
            closeGate();
        }
        return () => clearInterval(interval);
    }, [gateTimer, verificationStatus]);

    const closeGate = () => {
        update(ref(db, 'gate'), {
            command: 'CLOSE',
            status: 'CLOSED',
            timestamp: Date.now()
        }).catch(err => console.error("Error closing gate:", err));
    };

    const openGate = () => {
        setGateTimer(30);
        update(ref(db, 'gate'), {
            command: 'OPEN',
            status: 'OPEN',
            timestamp: Date.now()
        }).catch(err => console.error("Error opening gate:", err));
    };

    const verifyTicket = async (ticketId) => {
        setVerificationStatus('loading');
        setMessage('');

        try {
            const bookingsRef = ref(db, 'bookings');
            const snapshot = await get(bookingsRef);

            if (snapshot.exists()) {
                const bookings = snapshot.val();
                // Find booking by ID
                const bookingEntry = Object.entries(bookings).find(([key, b]) => b.id === ticketId);

                if (bookingEntry) {
                    const [key, booking] = bookingEntry;

                    if (booking.status === 'active') {
                        // Check-in
                        await update(ref(db, `bookings/${key}`), { status: 'checked-in' })
                            .catch(err => {
                                console.error("Error updating booking:", err);
                                throw err;
                            });
                        setVerificationStatus('valid');
                        setMessage(`Check-in Successful! Welcome, ${booking.name}.`);
                        openGate();
                    } else if (booking.status === 'checked-in') {
                        // Check-out
                        await update(ref(db, `bookings/${key}`), { status: 'completed' })
                            .catch(err => {
                                console.error("Error updating booking:", err);
                                throw err;
                            });
                        setVerificationStatus('valid');
                        setMessage(`Check-out Successful! Goodbye, ${booking.name}.`);
                        openGate();
                    } else if (booking.status === 'completed') {
                        setVerificationStatus('used');
                        setMessage('This ticket has already been used.');
                    }
                } else {
                    setVerificationStatus('invalid');
                    setMessage('Ticket ID not found.');
                }
            } else {
                setVerificationStatus('invalid');
                setMessage('No bookings found in system.');
            }
        } catch (error) {
            console.error(error);
            setVerificationStatus('invalid');
            setMessage('System Error. Please try again.');
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualId.trim()) {
            setScanResult(manualId);
            verifyTicket(manualId);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">


            <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
                {!scanResult ? (
                    <>
                        <div id="reader" className="w-full mb-6"></div>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <form onSubmit={handleManualSubmit} className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Enter Ticket ID</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                    placeholder="e.g. BK-X7Z..."
                                    value={manualId}
                                    onChange={(e) => setManualId(e.target.value.toUpperCase())}
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                                >
                                    Verify
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-8">
                        {verificationStatus === 'loading' && <p className="text-gray-500">Verifying...</p>}

                        {verificationStatus === 'valid' && (
                            <div className="animate-fade-in">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-4xl">✅</span>
                                </div>
                                <h2 className="text-2xl font-bold text-green-600">Access Granted</h2>
                                <p className="text-gray-800 font-medium mt-2">{message}</p>

                                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800 mb-1">Gate Closing in</p>
                                    <p className="text-4xl font-mono font-bold text-blue-600">{gateTimer}s</p>
                                </div>
                            </div>
                        )}

                        {(verificationStatus === 'invalid' || verificationStatus === 'used') && (
                            <div>
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${verificationStatus === 'used' ? 'bg-yellow-100' : 'bg-red-100'
                                    }`}>
                                    <span className="text-4xl">
                                        {verificationStatus === 'used' ? '⚠️' : '❌'}
                                    </span>
                                </div>
                                <h2 className={`text-2xl font-bold ${verificationStatus === 'used' ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                    {verificationStatus === 'used' ? 'Already Used' : 'Access Denied'}
                                </h2>
                                <p className="text-gray-600 mt-2">{message}</p>
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="mt-8 bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                        >
                            Scan Another
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicVerification;
