
import React, { useState, useEffect } from 'react';
import Slot from '../components/Slot';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';

const Dashboard = () => {
    const [slots, setSlots] = useState({});
    const [overallStatus, setOverallStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const sensorsRef = ref(db, 'IR_Sensors');

        const unsubscribe = onValue(sensorsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Map IR1...IR6 to slot objects
                // Assuming 0 = Vacant, 1 = Occupied. 
                // If your sensors are Active Low (0 = Occupied), swap the logic below.
                const mappedSlots = {};
                for (let i = 1; i <= 6; i++) {
                    const key = `IR${i}`;
                    const val = data[key];
                    // Logic: val === 0 ? 'occupied' : 'vacant'
                    // User requirement: 0 = Occupied, 1 = Vacant
                    mappedSlots[i] = { status: val === 0 ? 'occupied' : 'vacant' };
                }
                setSlots(mappedSlots);
            } else {
                // Fallback if no data
                setSlots({});
            }
            setLoading(false);
        });

        // Listen to Gate Status
        const gateRef = ref(db, 'gate');
        const unsubscribeGate = onValue(gateRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.status) {
                setOverallStatus(data.status);
            }
        });

        return () => {
            unsubscribe();
            unsubscribeGate();
        };
    }, []);

    const totalSlots = 6;
    const occupiedCount = Object.values(slots).filter(s => s.status === 'occupied').length;
    const vacantCount = totalSlots - occupiedCount;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-500">Real-time Parking Availability</p>
                        {/* Show overall status if available */}
                        {overallStatus && (
                            <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                Gate : {overallStatus}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Total Slots</h3>
                        <p className="text-4xl font-bold text-gray-900 mt-2">{totalSlots}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-green-600 text-sm font-medium uppercase">Available</h3>
                        <p className="text-4xl font-bold text-green-600 mt-2">{vacantCount}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-red-600 text-sm font-medium uppercase">Occupied</h3>
                        <p className="text-4xl font-bold text-red-600 mt-2">{occupiedCount}</p>
                    </div>
                </div>

                {/* Slots Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center py-10 text-gray-500">Loading sensor data...</div>
                    ) : (
                        [1, 2, 3, 4, 5, 6].map(id => (
                            <Slot
                                key={id}
                                id={id}
                                status={slots[id]?.status || 'vacant'}
                            />
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};
export default Dashboard;

