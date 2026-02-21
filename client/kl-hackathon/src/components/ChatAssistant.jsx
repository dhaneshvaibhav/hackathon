import React, { useState, useRef, useEffect } from 'react';
import './ChatAssistant.css';
import { sendChatMessage } from '../functions/chat.js';

const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Hi! I can help you create clubs, events, or answer questions.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
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
            if (response.action && response.action !== 'chat' && response.action !== 'error') {
                 // If action was executed, maybe append details
                 // aiContent += `\n(Action Executed: ${response.action})`;
            }

            setMessages(prev => [...prev, { role: 'ai', content: aiContent }]);

        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="chat-widget-container">
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h3>AI Assistant</h3>
                        <button className="close-button" onClick={() => setIsOpen(false)}>×</button>
                    </div>
                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.role}`}>
                                {msg.content}
                            </div>
                        ))}
                        {isLoading && <div className="message ai">Thinking...</div>}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-input-area">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading}>Send</button>
                    </div>
                </div>
            )}
            <button className="chat-toggle-button" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '💬' : '✨'}
            </button>
        </div>
    );
};

export default ChatAssistant;
