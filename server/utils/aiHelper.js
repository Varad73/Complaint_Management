// server/utils/aiHelper.js

// Priority & Sentiment Analysis
const priorityKeywords = {
  high: [
    'urgent', 'emergency', 'critical', 'broken', 'not working', 'frustrated', 'angry',
    'unacceptable', 'immediately', 'asap', 'crisis', 'danger', 'severe', 'blocked',
    'overflow', 'accident', 'shock', 'fire'
  ],
  medium: ['delay', 'issue', 'problem', 'concern', 'waiting', 'poor', 'bad', 'slow', 'complaint'],
  low: ['suggestion', 'feedback', 'question', 'minor', 'clarify', 'help', 'how to']
};

function analyzeComplaint(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  
  let priority = 'low';
  for (let word of priorityKeywords.high) {
    if (text.includes(word)) { priority = 'high'; break; }
  }
  if (priority !== 'high') {
    for (let word of priorityKeywords.medium) {
      if (text.includes(word)) { priority = 'medium'; break; }
    }
  }
  
  const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'worst', 'hate', 'disappointed', 'frustrated', 'angry', 'upset'];
  const positiveWords = ['good', 'great', 'excellent', 'happy', 'satisfied', 'thanks', 'appreciate'];
  
  let negativeCount = negativeWords.filter(w => text.includes(w)).length;
  let positiveCount = positiveWords.filter(w => text.includes(w)).length;
  
  let sentiment = 'Neutral';
  if (negativeCount > positiveCount) sentiment = 'Negative';
  else if (positiveCount > negativeCount) sentiment = 'Positive';
  
  return { priority, sentiment };
}

// ✨ Smart Department Suggestion for Municipal Services
function suggestDepartment(title, description) {
  const text = (title + ' ' + description).toLowerCase();
  
  const deptKeywords = {
    'Sewage Management': [
      'sewage', 'drain', 'drainage', 'sewer', 'blocked', 'clogged', 'overflow', 'wastewater',
      'toilet', 'manhole', 'pipe burst', 'smell', 'stagnant water', 'flooding', 'sump'
    ],
    'Road Maintenance': [
      'road', 'pothole', 'street', 'asphalt', 'pavement', 'crack', 'speed bump',
      'footpath', 'sidewalk', 'bridge', 'culvert', 'traffic signal', 'signboard',
      'streetlight', 'road safety', 'accident', 'speed breaker'
    ],
    'Electricity': [
      'electricity', 'power', 'voltage', 'wire', 'pole', 'transformer', 'fuse', 'trip',
      'outage', 'blackout', 'shock', 'electrical', 'meter', 'bill', 'street light',
      'light not working', 'sparking', 'earthing'
    ]
  };
  
  for (const [dept, keywords] of Object.entries(deptKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      return dept;  // returns exact department name as stored in DB
    }
  }
  return null; // no strong match
}

module.exports = { analyzeComplaint, suggestDepartment };