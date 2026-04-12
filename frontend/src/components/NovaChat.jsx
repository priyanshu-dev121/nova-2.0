import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, Mic, MicOff, X, 
  Volume2, VolumeX, Bot, Maximize2, Minimize2, 
  Trash2, Sparkles, SendHorizontal
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import API from '../api/axiosConfig';
import './NovaChat.css';

const SUGGESTIONS = [
  "Find events",
  "Show study materials",
  "Campus map",
  "Help me navigate",
  "Check attendance"
];

const NovaChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hi! I'm **Nova**, your premium Campus Assistant. How can I help you navigate **Campus Nova** today? 🛡️✨", 
      sender: 'bot', 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Speech Recognition Setup
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (window.webkitSpeechRecognition || window.SpeechRecognition) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleSendMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [messages, isLoading, isOpen]);

  const speak = (text) => {
    if (!isSpeakingEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textOverride) => {
    const text = textOverride || inputValue;
    if (!text.trim()) return;

    const userMsg = { 
      id: Date.now(), 
      text, 
      sender: 'user', 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Gemini requires history to start with a 'user' message and alternate roles correctly.
      // We skip the initial greeting (index 0) and any other messages that would break this sequence.
      const history = messages
        .filter((_, idx) => idx > 0) // Skip the initial "Hi! I'm Nova" bot message
        .map(m => ({ 
          role: m.sender === 'bot' ? 'model' : 'user', 
          parts: [{ text: m.text }] 
        }));

      const response = await API.post('/chatbot/query', { 
        message: text,
        history: history.slice(-6) // Send last 6 messages for context
      });
      const botReply = response.data.reply;
      
      const botMsg = { 
        id: Date.now() + 1, 
        text: botReply, 
        sender: 'bot', 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      
      setMessages(prev => [...prev, botMsg]);
      speak(botReply.replace(/[#*`]/g, '')); // Strip markdown for speech
    } catch (error) {
      const errorMessage = { 
        id: Date.now() + 1, 
        text: "Sorry, I'm having trouble connecting to my neural network. Please try again later. 🛡️⚙️", 
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Clear all messages?")) {
      setMessages([{ 
        id: Date.now(), 
        text: "Conversation cleared. How else can I assist you?", 
        sender: 'bot', 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <>
      <motion.div 
        className="nova-chat-handle"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={28} /> : <Sparkles size={28} />}
        {!isOpen && (
            <motion.div 
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
            />
        )}
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={`nova-chat-container ${isFullScreen ? 'full-screen' : ''}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <div className="nova-chat-header">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-indigo-50 color-indigo-600 rounded-xl ${isSpeaking ? 'speaking-pulse' : ''}`}>
                  <Bot size={24} color="#6366f1" />
                </div>
                <div>
                  <h3>Nova Assistant</h3>
                  <div className="header-status">
                    <span className="status-dot"></span>
                    Smart AI Online
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="nova-action-btn" onClick={clearChat} title="Clear Chat">
                  <Trash2 size={18} />
                </button>
                <button className="nova-action-btn" onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)} title="Toggle Voice">
                  {isSpeakingEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
                <button className="nova-action-btn" onClick={() => setIsFullScreen(!isFullScreen)} title="Fullscreen">
                  {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button className="nova-action-btn" onClick={() => setIsOpen(false)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="nova-chat-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`msg-wrapper ${msg.sender}`}>
                  <div className={`msg ${msg.sender}`}>
                    <div className="msg-content">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                    <div className="msg-timestamp">{msg.timestamp}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="msg-wrapper bot">
                  <div className="msg bot bot-typing">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="suggestion-area">
              {SUGGESTIONS.map(s => (
                <button key={s} className="suggestion-chip" onClick={() => handleSendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>

            <div className="nova-chat-input-area">
              <div className="nova-input-box">
                <input 
                  type="text" 
                  className="nova-input"
                  placeholder="Ask Nova anything..."
                  value={inputValue}
                  ref={inputRef}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
              </div>
              
              <button 
                className={`nova-action-btn ${isListening ? 'voice-active' : ''}`}
                onClick={toggleListening}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <button 
                className="nova-action-btn send-btn"
                onClick={() => handleSendMessage()}
              >
                <SendHorizontal size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NovaChat;
