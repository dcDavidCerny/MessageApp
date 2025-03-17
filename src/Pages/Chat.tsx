import { ChatComponent } from "../Components/Chat";
import { ConversationsColumnComponent } from "../Components/ConversationsColumn";
import styled from "styled-components";

export const ChatPage = () => {
  return (
    <ChatPageWrapper>
      <ConversationsColumnComponent />
      <ChatComponent />
    </ChatPageWrapper>
  );
};

const ChatPageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
  gap: 10px;
`;
