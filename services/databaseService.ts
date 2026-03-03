import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  deleteDoc,
  orderBy 
} from "firebase/firestore";
import { db } from "./firebase";
import { CaseData } from "../types";

const COLLECTION_NAME = "cases";

// 1. Simpan Data Perkara Baru
export const saveCaseToFirestore = async (caseData: Omit<CaseData, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...caseData,
      createdAt: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

// 2. Ambil Semua Data (Untuk menu Berkas Terinput)
export const getAllCases = async (): Promise<CaseData[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CaseData[];
  } catch (error) {
    console.error("Error getting documents: ", error);
    return [];
  }
};

// 3. Cari Perkara Spesifik (Untuk Dashboard Search)
export const findCaseByNumber = async (caseNumber: string): Promise<CaseData | null> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("caseNumber", "==", caseNumber)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0];
      return { id: docData.id, ...docData.data() } as CaseData;
    }
    return null;
  } catch (error) {
    console.error("Error searching document: ", error);
    return null;
  }
};

// 4. Update Data Perkara
export const updateCaseInFirestore = async (id: string, updatedData: Partial<CaseData>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updatedData);
    return { success: true };
  } catch (error) {
    console.error("Error updating document: ", error);
    throw error;
  }
};

// 5. Hapus Data
export const deleteCaseFromFirestore = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting document: ", error);
    throw error;
  }
};
