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
  onSnapshot,
  Timestamp,
  getDocs
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
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      setError(null);
      let unsubscribe = () => {};
      
      const setupListener = async () => {
        try {
          const entriesRef = collection(db, 'entries');
          const q = query(
            entriesRef,
            where('userId', '==', currentUser.uid),
            orderBy('date', 'desc')
          );
          
          console.log('Setting up Firestore listener for entries with userId:', currentUser.uid);
          
          unsubscribe = onSnapshot(q, 
            (snapshot) => {
              console.log('Entries snapshot received, count:', snapshot.docs.length);
              const entriesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              setEntries(entriesData);
              setLoading(false);
            },
            (err) => {
              console.error('Error in Firestore snapshot listener:', err);
              
              // Check if the error is related to missing index
              if (err.message && err.message.includes("requires an index")) {
                setError({
                  message: "This application requires a database index that hasn't been created yet.",
                  isIndexError: true,
                  indexUrl: err.message.match(/https:\/\/console\.firebase\.google\.com[^\s"]*/)?.[0] || null
                });
                
                // Fallback to a one-time query without ordering
                const fallbackQuery = query(entriesRef, where('userId', '==', currentUser.uid));
                getDocs(fallbackQuery)
                  .then(snapshot => {
                    const entriesData = snapshot.docs.map(doc => ({
                      id: doc.id,
                      ...doc.data()
                    }));
                    
                    // Sort client-side instead
                    entriesData.sort((a, b) => {
                      if (!a.date || !b.date) return 0;
                      return b.date.seconds - a.date.seconds; // desc order
                    });
                    
                    setEntries(entriesData);
                    setLoading(false);
                  })
                  .catch(fallbackErr => {
                    console.error('Fallback query failed:', fallbackErr);
                    setError({
                      message: "Failed to load entries: " + fallbackErr.message,
                      isIndexError: false
                    });
                    setLoading(false);
                  });
              } else {
                setError({
                  message: err.message,
                  isIndexError: false
                });
                setLoading(false);
              }
            }
          );
        } catch (err) {
          console.error('Error setting up Firestore listener:', err);
          setError({
            message: err.message,
            isIndexError: false
          });
          setLoading(false);
        }
      };
      
      setupListener();
      return () => unsubscribe();
    } else {
      setEntries([]);
      setLoading(false);
    }
  }, [currentUser]);

  async function createEntry(title, content, mood, tags) {
    try {
      console.log('Creating entry with data:', { title, content, mood, tags, userId: currentUser.uid });
      
      const entryData = {
        title,
        content,
        mood,
        tags,
        date: Timestamp.now(),
        userId: currentUser.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, 'entries'), entryData);
      console.log('Entry created with ID:', docRef.id);
      return docRef;
    } catch (err) {
      console.error('Error creating entry:', err);
      throw err;
    }
  }

  async function getEntry(id) {
    try {
      console.log('Fetching entry with ID:', id);
      const docRef = doc(db, 'entries', id);
      const docSnap = await getDoc(docRef);
      return docSnap;
    } catch (err) {
      console.error('Error fetching entry:', err);
      throw err;
    }
  }

  async function updateEntry(id, data) {
    try {
      console.log('Updating entry with ID:', id, 'Data:', data);
      const entryRef = doc(db, 'entries', id);
      
      // Add updatedAt timestamp
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(entryRef, updateData);
      return true;
    } catch (err) {
      console.error('Error updating entry:', err);
      throw err;
    }
  }

  async function deleteEntry(id) {
    try {
      console.log('Deleting entry with ID:', id);
      const entryRef = doc(db, 'entries', id);
      await deleteDoc(entryRef);
      return true;
    } catch (err) {
      console.error('Error deleting entry:', err);
      throw err;
    }
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
    loading,
    error,
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