import styled from "@emotion/styled";
import React, { useState } from "react";

interface Conversation {
  id: number;
  userName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  profilePic: string;
}

const conversations: Conversation[] = [
  {
    id: 1,
    userName: "John Doe",
    lastMessage: "Hey! How's it going?",
    timestamp: "2:30 PM",
    unreadCount: 2,
    profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: 2,
    userName: "Jane Smith",
    lastMessage: "Let's catch up soon!",
    timestamp: "12:45 PM",
    unreadCount: 0,
    profilePic: "https://randomuser.me/api/portraits/women/2.jpg",
  },
];

export const ConversationsColumnComponent: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);

  const handleConversationClick = (id: number) => {
    setSelectedConversation(id);
  };

  return (
    <ConversationsColumnComponentWrapper>
      <div className="header">Conversations</div>
      <div className="conversations-list">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`conversation-item ${
              conversation.id === selectedConversation ? "selected" : ""
            }`}
            onClick={() => handleConversationClick(conversation.id)}
          >
            <img
              src={conversation.profilePic}
              alt={conversation.userName}
              className="profile-pic"
            />
            <div className="conversation-info">
              <div className="user-name">{conversation.userName}</div>
              <div className="last-message">{conversation.lastMessage}</div>
            </div>
            <div className="timestamp">{conversation.timestamp}</div>
            {conversation.unreadCount > 0 && (
              <div className="unread-count">{conversation.unreadCount}</div>
            )}
          </div>
        ))}
      </div>
    </ConversationsColumnComponentWrapper>
  );
};

const ConversationsColumnComponentWrapper = styled.div`
  width: 300px;
  background-color: #f5f5f5;
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;

  .header {
    padding: 16px;
    font-size: 20px;
    font-weight: bold;
    background: #0078ff;
    color: white;
    text-align: center;
  }

  .conversations-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
  }

  .conversation-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: white;
    border-radius: 8px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: #e5e5ea;
    }

    &.selected {
      background: #d3e5ff;
    }

    .profile-pic {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 12px;
    }

    .conversation-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: bold;
      font-size: 14px;
    }

    .last-message {
      font-size: 12px;
      color: #777;
      margin-top: 4px;
    }

    .timestamp {
      font-size: 10px;
      color: #aaa;
      text-align: right;
      margin-left: 10px;
    }

    .unread-count {
      background-color: #0078ff;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 12px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-left: auto;
    }
  }
`;
