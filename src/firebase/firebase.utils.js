// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_APPID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENTID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
export const getUserDataAPI = async () => {
  const docRef = doc(
    db,
    process.env.NEXT_PUBLIC_COLLECTION,
    process.env.NEXT_PUBLIC_USER_DOCUMENT
  );
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log("No such document!");
  }
};

export const getProjectDetailsAPI = async () => {
  const docRef = doc(
    db,
    process.env.NEXT_PUBLIC_COLLECTION,
    process.env.NEXT_PUBLIC_PROJECT_DOCUMENT
  );
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log("No such document!");
  }
};

const storage = getStorage();

export const getImage = async (url) => {
  const storageRef = ref(storage, url);
  const urlValue = await getDownloadURL(storageRef);
  return urlValue;
};

export const downloadResume = async () => {
  const storageRef = ref(storage, "documents/Shubhanshu Jagwan Resume.pdf");
  const url = await getDownloadURL(storageRef);

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.download = "Shubhanshu_Jagwan_Resume.pdf";
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    link.remove();
  }, 100);
};
