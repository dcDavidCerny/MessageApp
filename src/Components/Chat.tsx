import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

interface Message {
  id: number;
  sender: string;
  text: string;
  timestamp: string;
}

export const ChatComponent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = "You"; // Dummy user for now

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // Triggered when messages state changes

  const sendMessage = () => {
    if (!input.trim()) return; // Don't send empty messages

    const newMessage: Message = {
      id: Date.now(),
      sender: currentUser,
      text: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput(""); // Clear input field
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <ChatComponentWrapper>
      <div className="chat-header">Messenger Clone</div>
      <div className="messages-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-bubble ${
              msg.sender === currentUser ? "current-user" : ""
            }`}
          >
            <div className="sender-name">{msg.sender}</div>
            <div className="message-text">{msg.text}</div>
            <div className="timestamp">{msg.timestamp}</div>
          </div>
        ))}

        <div ref={messagesEndRef} />
        <div className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            placeholder="Type a message..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button className="send-button" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </ChatComponentWrapper>
  );
};
const ChatComponentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  margin: auto;
  background: #f0f0f0;

  .chat-header {
    padding: 16px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    background: #0078ff;
    color: white;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .message-bubble {
    max-width: 70%;
    align-self: flex-start;
    background: #e5e5ea;
    color: black;
    padding: 10px;
    border-radius: 12px;
    margin: 5px 0;
  }

  .message-bubble.current-user {
    align-self: flex-end;
    background: #0078ff;
    color: white;
  }

  .sender-name {
    font-size: 12px;
    font-weight: bold;
  }

  .message-text {
    font-size: 16px;
  }

  .timestamp {
    font-size: 10px;
    text-align: right;
    margin-top: 4px;
    opacity: 0.6;
  }

  .chat-input-container {
    display: flex;
    padding: 10px;
    background: white;
    border-top: 1px solid #ccc;
  }

  .chat-input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 20px;
    font-size: 16px;
    outline: none;
  }

  .send-button {
    margin-left: 8px;
    padding: 10px 15px;
    background: #0078ff;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;

    &:hover {
      background: #005fcc;
    }
  }
`;
