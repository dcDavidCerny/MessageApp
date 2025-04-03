import { queryClient } from "../main";
import { useSendMessage, useUploadFile, apiHost } from "../Query/QueryHooks";
import { useState, useRef, useEffect } from "react";
import { useAudioRecorder } from "use-audio-recorder";
import { ScreenRecorder } from "./ScreenRecorder";
import { Conversation } from "../Query/types";
import styled from "@emotion/styled";
import { ButtonSecondary } from "./ShadcnComponents/ButtonSecondary";
import { ButtonOutlineIcon } from "./ShadcnComponents/ButtonOutlineIcon";
import { TextAreaDefault } from "./ShadcnComponents/TextAreaDefault";
import { SendMessageIcon } from "./Icons/SendMessageIcon";

interface ChatInputContainerProps {
  conversation: Conversation;
}

export const ChatInputContainerComponent: React.FC<ChatInputContainerProps> = ({
  conversation,
}) => {
  const conversationId = conversation.id;
  const [input, setInput] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAudioInProgress, setIsAudioInProgress] = useState(false);

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

  useEffect(() => {
    if (recorder.blob) {
      setRecordedBlob(recorder.blob);
      setIsAudioInProgress(true);
    }
  }, [recorder.blob]);

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
            {
              onSuccess: () => {
                queryClient.invalidateQueries();
                setIsAudioInProgress(false);
                setRecordedBlob(null);
              },
            }
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
      setIsAudioInProgress(true);
    } else {
      recorder.startRecording();
      setIsAudioInProgress(true);
      setIsRecording(true);
    }
  };

  const handleCancelRecording = () => {
    setRecordedBlob(null);
    setIsAudioInProgress(false);
    setIsRecording(false);
  };

  const getFileType = (fileUrl: string) => {
    const ext = fileUrl.split(".").pop();
    return ["jpg", "jpeg", "png", "gif"].includes(ext || "")
      ? "image"
      : ["mp4", "mkv", "webm"].includes(ext || "")
      ? "video"
      : "other";
  };

  return (
    <ChatInputContainerWrapper>
      <div className="chat-input-container">
        <TextAreaDefault
          className="chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <ButtonOutlineIcon className="send-button" onClick={handleSendMessage}>
          <SendMessageIcon />
        </ButtonOutlineIcon>

        {!recordedBlob && (
          <ButtonSecondary
            className="audio-button"
            onClick={handleRecorderClick}
          >
            {isRecording ? "Stop Recording Audio" : "Start Recording Audio"}
          </ButtonSecondary>
        )}

        {recordedBlob && (
          <>
            <audio controls src={URL.createObjectURL(recordedBlob)} />
            <ButtonSecondary onClick={uploadAudio}>
              Upload Audio
            </ButtonSecondary>
            <ButtonSecondary onClick={handleCancelRecording}>
              Cancel
            </ButtonSecondary>
          </>
        )}

        {!isAudioInProgress && (
          <>
            <ButtonSecondary
              className="upload-button"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload File!
            </ButtonSecondary>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              onChange={(e) =>
                e.target.files?.[0] && uploadFile(e.target.files[0])
              }
            />
            {isLoading && (
              <span className="upload-status">Uploading file...</span>
            )}
            {isError && (
              <span className="upload-status error">
                Upload failed: {uploadError?.message}
              </span>
            )}
            <ButtonSecondary className="screen-recorder-button">
              <ScreenRecorder
                conversationId={conversationId}
                sendMessage={(conversationId, data, options) =>
                  sendMessageMutation({ conversationId, data }, options)
                }
                getFileType={(fileUrl) => fileUrl.split(".").pop() || "other"}
                queryClient={queryClient}
              />
            </ButtonSecondary>
          </>
        )}
      </div>
    </ChatInputContainerWrapper>
  );
};
const ChatInputContainerWrapper = styled.div`
  .chat-input-container {
    display: flex;
    padding: 10px;
    background: #000000;
  }

  .chat-input {
    resize: none;
    max-height: 90px;
    word-break: break-word;
    min-width: 150px;
  }

  .send-button {
    margin-left: 5px;
    height: 64px;
  }

  .upload-button {
    margin-left: 5px;
    height: 64px;
  }

  .audio-button {
    margin-left: 5px;
    height: 64px;
  }

  .screen-recorder-button {
    margin-left: 5px;
    height: 64px;
  }
`;
