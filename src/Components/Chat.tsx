import styled from "@emotion/styled";
import React, { useEffect, useRef, useState } from "react";
import {
  useGetMessages,
  useSendMessage,
  useDeleteMessage,
  useGetCurrentUser,
  useUploadFile,
  apiHost, // new hook for file uploads
} from "../Query/QueryHooks";
import { queryClient } from "../main";
import { Conversation } from "../Query/types";
import ContextMenu from "./ContextMemu";
import ForwardModalComponent from "./ForwardModal";
import { useAudioRecorder } from "use-audio-recorder";

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

  const [input, setInput] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [forwardMessage, setForwardMessage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = "You";

  const { mutate: sendMessageMutation } = useSendMessage();
  const { mutate: deleteMessageMutation } = useDeleteMessage();

  // Destructure the file upload mutation hook.
  const {
    mutate: uploadFile,
    status,
    isError,
    error: uploadError,
  } = useUploadFile({
    onSuccess: (data) => {
      console.log("File uploaded:", data.fileUrl);

      sendMessageMutation(
        {
          conversationId,
          data: {
            content: "",
            metadata: {
              attachments: [
                { url: data.fileUrl, type: getFileType(data.fileUrl) },
              ],
            },
          },
        },
        { onSuccess: () => queryClient.invalidateQueries() }
      );
    },
    onError: (err) => {
      console.error("File upload failed:", err);
    },
  });

  const isLoading = status === "pending";

  const handleSendMessage = () => {
    if (!input.trim()) return;
    setInput("");
    sendMessageMutation(
      {
        conversationId,
        data: {
          content: input,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries();
        },
      }
    );
  };

  const recorder = useAudioRecorder();
  console.log("recorder", recorder);

  const uploadAudio = () => {
    if (!recorder.blob) return;
    const formData = new FormData();
    formData.append("file", recorder.blob, "audio.webm");

    try {
      fetch(`${apiHost}/upload`, {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Audio uploaded:", data.fileUrl);

          sendMessageMutation(
            {
              conversationId,
              data: {
                content: "",
                metadata: {
                  attachments: [{ url: data.fileUrl, type: "audio" }],
                },
              },
            },
            { onSuccess: () => queryClient.invalidateQueries() }
          );
        });
    } catch (error) {
      console.error("Failed to upload audio:", error);
    }
  };

  useEffect(() => {
    (recorder as any).onRecordingStop = () => {
      setIsRecording(false);
    };
  }, [recorder]);

  const handleRecorderClick = () => {
    if (isRecording) {
      recorder.stopRecording();
      setIsRecording(false);
    } else {
      recorder.startRecording();
      setIsRecording(true);
    }
  };

  const handleOpenForwardModal = (messageContent: string) => {
    setForwardMessage(messageContent);
    setIsModalOpen(true);
  };

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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") handleSendMessage();
  };

  // Handle file selection from the file input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  // Handle pasted files (e.g. screenshots)
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      uploadFile(file);
    }
  };

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const formatMessage = (message: string) => {
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

  if (error) return <div>Error loading messages.</div>;
  if (isPending) return <div>Loading messages...</div>;

  const getFileType = (fileUrl: string) => {
    const ext = fileUrl.split(".").pop();
    if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "gif") {
      return "image";
    } else if (ext === "mp4" || ext === "mkv" || ext === "webm") {
      return "video";
    }
    return "other";
  };

  return (
    <ChatComponentWrapper onPaste={handlePaste}>
      <div className="chat-header">Chat</div>

      <div className="messages-container">
        {[...messages].reverse().map((msg) => {
          const sender = conversation.otherParticipants.find(
            (user) => user.id === msg.senderId
          );
          const senderName = sender ? sender.displayName : currentUser;

          const date = new Date(msg.createdAt);
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

          const isCurrentUser = senderName === currentUser;

          return (
            <div
              key={msg.id}
              className={
                isCurrentUser ? "messageWrapperCurrentUser" : "messageWrapper"
              }
            >
              {isCurrentUser ? (
                <ContextMenu
                  items={[
                    {
                      text: "Delete",
                      onClick: () => handleDeleteMessage(msg.id),
                    },
                    {
                      text: "Forward",
                      onClick: () => handleOpenForwardModal(msg.content),
                    },
                  ]}
                >
                  <div
                    className="message-bubble message-bubble-current-user"
                    onClick={() => console.log("Clicked message")}
                  >
                    <div className="sender-name">{senderName}</div>
                    <div className="message-text">
                      {formatMessage(msg.content)}
                    </div>
                    {msg.metadata?.attachments &&
                      msg.metadata.attachments.map(
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
                                <audio
                                  src={url}
                                  controls
                                  style={{ maxWidth: "100%" }}
                                />
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
                    <div className="timestamp">{formattedTimestamp}</div>
                    <div className="threeDotsIconDiv">
                      <ContextMenu
                        items={[
                          {
                            text: "Delete",
                            onClick: () => handleDeleteMessage(msg.id),
                          },
                          {
                            text: "Forward",
                            onClick: () => handleOpenForwardModal(msg.content),
                          },
                        ]}
                        isOnClick
                      >
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
              ) : (
                <ContextMenu
                  items={[
                    {
                      text: "Forward",
                      onClick: () => handleOpenForwardModal(msg.content),
                    },
                  ]}
                >
                  <div className="message-bubble">
                    <div className="sender-name">{senderName}</div>
                    <div className="message-text">{msg.content}</div>
                    <div className="timestamp">{formattedTimestamp}</div>
                    <div className="threeDotsIconDiv">
                      <ContextMenu
                        items={[
                          {
                            text: "Forward",
                            onClick: () => handleOpenForwardModal(msg.content),
                          },
                        ]}
                        isOnClick
                      >
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
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <button className="send-button" onClick={handleSendMessage}>
          Send
        </button>
        <button
          className="upload-button"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />
        {isLoading && <span className="upload-status">Uploading file...</span>}
        {isError && (
          <span className="upload-status error">
            Upload failed: {uploadError?.message}
          </span>
        )}

        <button onClick={() => handleRecorderClick()}>
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
        {recorder.blob && (
          <>
            <audio controls src={URL.createObjectURL(recorder.blob)} />
            <button onClick={uploadAudio}>Audio Upload</button>
          </>
        )}
      </div>

      {isModalOpen && (
        <ForwardModalComponent
          onClose={() => setIsModalOpen(false)}
          currentUserId={currentUserData?.id || ""}
          forwardMessage={forwardMessage}
        />
      )}
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

  .messageWrapperCurrentUser {
    align-self: flex-end;
    max-width: 85%;
  }

  .messageWrapper {
    max-width: 85%;
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

  .deleteTooltip {
    position: absolute;
    left: 75%;
    transform: translateX(-50%);
    color: #fff;
    border-radius: 4px;
    font-size: 12px;
    z-index: 10;
    width: fit-content;
    border-radius: 3px;
  }

  .deleteTooltip button {
    margin-left: 4px;
    background: #555;
    color: #fff;
    border: none;
    padding: 10px 18px;
    cursor: pointer;
    font-size: 12px;
    width: 100%;
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
