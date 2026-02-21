import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { sendChatMessage } from '../functions/chat.js';
import { Send, User, Bot, Plus } from 'lucide-react';
import './FullPageChat.css';

const FullPageChat = () => {
    // Get chat state from outlet context if available, otherwise use local state (fallback)
    const context = useOutletContext();
    const { 
        chatMessages: messages = [], 
        setChatMessages: setMessages = () => {}, 
        chatInput: input = '', 
        setChatInput: setInput = () => {} 
    } = context || {};

    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Initial greeting if empty (only if using context and it's empty)
    useEffect(() => {
        if (messages.length === 0 && setMessages) {
             setMessages([
                { role: 'ai', content: 'Hi! I am your AI assistant. I can help you create clubs, schedule events, or answer questions about the platform. How can I help you today?' }
            ]);
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [input]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        
        // Reset height immediately after state update
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = '24px'; // Reset to min height
            }
        }, 0);

        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMessages(prev => [...prev, { role: 'ai', content: 'You need to be logged in to use the chat.' }]);
                setIsLoading(false);
                return;
            }

            const response = await sendChatMessage(token, userMessage.content);
            
            // Format AI response
            let aiContent = response.response;
            
            setMessages(prev => [...prev, { role: 'ai', content: aiContent }]);

        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="full-page-chat">
            <div className="chat-container">
                <div className="messages-area">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-wrapper ${msg.role}`}>
                            <div className="message-content-container">
                                <div className="avatar">
                                    {msg.role === 'ai' ? <Bot size={24} color="white" /> : <User size={24} color="white" />}
                                </div>
                                <div className="message-text">
                                    {typeof msg.content === 'string' 
                                        ? msg.content 
                                        : (msg.content?.text || JSON.stringify(msg.content))}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message-wrapper ai">
                            <div className="message-content-container">
                                <div className="avatar"><Bot size={24} color="white" /></div>
                                <div className="message-text">
                                    <div className="typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="input-area-wrapper">
                    <div className="input-container">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Message Club Hub AI..."
                            rows={1}
                            style={{ 
                                height: 'auto', 
                                minHeight: '24px', 
                                maxHeight: '200px',
                                overflowY: input.length > 0 ? 'auto' : 'hidden' 
                            }}
                        />
                        <button 
                            onClick={handleSend} 
                            disabled={isLoading || !input.trim()}
                            className="send-button"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    <div className="disclaimer">
                        AI can make mistakes. Consider checking important information.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FullPageChat;
