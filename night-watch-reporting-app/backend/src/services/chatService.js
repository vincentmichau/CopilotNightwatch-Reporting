const chatService = require('../models/chat'); // Assuming you have a chat model defined

class ChatService {
    constructor() {
        this.messages = [];
    }

    sendMessage(userId, message) {
        const newMessage = {
            userId,
            message,
            timestamp: new Date()
        };
        this.messages.push(newMessage);
        // Here you would typically save the message to the database
        return newMessage;
    }

    getMessages() {
        // Here you would typically fetch messages from the database
        return this.messages;
    }

    clearChat() {
        this.messages = [];
        // Here you would typically clear messages from the database
    }
}

module.exports = new ChatService();