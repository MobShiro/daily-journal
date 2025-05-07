import React, { useState, useEffect } from 'react';
import { useJournal } from '../../contexts/JournalContext';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function EntryList() {
  const { entries } = useJournal();
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMood, setFilterMood] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Extract all unique tags from entries
  const allTags = [...new Set(entries.flatMap(entry => entry.tags || []))];

  useEffect(() => {
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
      const dateA = new Date(a.date.seconds * 1000);
      const dateB = new Date(b.date.seconds * 1000);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredEntries(result);
  }, [entries, searchTerm, filterMood, filterTag, sortOrder]);

  return (
    <div className="entry-list-container">
      <h2>Journal Entries</h2>
      
      <div className="entry-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
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
          
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
        
        <Link to="/new-entry" className="btn btn-primary">
          New Entry
        </Link>
      </div>
      
      <div className="entry-list">
        {filteredEntries.length === 0 ? (
          <div className="no-entries">No entries found.</div>
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
                {format(new Date(entry.date.seconds * 1000), 'PPP')}
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
    </div>
  );
}