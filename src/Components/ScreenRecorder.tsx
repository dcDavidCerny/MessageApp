import React, { useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import { useUploadFile } from "../Query/QueryHooks";

interface ScreenRecorderProps {
  conversationId: string;
  sendMessage: (
    conversationId: string,
    data: {
      content: string;
      metadata: { attachments: { url: string; type: string }[] };
    },
    options?: any
  ) => void;
  getFileType: (url: string) => string;
  queryClient: any;
}

const RecorderContainer = styled.div`
  margin-top: 1rem;
  button {
    margin-right: 0.5rem;
    padding: 0.5rem 1rem;
  }
  video {
    margin-top: 1rem;
    width: 100%;
    max-width: 500px;
  }
  .status {
    margin-top: 0.5rem;
    color: #555;
  }
`;

export const ScreenRecorder: React.FC<ScreenRecorderProps> = ({
  conversationId,
  sendMessage,
  getFileType,
  queryClient,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Ref to accumulate recorded chunks
  const recordedChunksRef = useRef<Blob[]>([]);

  // Ref for live video preview
  const liveVideoRef = useRef<HTMLVideoElement>(null);

  // Setup file upload hook with onSuccess callback to send the message.
  const {
    mutate: uploadFile,
    status,
    isError,
    error,
  } = useUploadFile({
    onSuccess: (data) => {
      console.log("File uploaded:", data.fileUrl);
      sendMessage(
        conversationId,
        {
          content: "",
          metadata: {
            attachments: [
              { url: data.fileUrl, type: getFileType(data.fileUrl) },
            ],
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
  // Update the live video element with the stream when available.
  useEffect(() => {
    if (liveVideoRef.current && stream && isRecording) {
      liveVideoRef.current.srcObject = stream;
      liveVideoRef.current.play().catch(console.error);
    }
  }, [stream, isRecording]);

  // Start recording using Screen Capture API.
  const startRecording = async () => {
    try {
      const captureStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      setStream(captureStream);
      recordedChunksRef.current = []; // Clear previous chunks
      setVideoUrl(null); // Clear previous recorded preview

      const recorder = new MediaRecorder(captureStream, {
        mimeType: "video/webm",
      });
      setMediaRecorder(recorder);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting screen recording:", err);
    }
  };

  // Stop recording and release media resources.
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
  };

  // Reset all states and refs to initial state (cancels recording)
  const resetRecording = () => {
    setIsRecording(false);
    setMediaRecorder(null);
    setStream(null);
    setVideoUrl(null);
    recordedChunksRef.current = [];
  };

  // Upload the recorded file and send as message.
  const handleUploadAndSend = () => {
    if (recordedChunksRef.current.length) {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const file = new File([blob], "screen-recording.webm", {
        type: "video/webm",
      });
      uploadFile(file);
    }
  };

  // Determine button label and action based on state.
  let toggleButtonLabel: string;
  let toggleButtonAction: () => void;

  if (isRecording) {
    toggleButtonLabel = "Stop Recording Screen";
    toggleButtonAction = stopRecording;
  } else if (videoUrl) {
    toggleButtonLabel = "Cancel Screen Record";
    toggleButtonAction = resetRecording;
  } else {
    toggleButtonLabel = "Start Recording Screen";
    toggleButtonAction = startRecording;
  }

  return (
    <RecorderContainer>
      <button onClick={toggleButtonAction}>{toggleButtonLabel}</button>
      {/* Show live preview when recording */}
      {isRecording && stream && (
        <div>
          <video
            ref={liveVideoRef}
            muted
            playsInline
            style={{ border: "1px solid #ccc" }}
          />
          <p>Live preview of your recording...</p>
        </div>
      )}
      {/* Show recorded video preview once recording stops */}
      {!isRecording && videoUrl && (
        <div>
          <video controls src={videoUrl} />
          <div>
            <button onClick={handleUploadAndSend}>
              Upload &amp; Send Screen Recording
            </button>
          </div>
        </div>
      )}
      {isLoading && (
        <span className="status">Uploading screen recording...</span>
      )}
      {isError && (
        <span className="status">
          Error uploading screen recording: {error?.message}
        </span>
      )}
    </RecorderContainer>
  );
};
