import styled from "@emotion/styled";
import React from "react";
import { ErrorComponent } from "../Components/Error";
import { Loading } from "../Components/Loading";
import { useGetFriends, useRemoveFriend } from "../Query/QueryHooks";

export const GetFriendsPage: React.FC = () => {
  const { data: friends, isLoading, isError, error } = useGetFriends();
  const { mutate: unfriend, isPending } = useRemoveFriend();

  const handleUnfriend = (userId: string) => {
    unfriend({ userId });
  };

  return (
    <FriendsWrapper>
      <h1>Your Friends</h1>

      {isError && <ErrorComponent error={error} />}
      {isLoading && <Loading animation="pulse" />}

      <div className="friends-grid">
        {friends?.map((friend) => (
          <div className="friend-card" key={friend.id}>
            <h3>{friend.displayName}</h3>
            <p>{friend.email}</p>
            <button
              className="unfriend-btn"
              onClick={() => handleUnfriend(friend.id)}
              disabled={isPending}
            >
              {isPending ? "Removing..." : "Unfriend"}
            </button>
          </div>
        ))}
      </div>
    </FriendsWrapper>
  );
};

const FriendsWrapper = styled.div`
  max-height: 100vh;
  padding: 20px;
  background-color: #f0f0f0;

  h1 {
    text-align: center;
    margin-bottom: 20px;
  }

  .friends-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 250px);
    gap: 20px;
    justify-content: center;
  }

  .friend-card {
    width: 250px;
    height: 250px;
    background-color: #ffffff;
    border-radius: 8px;
    padding: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    h3 {
      margin-bottom: 10px;
    }

    p {
      color: #666;
    }

    .unfriend-btn {
      padding: 8px 12px;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 10px;
    }
  }
`;
