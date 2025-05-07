import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { jsPDF } from 'jspdf';

const JournalContext = createContext();

export function useJournal() {
  return useContext(JournalContext);
}

export function JournalProvider({ children }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      const entriesRef = collection(db, 'entries');
      const q = query(
        entriesRef,
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const entriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEntries(entriesData);
        setLoading(false);
      });

      return unsubscribe;
    } else {
      setEntries([]);
      setLoading(false);
    }
  }, [currentUser]);

  async function createEntry(title, content, mood, tags) {
    return addDoc(collection(db, 'entries'), {
      title,
      content,
      mood,
      tags,
      date: new Date(),
      userId: currentUser.uid
    });
  }

  async function getEntry(id) {
    const docRef = doc(db, 'entries', id);
    return getDoc(docRef);
  }

  async function updateEntry(id, data) {
    const entryRef = doc(db, 'entries', id);
    return updateDoc(entryRef, data);
  }

  async function deleteEntry(id) {
    const entryRef = doc(db, 'entries', id);
    return deleteDoc(entryRef);
  }

  function exportEntryToPDF(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const entryDoc = await getEntry(id);
        if (!entryDoc.exists()) {
          throw new Error('Entry not found');
        }
        
        const entryData = entryDoc.data();
        const pdf = new jsPDF();
        
        // Add title
        pdf.setFontSize(18);
        pdf.text(entryData.title, 20, 20);
        
        // Add date
        pdf.setFontSize(12);
        const date = new Date(entryData.date.seconds * 1000);
        pdf.text(`Date: ${date.toLocaleDateString()}`, 20, 30);
        
        // Add mood
        pdf.text(`Mood: ${entryData.mood}`, 20, 40);
        
        // Add content (stripping HTML tags)
        pdf.setFontSize(12);
        const contentText = entryData.content.replace(/<[^>]*>/g, '');
        
        // Split content into lines to fit on page
        const splitContent = pdf.splitTextToSize(contentText, 170);
        pdf.text(splitContent, 20, 50);
        
        // Add tags at bottom
        if (entryData.tags && entryData.tags.length > 0) {
          pdf.text(`Tags: ${entryData.tags.join(', ')}`, 20, pdf.internal.pageSize.height - 20);
        }
        
        // Save PDF with title
        pdf.save(`journal_${entryData.title.replace(/\s+/g, '_')}.pdf`);
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  const value = {
    entries,
    createEntry,
    getEntry,
    updateEntry,
    deleteEntry,
    exportEntryToPDF
  };

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  );
}