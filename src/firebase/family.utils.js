import { doc, getDoc, collection, getDocs, setDoc } from "firebase/firestore";
import { db } from "./firebase.utils";


const SESSION_KEY = "family_tree_session";
const SESSION_TIMEOUT_MS = 1800000;

/**
 * Computes the SHA-256 hash of a string using the native Web Crypto API.
 * Runs entirely on the client, keeping it 100% free and secure.
 */
export async function hashPasscode(passcode) {
  const msgBuffer = new TextEncoder().encode(passcode);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verifies if the entered passcode matches a document hash in Firestore.
 */
export async function checkPasscode(passcode) {
  try {
    const hash = await hashPasscode(passcode);
    const docRef = doc(db, "gatekeeper", hash);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      saveSession(hash);
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error checking passcode:", err);
    throw new Error("Validation failed. Please try again.");
  }
}

/**
 * Saves the authenticated session hash and expiry timestamp locally.
 */
export function saveSession(hash) {
  if (typeof window === "undefined") return;
  const session = {
    hash,
    expiry: Date.now() + SESSION_TIMEOUT_MS,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Validates if there is a currently active, non-expired session.
 */
export function hasActiveSession() {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return false;

  try {
    const session = JSON.parse(raw);
    if (Date.now() < session.expiry) {
      return true;
    }
    // Expired
    clearSession();
    return false;
  } catch (e) {
    clearSession();
    return false;
  }
}

/**
 * Clears the authenticated session.
 */
export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Fetches all family members from the Firestore collection.
 * 100% Spark-plan compatible.
 */
export async function fetchFamilyMembers() {
  try {
    const colRef = collection(db, "family_members");
    const querySnapshot = await getDocs(colRef);
    const members = [];
    querySnapshot.forEach((doc) => {
      members.push({ id: doc.id, ...doc.data() });
    });
    return members;
  } catch (err) {
    console.error("Error fetching family members:", err);
    throw new Error("Failed to load family members from database.");
  }
}
/**
 * Saves or updates a family member document in the Firestore database.
 * 100% free Spark-plan compatible.
 */
export async function saveFamilyMember(id, memberData) {
  try {
    const docRef = doc(db, "family_members", id);
    await setDoc(docRef, memberData, { merge: true });
    return true;
  } catch (err) {
    console.error("Error saving family member:", err);
    throw new Error("Failed to save family member to database.");
  }
}

