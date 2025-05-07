import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJournal } from '../../contexts/JournalContext';
import EntryForm from './EntryForm';

export default function EditEntry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEntry } = useJournal();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchEntry() {
      try {
        const entryDoc = await getEntry(id);
        if (entryDoc.exists()) {
          setEntry({
            id: entryDoc.id,
            ...entryDoc.data()
          });
        } else {
          setError('Entry not found');
        }
      } catch (error) {
        setError('Failed to load entry: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEntry();
  }, [id, getEntry]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!entry) {
    return <div className="error">Entry not found</div>;
  }

  return <EntryForm entryToEdit={entry} />;
}