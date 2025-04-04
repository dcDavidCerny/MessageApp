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
import { ThreeDostVerticalIcon } from "./Icons/ThreeDostVerticalIcon";
import { formatDate } from "./FormatTimeFunc";
import { formatMessage } from "./FormatMessageFunc";
import { AttachmentRenderer } from "./AttachmentRenderer";

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

          {message.metadata?.attachments && (
            <AttachmentRenderer
              attachments={message.metadata.attachments}
              apiHost={apiHost}
            />
          )}

          <div className="timestamp">{formattedDate}</div>
          <div className="threeDotsIconDiv">
            <ContextMenu items={contextMenuItems} isOnClick>
              <ThreeDostVerticalIcon />
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
    background: var(--secondary-foreground);
    color: var(--secondary);
    padding: 10px;
    border-radius: 12px;
    margin: 5px 0;

    .sender-name {
      font-size: 12px;
      font-weight: bold;
    }

    .message-text {
      font-size: 16px;
      word-break: break-all;

      .href-link {
        color: var(--secondary);
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
      color: var(--secondary);
    }
  }

  .message-bubble-current-user {
    background-color: var(--secondary);

    .sender-name {
      color: var(--secondary-foreground);
    }

    .message-text {
      font-size: 16px;
      word-break: break-all;
      color: var(--secondary-foreground);

      .href-link {
        color: var(--secondary-foreground);
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
      color: var(--secondary-foreground);
    }
  }

  .message-bubble:hover .threeDotsIconDiv svg {
    transition: opacity 0.33s cubic-bezier(1, 0.03, 1, -0.17);
    opacity: 1;
    color: var(--secondary);
  }

  .message-bubble-current-user:hover .threeDotsIconDiv svg {
    transition: opacity 0.33s cubic-bezier(1, 0.03, 1, -0.17);
    opacity: 1;
    color: var(--secondary-foreground);
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
