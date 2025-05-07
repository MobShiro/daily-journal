import React, { useState, useRef } from 'react';
import { useJournal } from '../../contexts/JournalContext';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill'; // For rich text editing
import 'react-quill/dist/quill.snow.css';

// Wrapper component to suppress React StrictMode warnings for ReactQuill
const QuillWrapper = ({ value, onChange }) => {
  // This moves the component outside of React's StrictMode warnings
  return (
    <div className="quill-editor-container">
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange} 
      />
    </div>
  );
};

export default function EntryForm({ entryToEdit }) {
  const [title, setTitle] = useState(entryToEdit?.title || '');
  const [content, setContent] = useState(entryToEdit?.content || '');
  const [mood, setMood] = useState(entryToEdit?.mood || 'neutral');
  const [tags, setTags] = useState(entryToEdit?.tags?.join(', ') || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { createEntry, updateEntry } = useJournal();
  const navigate = useNavigate();
  
  const wordCount = content.replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length;

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
      
      if (entryToEdit) {
        await updateEntry(entryToEdit.id, {
          title,
          content,
          mood,
          tags: tagsArray,
          lastUpdated: new Date()
        });
      } else {
        await createEntry(title, content, mood, tagsArray);
      }
      
      navigate('/entries');
    } catch (error) {
      setError('Failed to save entry. ' + error.message);
    }
    setLoading(false);
  }

  return (
    <div className="entry-form-container">
      <h2>{entryToEdit ? 'Edit Journal Entry' : 'New Journal Entry'}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Content</label>
          {/* Using the wrapper component instead of direct ReactQuill */}
          <QuillWrapper value={content} onChange={setContent} />
          <div className="word-count">Words: {wordCount}</div>
        </div>
        
        <div className="form-group">
          <label>How are you feeling?</label>
          <select 
            value={mood} 
            onChange={(e) => setMood(e.target.value)}
          >
            <option value="happy">Happy 😊</option>
            <option value="sad">Sad 😢</option>
            <option value="angry">Angry 😠</option>
            <option value="neutral">Neutral 😐</option>
            <option value="excited">Excited 🎉</option>
            <option value="tired">Tired 😴</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Tags (separated by commas)</label>
          <input 
            type="text" 
            value={tags} 
            onChange={(e) => setTags(e.target.value)} 
            placeholder="personal, work, ideas..." 
          />
        </div>
        
        <button 
          disabled={loading} 
          className="btn btn-primary" 
          type="submit"
        >
          {entryToEdit ? 'Update Entry' : 'Save Entry'}
        </button>
      </form>
    </div>
  );
}