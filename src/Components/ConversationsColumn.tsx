import React, { useState } from "react";
import styled from "@emotion/styled";
import { ConversationComponent } from "./Conversation";
import { CreateGroupConversation } from "./CreateGroupConversation";
import { Conversation } from "../Query/types";
import { DoorOpenIcon } from "./Icons/DoorOpenIcon";
import { DoorClosedIcon } from "./Icons/DoorClosedIcon";
import { ArrowLeftIcon } from "./Icons/ArrowLeftIcon";
import { ArrowRightIcon } from "lucide-react";
import { ButtonSecondary } from "./ShadcnComponents/ButtonSecondary";

interface ConversationsColumnComponentProps {
  selectedConversationId: string;
  setSelectedConversationId: (id: string) => void;
  conversations: Conversation[];
  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
}

export const ConversationsColumnComponent = ({
  selectedConversationId,
  setSelectedConversationId,
  conversations,
  isChatOpen,
  setIsChatOpen,
}: ConversationsColumnComponentProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleConversationClick = (id: string) => {
    setSelectedConversationId(id);
  };

  return (
    <ConversationsColumnComponentWrapper isSidebarOpen={isSidebarOpen}>
      <ToggleSidebarButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? (
          <>
            <ArrowLeftIcon />
            <DoorOpenIcon />
          </>
        ) : (
          <>
            <DoorClosedIcon />
            <ArrowRightIcon />
          </>
        )}
      </ToggleSidebarButton>

      {isSidebarOpen && <div className="header">Conversations</div>}

      <div className="conversations-list">
        {isSidebarOpen ? (
          <>
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
            <ButtonSecondary
              className="chat-friends-switch"
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              {isChatOpen ? "FRIENDS" : "CHAT"}
            </ButtonSecondary>
          </>
        ) : (
          <>
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className="conversation-avatar-list"
              >
                <img
                  src={conversation.id || "/default-avatar.png"}
                  // alt={conversation.name}
                  className="avatar-img"
                />
              </div>
            ))}
          </>
        )}
      </div>
    </ConversationsColumnComponentWrapper>
  );
};

const ConversationsColumnComponentWrapper = styled.div<{
  isSidebarOpen: boolean;
}>`
  display: flex;
  flex-direction: column;
  width: ${({ isSidebarOpen }) => (isSidebarOpen ? "300px" : "60px")};
  transition: width 0.3s ease-in-out;
  border-right: 1px solid #303030;

  .header {
    padding: 16px;
    font-size: 20px;
    font-weight: bold;
    background: #000000;
    color: white;
    text-align: center;
    overflow: hidden;
  }

  .conversations-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
  }

  .conversation-avatar-list {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-bottom: 10px;

    .avatar-img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-bottom: 20px;
    }
  }

  .chat-friends-switch {
    margin-top: 10px;
    width: 100%;
    text-align: center;
  }
`;

const ToggleSidebarButton = styled.button`
  background-color: #303030;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 10px;
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: flex-end;

  &:hover {
    background-color: #555;
  }
`;
