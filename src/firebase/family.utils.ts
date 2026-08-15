import { doc, getDoc, collection, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase.utils";
import { FamilyMember } from "@/types";

const SESSION_KEY = "family_tree_session";
const SESSION_TIMEOUT_MS = 1800000; // 30 minutes

interface ActiveSession {
  hash: string;
  expiry: number;
}

/**
 * Computes the SHA-256 hash of a string using the native Web Crypto API.
 * Runs entirely on the client, keeping it 100% free and secure.
 */
export async function hashPasscode(passcode: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(passcode);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verifies if the entered passcode matches a document hash in Firestore.
 */
export async function checkPasscode(passcode: string): Promise<boolean> {
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
export function saveSession(hash: string): void {
  if (typeof window === "undefined") return;
  const session: ActiveSession = {
    hash,
    expiry: Date.now() + SESSION_TIMEOUT_MS,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Validates if there is a currently active, non-expired session.
 */
export function hasActiveSession(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return false;

  try {
    const session: ActiveSession = JSON.parse(raw);
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
export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Fetches all family members from the Firestore collection.
 * 100% Spark-plan compatible.
 */
export async function fetchFamilyMembers(): Promise<FamilyMember[]> {
  try {
    const colRef = collection(db, "family_members");
    const querySnapshot = await getDocs(colRef);
    const members: FamilyMember[] = [];
    querySnapshot.forEach((docSnap) => {
      members.push({ id: docSnap.id, ...(docSnap.data() as Omit<FamilyMember, "id">) });
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
export async function saveFamilyMember(id: string, memberData: Partial<FamilyMember>): Promise<boolean> {
  try {
    const docRef = doc(db, "family_members", id);
    await setDoc(docRef, memberData, { merge: true });
    return true;
  } catch (err) {
    console.error("Error saving family member:", err);
    throw new Error("Failed to save family member to database.");
  }
}

/**
 * Deletes a family member and cleans up reciprocal relational references in other documents.
 */
export async function deleteFamilyMemberAPI(memberId: string, allMembers: FamilyMember[]): Promise<boolean> {
  try {
    // 1. Delete document from Firestore
    const docRef = doc(db, "family_members", memberId);
    await deleteDoc(docRef);

    // 2. Clean up references in other members (fatherId, motherId, spouseId)
    for (const member of allMembers) {
      if (member.id === memberId) continue;
      const updates: Partial<FamilyMember> = {};
      if (member.fatherId === memberId) updates.fatherId = "";
      if (member.motherId === memberId) updates.motherId = "";
      if (member.spouseId === memberId) updates.spouseId = "";

      if (Object.keys(updates).length > 0) {
        await saveFamilyMember(member.id, updates);
      }
    }
    return true;
  } catch (err) {
    console.error("Error deleting family member:", err);
    throw new Error("Failed to delete family member from database.");
  }
}

/**
 * Unlinks a specific relationship from a member (e.g. unlinking father, mother, or spouse).
 */
export async function unlinkRelationAPI(
  memberId: string,
  relType: "father" | "mother" | "spouse",
  targetId?: string
): Promise<boolean> {
  try {
    if (relType === "father") {
      await saveFamilyMember(memberId, { fatherId: "" });
    } else if (relType === "mother") {
      await saveFamilyMember(memberId, { motherId: "" });
    } else if (relType === "spouse") {
      await saveFamilyMember(memberId, { spouseId: "" });
      if (targetId) {
        await saveFamilyMember(targetId, { spouseId: "" });
      }
    }
    return true;
  } catch (err) {
    console.error("Error unlinking relation:", err);
    throw new Error("Failed to unlink relationship.");
  }
}
