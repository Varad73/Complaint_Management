export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://complaint-management-1j73.onrender.com';

export const STATUS_OPTIONS = ['Submitted', 'In Review', 'Work in Progress', 'Resolved', 'Closed'];

export const STATUS_COLORS = {
  'Submitted': { bg: 'bg-blue-500', text: 'text-blue-500', badge: 'bg-blue-100 text-blue-800', chart: '#3B82F6' },
  'In Review': { bg: 'bg-yellow-500', text: 'text-yellow-500', badge: 'bg-yellow-100 text-yellow-800', chart: '#F59E0B' },
  'Work in Progress': { bg: 'bg-orange-500', text: 'text-orange-500', badge: 'bg-orange-100 text-orange-800', chart: '#F97316' },
  'Resolved': { bg: 'bg-green-500', text: 'text-green-500', badge: 'bg-green-100 text-green-800', chart: '#10B981' },
  'Closed': { bg: 'bg-gray-500', text: 'text-gray-500', badge: 'bg-gray-100 text-gray-800', chart: '#6B7280' },
};

export const PRIORITY_BADGES = {
  high: { bg: 'bg-red-100', text: 'text-red-800', label: 'High Priority', dot: 'bg-red-500' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Medium Priority', dot: 'bg-yellow-500' },
  low: { bg: 'bg-green-100', text: 'text-green-800', label: 'Low Priority', dot: 'bg-green-500' },
};

export const SENTIMENT_BADGES = {
  Negative: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Negative' },
  Neutral: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Neutral' },
  Positive: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Positive' },
};

export const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function getPriorityBadge(priority) {
  return PRIORITY_BADGES[priority] || PRIORITY_BADGES.low;
}

export function getSentimentBadge(sentiment) {
  return SENTIMENT_BADGES[sentiment] || SENTIMENT_BADGES.Neutral;
}

export function getStatusConfig(status) {
  return STATUS_COLORS[status] || STATUS_COLORS['Closed'];
}

export function getFullImageUrl(imagePath) {
  if (!imagePath) return null;
  const cleanPath = imagePath.replace(/^\/?(uploads\/)?/, '');
  return `${API_BASE_URL}/uploads/${cleanPath}`;
}
