import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import styled from "@emotion/styled";

interface AudioPlayerProps {
  url: string;
  isCurrentUser: boolean;
}

export const AudioPlayerComponent: React.FC<AudioPlayerProps> = ({
  url,
  isCurrentUser,
}) => {
  return (
    <StyledAudioPlayer isCurrentUser={isCurrentUser}>
      <AudioPlayer
        src={url}
        progressJumpSteps={{ forward: 5000, backward: 5000 }}
        layout="horizontal"
        customAdditionalControls={[]}
        customVolumeControls={[]}
        onPlay={() => console.log("Playing audio:", url)}
      />
    </StyledAudioPlayer>
  );
};

const StyledAudioPlayer = styled.div<{ isCurrentUser: boolean }>`
  .rhap_container {
    background: ${({ isCurrentUser }) =>
      isCurrentUser ? "var(--secondary-foreground)" : "var(--secondary)"};
    color: ${({ isCurrentUser }) =>
      isCurrentUser ? "var(--secondary)" : "var(--secondary-foreground)"};
    border-radius: 12px;
    padding: 5px;
    width: 100%;
  }

  .rhap_main-controls-button,
  .rhap_play-pause-button {
    color: ${({ isCurrentUser }) =>
      isCurrentUser ? "var(--chart-5)" : "var(--secondary-foreground)"};
  }

  .rhap_progress-filled {
    background: ${({ isCurrentUser }) =>
      isCurrentUser ? "var(--secondary)" : "var(--secondary-foreground)"};
  }

  .rhap_progress-indicator {
    display: none;
  }

  .rhap_time,
  .rhap_volume-button,
  .rhap_volume-bar {
    color: ${({ isCurrentUser }) =>
      isCurrentUser ? "var(--secondary)" : "var(--secondary-foreground)"};
  }
`;
