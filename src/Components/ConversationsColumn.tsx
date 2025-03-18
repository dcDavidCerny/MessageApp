import styled from "@emotion/styled";
import React, { useState } from "react";
import { useGetRecentConversations } from "../Query/QueryHooks";
import { ErrorComponent } from "./Error";
import { Loading } from "./Loading";

const { data: conversations, isPending, error } = useGetRecentConversations();

export const ConversationsColumnComponent: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  const handleConversationClick = (id: string) => {
    setSelectedConversationId(id);
  };

  if (error) {
    return <ErrorComponent error={error} />;
  }

  if (isPending) {
    return <Loading animation="pulse" />;
  }

  return (
    <ConversationsColumnComponentWrapper>
      <div className="header">Conversations</div>
      <div className="conversations-list">
        {conversations.map((conversation) => (
          <Conversation
            key={conversation.id}
            conversation={conversation}
            onClick={() => {
              handleConversationClick(conversation.id);
            }}
            selected={selectedConversationId === conversation.id}
          />
          // <div
          //   key={conversation.id}
          //   className={`conversation-item ${
          //     conversation.id === selectedConversationId ? "selected" : ""
          //   }`}
          //   onClick={() => handleConversationClick(conversation.id)}
          // >
          //   <img
          //     src={conversation.profilePic}
          //     alt={conversation.}
          //     className="profile-pic"
          //   />
          //   <div className="conversation-info">
          //     <div className="user-name">{conversation.participantIds}</div>
          //     <div className="last-message">{conversation.lastMessage}</div>
          //   </div>
          //   <div className="timestamp">{conversation.timestamp}</div>
          //   {conversation.unreadCount > 0 && (
          //     <div className="unread-count">{conversation.unreadCount}</div>
          //   )}
          // </div>
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
