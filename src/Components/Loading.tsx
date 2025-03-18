import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import React from "react";

type LoadingProps = {
  animation?: "spinner" | "bounce" | "pulse";
};

// Loading component that has different animations
// depending on the prop passed to it
// Default is spinner
export const Loading: React.FC<LoadingProps> = ({ animation = "spinner" }) => {
  let AnimationComponent;

  switch (animation) {
    case "bounce":
      AnimationComponent = <Bounce />;
      break;
    case "pulse":
      AnimationComponent = <Pulse />;
      break;
    case "spinner":
    default:
      AnimationComponent = <Spinner />;
      break;
  }

  return <Overlay>{AnimationComponent}</Overlay>;
};

// Spinner animation
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #09f;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  animation: ${spin} 1s linear infinite;
`;

// Bounce animation
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-40px); }
`;

const Bounce = styled.div`
  width: 100px;
  height: 100px;
  background-color: #09f;
  border-radius: 50%;
  animation: ${bounce} 0.6s ease-in-out infinite;
`;

// Pulse animation
const pulse = keyframes`
  0% { transform: scale(0.7); opacity: 0.2; }
  50% { transform: scale(1.5); opacity: 1; }
  100% { transform: scale(0.7); opacity: 0.2; }
`;

const Pulse = styled.div`
  width: 100px;
  height: 100px;
  background-color: #09f;
  border-radius: 50%;
  animation: ${pulse} 1s ease-in-out infinite;
`;

// Overlay container that covers the entire viewport
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;
