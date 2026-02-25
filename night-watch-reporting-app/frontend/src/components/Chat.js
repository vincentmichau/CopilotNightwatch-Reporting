import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const Chat = ({ socket: providedSocket }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const socketRef = useRef(providedSocket || null);

    useEffect(() => {
        // Si un socket est fourni via props, on l'utilise; sinon on en crée un
        if (!socketRef.current) {
            socketRef.current = io('http://localhost:5000');
        }

        const sock = socketRef.current;
        if (sock && sock.on) {
            sock.on('message', (message) => {
                setMessages((prevMessages) => [...prevMessages, message]);
            });
        }

        return () => {
            if (sock && sock.off) {
                sock.off('message');
            }
            // If we created the socket (no providedSocket), close it if supported
            if (!providedSocket && sock && sock.close) {
                try { sock.close(); } catch (e) {}
            }
        };
    }, [providedSocket]);

    const sendMessage = (e) => {
        e.preventDefault();
        const sock = socketRef.current;
        if (input && sock && sock.emit) {
            sock.emit('message', input);
            setInput('');
        }
    };

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className="message">
                        {msg}
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Écrivez votre message..."
                />
                <button type="submit">Envoyer</button>
            </form>
        </div>
    );
};

export default Chat;