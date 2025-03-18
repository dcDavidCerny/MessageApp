import { useState } from "react";
import styled from "styled-components";
import { ChatComponent } from "../Components/Chat";
import { ConversationsColumnComponent } from "../Components/ConversationsColumn";
import { Loading } from "../Components/Loading";
import { queryClient } from "../main";
import { useGetCurrentUser, useUpdateCurrentUser } from "../Query/QueryHooks";

export const ChatPage = () => {
  const { data: user, isPending: isUserLoadingPending } = useGetCurrentUser({
    refetchInterval: 1000 * 60 * 60, // refetch every hour
    refetchOnMount: true,
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

  if (isUserLoadingPending || !user) {
    return <Loading />;
  }
  return (
    <>
      {updateUserPending && <Loading animation="pulse" />}
      <ChatPageWrapper>
        <div>
          User <b>{user!.displayName}</b> is logged in!
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
        <ConversationsColumnComponent />
        <ChatComponent />
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
