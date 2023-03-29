import { FirebaseOptions, getApp, initializeApp } from "firebase/app";

const config: FirebaseOptions = {
  //   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  //   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  //   databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL,
  //   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  //   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  apiKey: "AIzaSyC10QGQB6zGmTQnK1FLW4k2I2-C5HLIL3M",
  authDomain: "ngpt.vercel.app",
  projectId: "next-gpt",
  storageBucket: "next-gpt.appspot.com",
  messagingSenderId: "693328635564",
  appId: "1:693328635564:web:53ee11c2a3ab7bb7516109",
};

function createFirebaseApp(config: FirebaseOptions) {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return getApp();
  } catch {
    return initializeApp(config);
  }
}

const firebaseApp = createFirebaseApp(config);

export default firebaseApp;
