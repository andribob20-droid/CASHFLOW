import React from 'react';

interface WelcomeModalProps {
    onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 text-center">
            <div className="bg-white rounded-lg p-10 max-w-md w-full shadow-2xl">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 leading-tight">
                    UDAH SOLAWAT BELUM HARI INI MAHASISWA PKU?
                </h2>
                <button 
                    onClick={onClose} 
                    className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform transform hover:scale-105"
                >
                    Masuk
                </button>
            </div>
        </div>
    );
};

export default WelcomeModal;
