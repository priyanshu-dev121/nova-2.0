import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Mic, MicOff, X, Volume2, VolumeX, Bot } from 'lucide-react';
import API from '../api/axiosConfig';
import './NovaChat.css';

const NovaChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm Nova, your Campus Assistant. How can I help you navigate Campus Nova today? 🛡️✨", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
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

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const speak = (text) => {
    if (!isSpeakingEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textOverride) => {
    const text = textOverride || inputValue;
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await API.post('/chatbot/query', { message: text });
      const botReply = response.data.reply;
      
      const botMsg = { id: Date.now() + 1, text: botReply, sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);
      speak(botReply);
    } catch (error) {
      const errorMessage = { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting to my neural network. Please try again later. 🛡️⚙️", sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.div 
        className="nova-chat-handle"
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        {!isOpen && (
            <motion.div 
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
            />
        )}
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="nova-chat-container"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
          >
            {/* Header */}
            <div className="nova-chat-header">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Bot size={24} />
                </div>
                <div>
                  <h3>Nova AI</h3>
                  <p className="text-xs text-indigo-100 font-bold">Online & Ready</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)}
                >
                  {isSpeakingEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
                <button 
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="nova-chat-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`msg-wrapper ${msg.sender}`}>
                  <div className={`msg ${msg.sender}`}>
                    {msg.text}
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

            {/* Input Area */}
            <div className="nova-chat-input-area">
              <div className="nova-input-box">
                <input 
                  type="text" 
                  className="nova-input"
                  placeholder="Ask me anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
              </div>
              
              <button 
                className={`nova-action-btn ${isListening ? 'voice-active' : ''}`}
                onClick={toggleListening}
              >
                {isListening ? <MicOff size={22} /> : <Mic size={22} />}
              </button>

              <button 
                className="nova-action-btn send-btn"
                onClick={() => handleSendMessage()}
              >
                <Send size={22} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NovaChat;
