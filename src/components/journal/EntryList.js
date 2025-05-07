import React, { useState, useEffect } from 'react';
import { useJournal } from '../../contexts/JournalContext';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FaPlus, FaFilter, FaSearch, FaSort, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

export default function EntryList() {
  const { entries, loading, error } = useJournal();
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMood, setFilterMood] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Extract all unique tags from entries
  const allTags = [...new Set(entries.flatMap(entry => entry.tags || []))];

  useEffect(() => {
    console.log('EntryList: Processing entries, count:', entries.length);
    let result = [...entries];
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(entry => 
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by mood
    if (filterMood) {
      result = result.filter(entry => entry.mood === filterMood);
    }
    
    // Filter by tag
    if (filterTag) {
      result = result.filter(entry => 
        entry.tags && entry.tags.includes(filterTag)
      );
    }
    
    // Sort entries
    result.sort((a, b) => {
      if (!a.date || !b.date) {
        return 0;
      }
      const dateA = a.date.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredEntries(result);
  }, [entries, searchTerm, filterMood, filterTag, sortOrder]);

  return (
    <div className="entry-list-container fade-in">
      <h2>Journal Entries</h2>
      
      <div className="entry-controls">
        <div className="search-filter">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-select">
            <FaFilter className="filter-icon" />
            <select
              value={filterMood}
              onChange={(e) => setFilterMood(e.target.value)}
            >
              <option value="">All Moods</option>
              <option value="happy">Happy 😊</option>
              <option value="sad">Sad 😢</option>
              <option value="angry">Angry 😠</option>
              <option value="neutral">Neutral 😐</option>
              <option value="excited">Excited 🎉</option>
              <option value="tired">Tired 😴</option>
            </select>
          </div>
          
          <div className="filter-select">
            <FaFilter className="filter-icon" />
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-select">
            <FaSort className="filter-icon" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
        
        <Link to="/new-entry" className="btn btn-primary">
          <FaPlus /> New Entry
        </Link>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading your journal entries...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          {error.isIndexError ? (
            <>
              <FaExclamationTriangle className="error-icon" />
              <p className="error-message">{error.message}</p>
              {error.indexUrl && (
                <div className="error-actions">
                  <p>Please create the required database index to continue:</p>
                  <a 
                    href={error.indexUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-primary"
                  >
                    Create Index
                  </a>
                  <p className="error-note">After creating the index, please reload this page.</p>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="error-message">Error loading entries: {error.message || error}</p>
              <p>Please try refreshing the page or check your connection.</p>
            </>
          )}
        </div>
      ) : (
        <div className="entry-list">
          {filteredEntries.length === 0 ? (
            <div className="no-entries">
              <p>No entries found. Start writing your first journal entry!</p>
              <Link to="/new-entry" className="btn btn-primary mt-3">
                <FaPlus /> Create Your First Entry
              </Link>
            </div>
          ) : (
            filteredEntries.map(entry => (
              <Link 
                to={`/entry/${entry.id}`}
                className="entry-card"
                key={entry.id}
              >
                <div className="entry-header">
                  <h3>{entry.title}</h3>
                  <div className="entry-mood">
                    {entry.mood === 'happy' && '😊'}
                    {entry.mood === 'sad' && '😢'}
                    {entry.mood === 'angry' && '😠'}
                    {entry.mood === 'neutral' && '😐'}
                    {entry.mood === 'excited' && '🎉'}
                    {entry.mood === 'tired' && '😴'}
                  </div>
                </div>
                <div className="entry-date">
                  {entry.date && entry.date.seconds 
                    ? format(new Date(entry.date.seconds * 1000), 'PPP')
                    : entry.date 
                      ? format(new Date(entry.date), 'PPP')
                      : 'Unknown date'}
                </div>
                <div className="entry-preview">
                  {entry.content.replace(/<[^>]*>/g, '').substring(0, 100)}
                  {entry.content.length > 100 && '...'}
                </div>
                <div className="entry-tags">
                  {entry.tags && entry.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}