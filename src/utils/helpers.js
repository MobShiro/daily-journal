// Generate a 6-digit OTP
export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  // Format date for display
  export function formatDate(date) {
    if (!date) return '';
    
    const d = new Date(date);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return d.toLocaleDateString(undefined, options);
  }
  
  // Count words in text (strips HTML tags)
  export function countWords(text) {
    if (!text) return 0;
    
    const plainText = text.replace(/<[^>]*>/g, ' ');
    return plainText
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean).length;
  }
  
  // Truncate text with ellipsis
  export function truncateText(text, maxLength) {
    if (!text) return '';
    
    const plainText = text.replace(/<[^>]*>/g, ' ');
    if (plainText.length <= maxLength) return plainText;
    
    return plainText.substring(0, maxLength) + '...';
  }
  
  // Get emoji for mood
  export function getMoodEmoji(mood) {
    const moods = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      neutral: '😐',
      excited: '🎉',
      tired: '😴',
      anxious: '😰',
      content: '😌',
      confident: '😎',
      grateful: '🙏'
    };
    
    return moods[mood] || '😐';
  }