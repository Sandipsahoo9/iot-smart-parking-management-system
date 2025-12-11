import React from 'react';

const Slot = ({ id, status }) => {
    const isOccupied = status === 'occupied';

    return (
        <div className={`
      relative flex flex-col items-center justify-center p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105
      ${isOccupied
                ? 'bg-red-50 border-2 border-red-200'
                : 'bg-green-50 border-2 border-green-200'}
    `}>
            <div className={`
        w-16 h-16 rounded-full flex items-center justify-center mb-4 text-2xl font-bold
        ${isOccupied ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}
      `}>
                {id}
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-1">Slot {id}</h3>

            <span className={`
        px-3 py-1 rounded-full text-sm font-medium
        ${isOccupied ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}
      `}>
                {isOccupied ? 'Occupied' : 'Vacant'}
            </span>

            {/* Car Icon Illustration */}
            {isOccupied && (
                <div className="absolute opacity-20 text-6xl text-red-500">
                    🚗
                </div>
            )}
        </div>
    );
};

export default Slot;
