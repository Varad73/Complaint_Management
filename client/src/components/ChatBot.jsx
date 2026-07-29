import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const FAQS = [
  {
    keywords: ['submit', 'new complaint', 'file complaint', 'register complaint'],
    answer: 'To submit a complaint, click the "New Complaint" button in the navigation menu. Fill in the title, select a department, describe your issue, and optionally attach an image. Then click "Submit Complaint".'
  },
  {
    keywords: ['status', 'track', 'my complaint', 'where is my', 'progress', 'update'],
    answer: 'Go to "My Complaints" in the navigation menu to see all your submitted complaints and their current status (Submitted, In Review, Work in Progress, Resolved, or Closed).'
  },
  {
    keywords: ['department', 'which department', 'where to submit', 'sewage', 'road', 'electricity', 'water'],
    answer: 'The system has departments like Sewage Management, Road Maintenance, and Electricity. You can also use the AI "Suggest Department" feature when submitting a complaint — it will automatically recommend the right department based on your description.'
  },
  {
    keywords: ['delete', 'remove', 'cancel complaint'],
    answer: 'You can delete your own complaints from the "My Complaints" page. Click the "Delete" button on any complaint you want to remove.'
  },
  {
    keywords: ['login', 'sign in', 'log in', 'account'],
    answer: 'Click the "Login" button in the top-right corner. If you don\'t have an account yet, click "Sign Up" to create one.'
  },
  {
    keywords: ['signup', 'sign up', 'register', 'create account'],
    answer: 'Click the "Sign Up" button in the top-right corner. Enter your name, email, and password to create a free account.'
  },
  {
    keywords: ['admin', 'dashboard', 'analytics'],
    answer: 'Admins have access to the Admin Dashboard (manage all complaints) and Analytics Dashboard (view charts and metrics). These appear in the navigation menu for admin users.'
  },
  {
    keywords: ['image', 'photo', 'picture', 'attachment', 'upload', 'file'],
    answer: 'When submitting a complaint, you can attach an image by clicking the upload area or dragging and dropping a file. Allowed formats: PNG, JPG, GIF, WebP. Maximum size: 5MB.'
  },
  {
    keywords: ['priority', 'urgent', 'high priority', 'emergency'],
    answer: 'The system automatically analyzes your complaint text to assign a priority level (High, Medium, or Low). Using urgent words like "emergency" or "critical" will flag it as High priority.'
  },
  {
    keywords: ['contact', 'support', 'help', 'human', 'agent'],
    answer: 'For further assistance, please contact the support team at support@smartgrievance.com or reach out to the relevant department directly through your complaint\'s status updates.'
  },
  {
    keywords: ['time', 'how long', 'resolution time', 'when'],
    answer: 'Resolution time varies by department and complaint complexity. You can track your complaint\'s progress in real-time from the "My Complaints" page.'
  },
  {
    keywords: ['history', 'timeline', 'previous', 'changes'],
    answer: 'Each complaint has a timeline/history that shows all status changes. Click "View History" on any complaint in "My Complaints" to see the full timeline.'
  },
  {
    keywords: ['dark mode', 'theme', 'light mode', 'appearance'],
    answer: 'Click the sun/moon icon in the top navigation bar to toggle between light and dark mode. Your preference is saved automatically.'
  },
];

function getResponse(input) {
  const text = input.toLowerCase().trim();
  if (!text) return null;

  const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
  if (greetings.some(g => text.includes(g))) {
    return 'Hello! How can I help you today? You can ask me about submitting complaints, tracking status, departments, or anything else about the system.';
  }

  const thanks = ['thanks', 'thank you', 'ty', 'thx'];
  if (thanks.some(t => text.includes(t))) {
    return 'You\'re welcome! Feel free to ask if you have any other questions.';
  }

  for (const faq of FAQS) {
    if (faq.keywords.some(kw => text.includes(kw))) {
      return faq.answer;
    }
  }

  return 'I\'m not sure about that. Try asking about: submitting a complaint, tracking status, departments, login, or contact support.';
}

const quickReplies = [
  'How to submit a complaint?',
  'What is the status of my complaint?',
  'Which department should I choose?',
  'How do I contact support?',
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m the SmartGrievance assistant. Ask me anything about the system.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages, scrollToBottom]);

  const handleSend = useCallback(async (text) => {
    const msg = text || input;
    if (!msg.trim() || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setIsLoading(true);

    // Simulate a short delay so it feels natural
    await new Promise(r => setTimeout(r, 400 + Math.random() * 300));

    const response = getResponse(msg);

    // If user is not logged in and asks about a page, offer navigation
    const navLinks = [
      { keywords: ['submit', 'new complaint'], path: '/new', label: 'New Complaint' },
      { keywords: ['my complaint', 'track', 'status'], path: '/my', label: 'My Complaints' },
      { keywords: ['admin', 'dashboard'], path: '/admin', label: 'Admin Dashboard' },
      { keywords: ['analytics'], path: '/analytics', label: 'Analytics' },
    ];

    let actions = [];
    if (user) {
      for (const link of navLinks) {
        if (link.keywords.some(kw => msg.toLowerCase().includes(kw))) {
          actions.push(link);
        }
      }
    }

    setMessages(prev => [...prev, { role: 'bot', text: response, actions: actions.length ? actions : undefined }]);
    setIsLoading(false);
  }, [input, isLoading, user]);

  const handleQuickReply = (text) => {
    handleSend(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat bubble button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-white hover:scale-110"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 flex flex-col" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm">SmartGrievance Assistant</p>
                <p className="text-xs text-blue-200">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-md px-4 py-2.5'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm border border-gray-100 dark:border-gray-700'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  {msg.actions && (
                    <div className="mt-2 space-y-1.5">
                      {msg.actions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => {
                            navigate(action.path);
                            setIsOpen(false);
                          }}
                          className="block w-full text-left text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-lg px-3 py-1.5 transition-colors"
                        >
                          Go to {action.label} →
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-1.5">
                {quickReplies.map((qr, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickReply(qr)}
                    className="text-xs px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
