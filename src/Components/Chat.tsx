import styled from "@emotion/styled";
import React, { useEffect, useRef } from "react";
import { useGetCurrentUser, useGetMessages } from "../Query/QueryHooks";
import { Conversation } from "../Query/types";
import { MessageComponent } from "./Message";
import { ChatInputContainerComponent } from "./ChatInputContainer";
import { ScrollContainer } from "./ShadcnComponents/ScrollAreaScrollbar";

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

  const conversationName = conversation.isGroup
    ? conversation.name
    : conversation.otherParticipants[0]?.displayName || "Unknown Conversation";

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
      <div className="chat-header">{conversationName}</div>

      <ScrollContainer>
        {[...messages].reverse().map((msg) => {
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
        })}
      </ScrollContainer>

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
  background: var(--primary-foreground);

  .chat-header {
    padding: 16px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    background-color: #000000;
    color: white;
  }

  .messageWrapperCurrentUser {
    align-self: flex-end;
    max-width: 85%;
  }

  .messageWrapper {
    max-width: 85%;
  }
`;
