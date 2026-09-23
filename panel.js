import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics";

const firebaseConfig =
 {
  apiKey: "AIzaSyC3fqlnY7FW0pWHZeHeUnv5uokv9iZyWCw",
  authDomain: "deneme-emaya.firebaseapp.com",
  projectId: "deneme-emaya",
  storageBucket: "deneme-emaya.firebasestorage.app",
  messagingSenderId: "503994031405",
  appId: "1:503994031405:web:8ac6b8ee25f90ec4be47a4",
  measurementId: "G-VSEHJ2SW6Q"
 };

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


