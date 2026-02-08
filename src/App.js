import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const menuData = [
    {
      category: 'Starters',
      items: [
        { name: 'Caesar Salad', calories: 150 },
        { name: 'Garlic Bread', calories: 200 },
        { name: 'Soup of the Day', calories: 120 }
      ]
    },
    {
      category: 'Main Course',
      items: [
        { name: 'Grilled Salmon', calories: 550 },
        { name: 'Pasta Carbonara', calories: 650 },
        { name: 'Ribeye Steak', calories: 700 },
        { name: 'Vegetarian Lasagna', calories: 480 }
      ]
    },
    {
      category: 'Desserts',
      items: [
        { name: 'Chocolate Cake', calories: 320 },
        { name: 'Cheesecake', calories: 380 },
        { name: 'Tiramisu', calories: 350 },
        { name: 'Sorbet', calories: 150 }
      ]
    }
  ];

  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I help you with our restaurant today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send POST request to backend
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add bot message to chat
      const botMessage = { sender: 'bot', text: data.answer };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { sender: 'bot', text: 'Sorry, I could not process your request. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Menu Panel */}
      <div className="menu-panel">
        <div className="menu-header">
          <h2>Menu Insights</h2>
        </div>
        <div className="calorie-recommendation">
          <p className="calorie-info">Recommended calorie intake per meal: <span className="kcal-bold">500–700 kcal</span></p>
        </div>
        <div className="menu-content">
          {menuData.map((section, idx) => (
            <div key={idx} className="menu-section">
              <h3 className="menu-category">{section.category}</h3>
              <ul className="menu-items">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="menu-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-calories">~{item.calories} kcal</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Panel */}
      <div className="chat-panel">
        <div className="chat-header">
          <h1>🍽️ Restaurant FAQ Bot</h1>
          <p className="subtitle">Your 24/7 Dining Assistant</p>
        </div>
        
        <div className="messages-box">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="message-content">{msg.text}</div>
            </div>
          ))}
          {loading && <div className="message bot loading"><div className="message-content">Typing...</div></div>}
          <div ref={messagesEndRef} />
        </div>

        <form className="input-box" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
