import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJournal } from '../../contexts/JournalContext';
import { format } from 'date-fns';
import { FaEdit, FaTrash, FaFilePdf } from 'react-icons/fa';

export default function EntryView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEntry, deleteEntry, exportEntryToPDF } = useJournal();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    async function fetchEntry() {
      try {
        const entryDoc = await getEntry(id);
        if (entryDoc.exists()) { // Fixed - exists is a function, not a property
          setEntry({
            id: entryDoc.id,
            ...entryDoc.data()
          });
        } else {
          setError('Entry not found');
        }
      } catch (error) {
        setError('Failed to load entry. ' + error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEntry();
  }, [id, getEntry]);

  async function handleDelete() {
    try {
      await deleteEntry(id);
      navigate('/entries');
    } catch (error) {
      setError('Failed to delete entry. ' + error.message);
    }
  }

  async function handleExportPDF() {
    try {
      await exportEntryToPDF(id);
    } catch (error) {
      setError('Failed to export entry. ' + error.message);
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="entry-view-container">
      <div className="entry-actions">
        <Link to="/entries" className="btn btn-secondary">
          Back to Entries
        </Link>
        <div className="action-buttons">
          <Link to={`/edit-entry/${id}`} className="btn btn-edit">
            <FaEdit /> Edit
          </Link>
          <button 
            onClick={() => setShowDeleteModal(true)} 
            className="btn btn-delete"
          >
            <FaTrash /> Delete
          </button>
          <button 
            onClick={handleExportPDF} 
            className="btn btn-export"
          >
            <FaFilePdf /> Export PDF
          </button>
        </div>
      </div>

      <div className="entry-content">
        <div className="entry-header">
          <h1>{entry.title}</h1>
          <div className="entry-metadata">
            <span className="entry-date">
              {format(new Date(entry.date.seconds * 1000), 'PPP')}
            </span>
            <span className="entry-mood">
              {entry.mood === 'happy' && '😊'}
              {entry.mood === 'sad' && '😢'}
              {entry.mood === 'angry' && '😠'}
              {entry.mood === 'neutral' && '😐'}
              {entry.mood === 'excited' && '🎉'}
              {entry.mood === 'tired' && '😴'}
            </span>
          </div>
        </div>

        <div 
          className="entry-body" 
          dangerouslySetInnerHTML={{ __html: entry.content }} 
        />

        <div className="entry-tags">
          {entry.tags && entry.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Delete Entry</h3>
            <p>Are you sure you want to delete this entry? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="btn btn-delete"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}