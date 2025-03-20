import styled from "@emotion/styled";
import { useState } from "react";
import { ChatComponent } from "../Components/Chat";
import { ConversationsColumnComponent } from "../Components/ConversationsColumn";
import { ErrorComponent } from "../Components/Error";
import { Loading } from "../Components/Loading";
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
  return (
    <>
      {updateUserPending && <Loading animation="pulse" />}
      <ChatPageWrapper>
        <div>
          User <b>{user.displayName}</b> is logged in!
          <br />
          <br />
          His email is {user.email}
          <br />
          <br />
          change display name:
          <br />
          <br />
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <br />
          <br />
          <button
            onClick={handleChangeDisplayName}
            disabled={displayName.length < 3}
          >
            Change Display Name
          </button>
        </div>
        <ConversationsColumnComponent
          conversations={conversations}
          selectedConversationId={selectedConversationId || ""}
          setSelectedConversationId={setSelectedConversationId}
        />
        <ChatComponent
          conversation={
            conversations.find((c) => c.id === selectedConversationId) ||
            conversations[0]
          }
        />
      </ChatPageWrapper>
    </>
  );
};

const ChatPageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
  gap: 10px;
`;
