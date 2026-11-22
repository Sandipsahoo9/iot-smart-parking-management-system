import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Ticket from '../components/Ticket';
import { ref, push, set, onValue } from 'firebase/database';
import { db } from '../firebase';

const Booking = () => {
    const [step, setStep] = useState('form'); // form, payment, ticket
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        vehicleNo: '',
        slotId: '1' // Default to slot 1 for now
    });
    const [booking, setBooking] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(true);

    // Fetch Real-time Slot Availability
    React.useEffect(() => {
        const sensorsRef = ref(db, 'IR_Sensors');
        const bookingsRef = ref(db, 'bookings');

        // Helper to process data
        const processAvailability = (sensors, bookingsData) => {
            if (!sensors) return;

            const activeBookings = bookingsData
                ? Object.values(bookingsData).filter(b => b.status === 'active' || b.status === 'checked-in')
                : [];

            const bookedSlotIds = activeBookings.map(b => String(b.slotId));
            const validSlots = [];

            for (let i = 1; i <= 12; i++) {
                const irValue = sensors[`IR${i}`];
                // Condition 1: IR Sensor must be 0 (Vacant)
                // Condition 2: No active booking for this slot
                if (irValue === 0 && !bookedSlotIds.includes(String(i))) {
                    validSlots.push(i);
                }
            }
            setAvailableSlots(validSlots);

            // Auto-select first available slot if current selection is invalid
            if (validSlots.length > 0 && !validSlots.includes(Number(formData.slotId))) {
                setFormData(prev => ({ ...prev, slotId: validSlots[0] }));
            }
            setLoadingSlots(false);
        };

        // Listen to both paths
        let currentSensors = null;
        let currentBookings = null;

        const unsubSensors = onValue(sensorsRef, (snap) => {
            currentSensors = snap.val();
            processAvailability(currentSensors, currentBookings);
        });

        const unsubBookings = onValue(bookingsRef, (snap) => {
            currentBookings = snap.val();
            processAvailability(currentSensors, currentBookings);
        });

        return () => {
            unsubSensors();
            unsubBookings();
        };
    }, [formData.slotId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (availableSlots.length === 0) {
            alert("No slots available right now!");
            return;
        }
        setStep('payment');
    };

    const handlePayment = () => {
        setIsProcessing(true);
        // Simulate payment delay
        setTimeout(async () => {
            const bookingId = 'BK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            const newBooking = {
                id: bookingId,
                ...formData,
                timestamp: Date.now(),
                status: 'active'
            };

            try {
                // Save to Firebase
                const bookingsRef = ref(db, 'bookings');
                const newBookingRef = push(bookingsRef);
                await set(newBookingRef, newBooking);

                setBooking(newBooking);
                setStep('ticket');
            } catch (error) {
                console.error("Error saving booking:", error);
                alert(`Failed to save booking: ${error.message}`);
            } finally {
                setIsProcessing(false);
            }
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-md mx-auto">


                {step === 'form' && (
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Book a Parking Slot</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                                <input
                                    type="text"
                                    name="vehicleNo"
                                    required
                                    placeholder="e.g. KA-01-AB-1234"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData.vehicleNo}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Slot</label>
                                {loadingSlots ? (
                                    <p className="text-sm text-gray-500">Checking availability...</p>
                                ) : availableSlots.length === 0 ? (
                                    <p className="text-red-500 font-bold">No slots available!</p>
                                ) : (
                                    <select
                                        name="slotId"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        value={formData.slotId}
                                        onChange={handleChange}
                                    >
                                        {availableSlots.map(num => (
                                            <option key={num} value={num}>Slot {num}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors shadow-md mt-4"
                            >
                                Proceed to Payment
                            </button>
                        </form>
                    </div>
                )}

                {step === 'payment' && (
                    <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Gateway</h2>
                        <div className="bg-blue-50 p-4 rounded-lg mb-6">
                            <p className="text-gray-600 mb-2">Amount to Pay</p>
                            <p className="text-3xl font-bold text-blue-600">₹50.00</p>
                        </div>
                        <p className="text-gray-500 mb-6 text-sm">Click below to simulate a successful payment transaction.</p>

                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className={`w-full py-3 rounded-lg font-bold transition-colors shadow-md text-white
                ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
              `}
                        >
                            {isProcessing ? 'Processing...' : 'Pay Now'}
                        </button>
                    </div>
                )}

                {step === 'ticket' && booking && (
                    <Ticket booking={booking} />
                )}
            </div>
        </div>
    );
};

export default Booking;
