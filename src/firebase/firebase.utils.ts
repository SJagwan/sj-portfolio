// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { doc, getDoc, getFirestore, Firestore, DocumentData } from "firebase/firestore";
import { getStorage, ref, getDownloadURL, FirebaseStorage } from "firebase/storage";
import { UserInfo, Project } from "@/types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_APPID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENTID,
};

// Initialize Firebase safely (avoid re-initialization)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db: Firestore = getFirestore(app);

export const getUserDataAPI = async (): Promise<UserInfo | undefined> => {
  const collectionName = process.env.NEXT_PUBLIC_COLLECTION;
  const docName = process.env.NEXT_PUBLIC_USER_DOCUMENT;
  if (!collectionName || !docName) {
    console.warn("User data collection or document env variables are missing.");
    return undefined;
  }
  const docRef = doc(db, collectionName, docName);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserInfo;
  } else {
    console.log("No such user document!");
    return undefined;
  }
};

export const getProjectDetailsAPI = async (): Promise<{ projects: Project[] } | undefined> => {
  const collectionName = process.env.NEXT_PUBLIC_COLLECTION;
  const docName = process.env.NEXT_PUBLIC_PROJECT_DOCUMENT;
  if (!collectionName || !docName) {
    console.warn("Project data collection or document env variables are missing.");
    return undefined;
  }
  const docRef = doc(db, collectionName, docName);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as { projects: Project[] };
  } else {
    console.log("No such project document!");
    return undefined;
  }
};

export const storage: FirebaseStorage = getStorage(app);

export const getImage = async (url?: string): Promise<string> => {
  if (!url) return "";
  // If it's already an absolute web URL or data URI, return as-is
  if (typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:"))) {
    return url;
  }
  try {
    const storageRef = ref(storage, url);
    const urlValue = await getDownloadURL(storageRef);
    return urlValue;
  } catch (error) {
    console.warn(`Failed to resolve image URL for "${url}":`, error);
    return typeof url === "string" ? url : "";
  }
};

export const downloadResume = async (): Promise<boolean> => {
  try {
    const storageRef = ref(storage, "documents/Shubhanshu Jagwan Resume.pdf");
    const url = await getDownloadURL(storageRef);

    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = "Shubhanshu_Jagwan_Resume.pdf";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      link.remove();
    }, 100);
    return true;
  } catch (error) {
    console.error("Failed to download resume:", error);
    throw error;
  }
};
