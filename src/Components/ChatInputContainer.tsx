import { useState, useEffect, useRef } from "react";
import { queryClient } from "../main";
import { useSendMessage, useUploadFile, apiHost } from "../Query/QueryHooks";
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
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [isAudioRecordUploading, setIsAudioRecordUploading] = useState(false);

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

  const [isUploading, setIsUploading] = useState(false); // Prevent multiple uploads

  const uploadAudio = async () => {
    if (!recorder.blob || isUploading) return; // Prevent multiple uploads

    setIsUploading(true); // Set flag to true when uploading starts
    const formData = new FormData();
    formData.append("file", recorder.blob, "audio.webm");

    try {
      const response = await fetch(`${apiHost}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
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
    } catch (error) {
      console.error("Failed to upload audio:", error);
    } finally {
      // finally block to reset the uploading state
      // very cool, happends either way, so we can set it to false in both cases
      setIsUploading(false); // Reset flag once upload is complete
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

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRecording) {
      setElapsedTime(0);
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

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

        {!isAudioInProgress && (
          <ButtonOutlineIcon
            className="send-button"
            onClick={handleSendMessage}
          >
            <SendMessageIcon />
          </ButtonOutlineIcon>
        )}

        {/* ugly af, IK, but I am unsure, if some time limitation should come to the place.
And if so, I think some circle which would be slowly filling up in clockTime movement.
Top - Right - Bottom - Left - Top, which is also way padding and margin works :) */}

        {isRecording && <p>Recording Time: {elapsedTime} sec</p>}

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
            <ButtonSecondary onClick={handleCancelRecording}>
              Cancel
            </ButtonSecondary>
            <audio controls src={URL.createObjectURL(recordedBlob)} />
            <ButtonSecondary onClick={uploadAudio}>
              Upload Audio
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
    margin-right: 5px;
  }

  .send-button {
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
