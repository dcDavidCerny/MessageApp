import styled from "@emotion/styled";
import { Conversation } from "../Query/types";
import ContextMenu from "./ContextMemu";
import { useState } from "react";
import { EditGroupConversation } from "./EditGroupConversation";

const GROUP_IMG_SRC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="25"
      fill="currentColor"
      className="bi bi-people-fill"
      viewBox="0 0 16 16"
    >
      <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
    </svg>
  );
};
export const DEFAULT_AVATAR_SRC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="25"
      fill="black"
      className="bi bi-person-fill"
      viewBox="0 0 16 16"
    >
      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
    </svg>
  );
};

interface ConversationProps {
  conversation: Conversation;
  onClick: () => void;
  selected: boolean;
}
export const ConversationComponent = ({
  conversation,
  onClick,
  selected,
}: ConversationProps) => {
  const conversationName = conversation.isGroup
    ? conversation.name
    : conversation.otherParticipants[0].displayName;
  const conversationImg = conversation.isGroup
    ? GROUP_IMG_SRC
    : conversation.otherParticipants[0].avatarUrl || DEFAULT_AVATAR_SRC;

  const lastMessageDate = conversation.lastMessageAt
    ? new Date(conversation.lastMessageAt)
    : new Date();

  const now = new Date();
  const currentYear = now.getFullYear();

  const isToday =
    lastMessageDate.getDate() === now.getDate() &&
    lastMessageDate.getMonth() === now.getMonth() &&
    lastMessageDate.getFullYear() === now.getFullYear();

  const userLocale = navigator.language || undefined;
  const timeString = lastMessageDate.toLocaleTimeString(userLocale, {
    hour12: false,
  });

  let formattedLastMessage;
  if (isToday) {
    formattedLastMessage = timeString;
  } else {
    formattedLastMessage =
      lastMessageDate.getFullYear() === currentYear
        ? lastMessageDate.toLocaleDateString(userLocale) + " - " + timeString
        : lastMessageDate.toLocaleDateString(userLocale, { year: "numeric" }) +
          " - " +
          timeString;
  }
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <ConversationComponentWrapper>
      {conversation.isGroup ? (
        <ContextMenu
          items={[
            {
              text: "Manage group",
              onClick: () => {
                setIsModalOpen(true);
              },
            },
          ]}
        >
          <div
            key={conversation.id}
            className={`conversation-item ${selected ? "selected" : ""}`}
            onClick={onClick}
          >
            <div>
              {typeof conversationImg === "function" ? (
                conversationImg()
              ) : (
                <img src={conversationImg} alt="Avatar" />
              )}
            </div>
            <div className="conversation-info">
              <div className="user-name">{conversationName}</div>
              <div className="last-message">last message</div>
            </div>
            <div className="timestamp">{formattedLastMessage}</div>
          </div>
        </ContextMenu>
      ) : (
        <div
          key={conversation.id}
          className={`conversation-item ${selected ? "selected" : ""}`}
          onClick={onClick}
        >
          <div>
            {typeof conversationImg === "function" ? (
              conversationImg()
            ) : (
              <img src={conversationImg} alt="Avatar" />
            )}
          </div>
          <div className="conversation-info">
            <div className="user-name">{conversationName}</div>
            <div className="last-message">last message</div>
          </div>
          <div className="timestamp">{formattedLastMessage}</div>
        </div>
      )}

      {isModalOpen && (
        <EditGroupConversation
          conversation={conversation}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </ConversationComponentWrapper>
  );
};

const ConversationComponentWrapper = styled.div`
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
