import styled from "@emotion/styled";
import React from "react";
import { ErrorComponent } from "../Components/Error";
import { Loading } from "../Components/Loading";
import {
  useGetFriendRequests,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
} from "../Query/QueryHooks";

export const GetFriendRequestsPage: React.FC = () => {
  const {
    data: friendRequests,
    isLoading,
    isError,
    error,
  } = useGetFriendRequests();

  const { mutate: acceptFriendRequest, isPending: isAccepting } =
    useAcceptFriendRequest();

  const { mutate: declineFriendRequest, isPending: isDeclining } =
    useDeclineFriendRequest();

  const handleAccept = (requestId: string) => {
    acceptFriendRequest(
      { userId: requestId },
      {
        onSuccess: () => {
          console.log("Friend request accepted!");
        },
        onError: (error) => {
          console.error("Failed to accept friend request:", error.message);
        },
      }
    );
  };

  const handleDecline = (requestId: string) => {
    declineFriendRequest({ userId: requestId });
  };

  return (
    <FriendRequestsWrapper>
      <h1>Pending Friend Requests</h1>

      {isError && <ErrorComponent error={error} />}
      {isLoading && <Loading animation="pulse" />}

      <div className="requests-grid">
        {friendRequests?.map((request) => (
          <div className="request-card" key={request.id}>
            <h3>{request.displayName}</h3>
            <p>{request.email}</p>
            <div className="buttons">
              <button
                className="accept-btn"
                onClick={() => handleAccept(request.id)}
                disabled={isAccepting}
              >
                {isAccepting ? "Accepting..." : "Accept"}
              </button>
              <button
                className="decline-btn"
                onClick={() => handleDecline(request.id)}
                disabled={isDeclining}
              >
                {isDeclining ? "Declining..." : "Decline"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </FriendRequestsWrapper>
  );
};

const FriendRequestsWrapper = styled.div`
  max-height: 100vh;
  padding: 20px;
  background-color: #f0f0f0;

  h1 {
    text-align: center;
    margin-bottom: 20px;
  }

  .requests-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 250px);
    gap: 20px;
    justify-content: center;
  }

  .request-card {
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

    .buttons {
      display: flex;
      gap: 10px;
      margin-top: 10px;

      .accept-btn {
        padding: 8px 12px;
        background-color: #28a745;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
      }

      .decline-btn {
        padding: 8px 12px;
        background-color: #dc3545;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
      }
    }
  }
`;
