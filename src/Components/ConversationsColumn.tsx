import styled from "@emotion/styled";
import React, { useState } from "react";
import { useGetRecentConversations } from "../Query/QueryHooks";
import { ErrorComponent } from "./Error";
import { Loading } from "./Loading";
import { ConversationComponent } from "./Conversation";
import { ChatComponent } from "./Chat";
import { ChatPage } from "../Pages/Chat";
import { Conversation } from "../Query/types";
import { CreateGroupConversation } from "./CreateGroupConversation";

interface ConversationsColumnComponentProps {
  selectedConversationId: string;
  setSelectedConversationId: (id: string) => void;
  conversations: Conversation[];
}

export const ConversationsColumnComponent = ({
  selectedConversationId,
  setSelectedConversationId,
  conversations,
}: ConversationsColumnComponentProps) => {
  const handleConversationClick = (id: string) => {
    setSelectedConversationId(id);
  };

  return (
    <ConversationsColumnComponentWrapper>
      <div className="header">Conversations</div>
      <div className="conversations-list">
        {conversations.map((conversation) => (
          <ConversationComponent
            key={conversation.id}
            conversation={conversation}
            onClick={() => {
              handleConversationClick(conversation.id);
            }}
            selected={selectedConversationId === conversation.id}
          />
        ))}
        <CreateGroupConversation />
      </div>
    </ConversationsColumnComponentWrapper>
  );
};

const ConversationsColumnComponentWrapper = styled.div`
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
`;
