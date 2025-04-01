import { queryClient } from "../main";
import { useSendMessage, useUploadFile, apiHost } from "../Query/QueryHooks";
import { useState, useRef } from "react";
import { useAudioRecorder } from "use-audio-recorder";
import { ScreenRecorder } from "./ScreenRecorder";
import { Conversation } from "../Query/types";
import styled from "@emotion/styled";
import { ButtonSecondary } from "./ShadcnComponents/ButtonSecondary";

interface ChatInputContainerProps {
  conversation: Conversation;
}

export const ChatInputContainerComponent: React.FC<ChatInputContainerProps> = ({
  conversation,
}) => {
  const conversationId = conversation.id;
  const [input, setInput] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: sendMessageMutation } = useSendMessage();

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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") handleSendMessage();
  };

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
    <ChatInputContainerWrapper onPaste={handlePaste}>
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
        <ButtonSecondary
          className="upload-button"
          onClick={() => fileInputRef.current?.click()}
          text="Upload File!"
        />
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
    </ChatInputContainerWrapper>
  );
};

const ChatInputContainerWrapper = styled.div`
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
