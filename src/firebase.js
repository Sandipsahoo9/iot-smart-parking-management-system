import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Configuration based on the provided image and standard Firebase patterns
// TODO: You MUST provide your API Key here for the app to work!
const firebaseConfig = {
    apiKey: "AIzaSyCUmZZykMZVyW451SeT_vhlr7CQRzPGBUQ",
    authDomain: "smart-parking-system-e59b8.firebaseapp.com",
    databaseURL: "https://smart-parking-system-e59b8-default-rtdb.firebaseio.com",
    projectId: "smart-parking-system-e59b8",
    storageBucket: "smart-parking-system-e59b8.firebasestorage.app",
    messagingSenderId: "760344078921",
    appId: "1:760344078921:web:d1fa39ec52fdea5ec0ad98",
    measurementId: "G-S2EC4GSEEH"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
