import styled from "@emotion/styled";
import React, { useEffect, useRef, useState } from "react";
import { useAudioRecorder } from "use-audio-recorder";
import { queryClient } from "../main";
import {
  apiHost,
  useGetCurrentUser,
  useGetMessages,
  useSendMessage,
  useUploadFile
} from "../Query/QueryHooks";
import { Conversation } from "../Query/types";
import { MessageComponent } from "./Message";
import { ScreenRecorder } from "./ScreenRecorder";

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
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: sendMessageMutation } = useSendMessage();

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

  const handleRecorderClick = () => {
    if (isRecording) {
      recorder.stopRecording();
      setIsRecording(false);
    } else {
      recorder.startRecording();
      setIsRecording(true);
    }
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
        {(() => {
          const lastSentMessage = messages
            .filter((msg) => msg.senderId === currentUserId)
            .slice(-1)[0];

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
          {isRecording ? "Stop Recording Audio" : "Start Recording Audio"}
        </button>
        {recorder.blob && (
          <>
            <audio controls src={URL.createObjectURL(recorder.blob)} />
            <button onClick={uploadAudio}>Audio Upload</button>
          </>
        )}
        <ScreenRecorder
          conversationId={conversationId}
          sendMessage={(conversationId, data, options) =>
            sendMessageMutation({ conversationId, data }, options)
          }
          getFileType={getFileType}
          queryClient={queryClient}
        />
      </div>
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
    height: 30px;
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
