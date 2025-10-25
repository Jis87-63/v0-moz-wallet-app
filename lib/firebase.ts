import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyDj1qqCBztEpF31n9UU3DFKwiymc2Bd-iM",
  authDomain: "bot-ia-20e75.firebaseapp.com",
  databaseURL: "https://bot-ia-20e75-default-rtdb.firebaseio.com",
  projectId: "bot-ia-20e75",
  storageBucket: "bot-ia-20e75.appspot.com",
  messagingSenderId: "601684351023",
  appId: "1:601684351023:android:e94d0ab92f512c4cb80eda",
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const database = getDatabase(app)
const googleProvider = new GoogleAuthProvider()

export { app, auth, database, googleProvider }
