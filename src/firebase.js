import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAGk8zbgP1uzLMAfIL3aGM---zw1I7Q-vw",
  authDomain: "uaspbk.firebaseapp.com",
  projectId: "uaspbk",
  storageBucket: "uaspbk.appspot.com",
  messagingSenderId: "1087406327371",
  appId: "1:1087406327371:web:f24c08e9595e84cd942fce",
  measurementId: "G-R7Z8Q6W7BC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
