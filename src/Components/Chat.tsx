import styled from "@emotion/styled";
import React, { useEffect, useRef } from "react";
import { useGetCurrentUser, useGetMessages } from "../Query/QueryHooks";
import { Conversation } from "../Query/types";
import { MessageComponent } from "./Message";
import { ChatInputContainerComponent } from "./ChatInputContainer";

interface ChatComponentProps {
  conversation: Conversation;
}

export const ChatComponent: React.FC<ChatComponentProps> = ({
  conversation,
}) => {
  const conversationId = conversation.id;
  const {
    data: messages = [],
    isPending,
    error,
  } = useGetMessages(conversationId);

  const { data: currentUserData } = useGetCurrentUser();
  const currentUserId = currentUserData?.id;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (error) return <div>Error loading messages.</div>;
  if (isPending) return <div>Loading messages...</div>;

  return (
    <ChatComponentWrapper>
      <div className="chat-header">Chat</div>

      <div className="messages-container">
        {(() => {
          return [...messages].reverse().map((msg) => {
            const isCurrentUser = msg.senderId === currentUserId;

            return (
              <div
                key={msg.id}
                className={
                  isCurrentUser ? "messageWrapperCurrentUser" : "messageWrapper"
                }
                style={{ position: "relative" }}
              >
                <MessageComponent message={msg} conversation={conversation} />
              </div>
            );
          });
        })()}
        <div ref={messagesEndRef} />
      </div>

      <ChatInputContainerComponent conversation={conversation} />
    </ChatComponentWrapper>
  );
};

const ChatComponentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
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
    justify-content: flex-start;
  }

  .messageWrapperCurrentUser {
    align-self: flex-end;
    max-width: 85%;
  }

  .messageWrapper {
    max-width: 85%;
  }
`;
