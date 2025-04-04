import styled from "@emotion/styled";
import React from "react";

interface Attachment {
  url: string;
  type: "image" | "video" | "audio" | "other";
}

interface AttachmentRendererProps {
  attachments: Attachment[];
  apiHost: string;
}

export const AttachmentRenderer: React.FC<AttachmentRendererProps> = ({
  attachments,
  apiHost,
}) => {
  return (
    <AttachmentContainer>
      {attachments.map((attachment) => {
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
      })}
    </AttachmentContainer>
  );
};

const AttachmentContainer = styled.div`
  audio {
    padding: 5px;
  }
`;
