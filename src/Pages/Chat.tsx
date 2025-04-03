import styled from "@emotion/styled";
import { useState } from "react";
import { ChatComponent } from "../Components/Chat";
import { ConversationsColumnComponent } from "../Components/ConversationsColumn";
import { ErrorComponent } from "../Components/Error";
import { Loading } from "../Components/Loading";
import { ResizeComponentWrapper } from "../Components/ResizeComponentWrapper";
import { TemporaryComponent } from "../Components/TemporaryColumnForMoreHooks";
import { queryClient } from "../main";
import {
  useGetCurrentUser,
  useGetRecentConversations,
  useUpdateCurrentUser,
} from "../Query/QueryHooks";

export const ChatPage = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  const {
    data: user,
    isPending: isUserLoadingPending,
    error,
  } = useGetCurrentUser({
    refetchInterval: 1000 * 60 * 60 * 0.5, // refetch every half hour
  });
  const { mutate: updateUser, isPending: updateUserPending } =
    useUpdateCurrentUser();
  const [displayName, setDisplayName] = useState("");
  const handleChangeDisplayName = () => {
    updateUser(
      { displayName },
      {
        onSuccess: () => {
          alert("Display name updated!");
          queryClient.invalidateQueries({ queryKey: ["/users/me"] });
        },
      }
    );
  };

  const {
    data: conversations,
    isPending,
    error: recentConversationError,
  } = useGetRecentConversations();

  if (error) {
    return <ErrorComponent error={error} />;
  }
  if (recentConversationError) {
    return <ErrorComponent error={recentConversationError} />;
  }

  if (isUserLoadingPending || !user || isPending || !conversations) {
    return <Loading />;
  }
  const selectedConversation =
    conversations.find((c) => c.id === selectedConversationId) ||
    conversations[0];
  return (
    <>
      {updateUserPending && <Loading animation="pulse" />}
      <ChatPageWrapper>
        <TemporaryComponent></TemporaryComponent>
        {/* <ResizeComponentWrapper
          initialConversationListWidth={200}
          conversationListMinWidth={170}
          conversationListMaxWidth={254}
        > */}
        <ConversationsColumnComponent
          conversations={conversations}
          selectedConversationId={selectedConversationId || ""}
          setSelectedConversationId={setSelectedConversationId}
        />
        {selectedConversation ? (
          <ChatComponent conversation={selectedConversation} />
        ) : (
          <p>No conversations yet. Start a new chat!</p>
        )}
        {/* </ResizeComponentWrapper> */}
      </ChatPageWrapper>
    </>
  );
};

const ChatPageWrapper = styled.div`
  background-color: #000000;
  display: flex;
  flex-direction: row;
  height: 100vh;
  gap: 10px;
`;
