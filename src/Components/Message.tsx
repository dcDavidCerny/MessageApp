import styled from "@emotion/styled";
import { useState } from "react";
import { queryClient } from "../main";
import {
    apiHost,
    useDeleteMessage,
    useGetCurrentUser,
} from "../Query/QueryHooks";
import { Conversation, Message, SendMessageRequest } from "../Query/types";
import ContextMenu, { ContextMenuItem } from "./ContextMemu";
import { ForwardModalComponent } from "./ForwardModal";
import { Loading } from "./Loading";

interface MessageProps {
  message: Message;
  conversation: Conversation;
}

export const MessageComponent = ({ message, conversation }: MessageProps) => {
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardMessage, setForwardMessage] =
    useState<SendMessageRequest | null>(null);

  const { data: currentUser } = useGetCurrentUser();
  const currentUserId = currentUser?.id;

  const { mutate: deleteMessageMutation } = useDeleteMessage();

  const handleDeleteMessage = (messageId: string) => {
    if (!messageId) return;
    console.log("Attempting to delete message with id:", messageId);
    deleteMessageMutation(
      { messageId },
      {
        onError: (error) => console.error("Failed to delete message:", error),
        onSuccess: () => queryClient.invalidateQueries(),
      }
    );
  };

  const handleOpenForwardModal = (messageContent: SendMessageRequest) => {
    setForwardMessage(messageContent);
    setIsForwardModalOpen(true);
  };

  if (!currentUser) {
    return <Loading animation="bounce" />;
  }

  const sender =
    conversation.otherParticipants.find(
      (user) => user.id === message.senderId
    ) || currentUser;

  const senderName = sender.displayName;

  const messageDate = new Date(message.createdAt);
  const formattedDate = formatDate(messageDate);

  const messageFromMe = message.senderId === currentUserId;

  const contextMenuItems: ContextMenuItem[] = [];
  if (messageFromMe) {
    contextMenuItems.push({
      text: "Delete",
      onClick: () => handleDeleteMessage(message.id),
    });
  }
  contextMenuItems.push({
    text: "Forward",
    onClick: () => handleOpenForwardModal(message),
  });

  return (
    <MessageWrapper>
      <ContextMenu items={contextMenuItems}>
        <div
          className={`message-bubble ${
            messageFromMe ? "message-bubble-current-user" : ""
          }`}
          onClick={() => console.log("Clicked message")}
        >
          <div className="sender-name">{senderName}</div>
          <div className="message-text">{formatMessage(message.content)}</div>
          {message.metadata?.attachments &&
            message.metadata.attachments.map(
              (attachment: {
                url: string;
                type: "image" | "video" | "audio" | "other";
              }) => {
                const url = apiHost + attachment.url;
                return (
                  <div key={url}>
                    {attachment.type === "image" && (
                      <img
                        src={url}
                        alt="Attachment"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "200px",
                        }}
                      />
                    )}
                    {attachment.type === "video" && (
                      <video
                        src={url}
                        controls
                        style={{
                          maxWidth: "100%",
                          maxHeight: "200px",
                        }}
                      />
                    )}
                    {attachment.type === "audio" && (
                      <audio src={url} controls style={{ maxWidth: "100%" }} />
                    )}
                    {attachment.type === "other" && (
                      <a href={url} target="_blank" rel="noreferrer">
                        {attachment.url}
                      </a>
                    )}
                  </div>
                );
              }
            )}
          <div className="timestamp">{formattedDate}</div>
          <div className="threeDotsIconDiv">
            <ContextMenu items={contextMenuItems} isOnClick>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-three-dots-vertical"
                viewBox="0 0 16 16"
              >
                <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
              </svg>
            </ContextMenu>
          </div>
        </div>
      </ContextMenu>

      {isForwardModalOpen && (
        <ForwardModalComponent
          onClose={() => setIsForwardModalOpen(false)}
          currentUserId={currentUser.id}
          forwardMessage={forwardMessage}
        />
      )}
    </MessageWrapper>
  );
};

const MessageWrapper = styled.div`
  .message-bubble {
    width: fit-content;
    align-self: flex-start;
    background: #e5e5ea;
    color: black;
    padding: 10px;
    border-radius: 12px;
    margin: 5px 0;
  }

  .message-bubble-current-user {
    background-color: #81d4fe;
  }

  .sender-name {
    font-size: 12px;
    font-weight: bold;
  }

  .message-text {
    font-size: 16px;
    word-break: break-all;

    .href-link {
      color: black;
      font-weight: 500;
      opacity: 0.9;
      text-decoration: underline;
      word-break: break-all;

      &:hover {
        opacity: 1;
      }
    }
  }
  .timestamp {
    font-size: 10px;
    text-align: right;
    margin-top: 4px;
    opacity: 0.6;
  }

  .message-bubble:hover .threeDotsIconDiv svg {
    transition: opacity 0.33s cubic-bezier(1, 0.03, 1, -0.17);
    opacity: 1;
  }

  .threeDotsIconDiv {
    position: absolute;
    right: 6px;
    top: 13px;
    cursor: pointer;
    svg {
      opacity: 0;
    }
  }
`;

const formatMessage = (message: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return message.split(urlRegex).map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="href-link"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const formatDate = (date: Date) => {
  const now = new Date();
  const currentYear = now.getFullYear();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeString = date.toLocaleTimeString(undefined, {
    hour12: false,
  });

  let formattedTimestamp;
  if (isToday) {
    formattedTimestamp = timeString;
  } else {
    formattedTimestamp =
      date.getFullYear() === currentYear
        ? date.toLocaleDateString(undefined) + " - " + timeString
        : date.toLocaleDateString(undefined, { year: "numeric" }) +
          " - " +
          timeString;
  }
  return formattedTimestamp;
};
