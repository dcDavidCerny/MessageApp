import styled from "@emotion/styled";
import React, { useState } from "react";
import { Loading } from "../Components/Loading";
import { ButtonSecondary } from "@/Components/ShadcnComponents/ButtonSecondary";
import { InputDefault } from "@/Components/ShadcnComponents/InputDefault";
import {
  useGetFriendRequests,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useSearchUsers,
  useSendFriendRequest,
  useGetFriends,
  useRemoveFriend,
} from "../Query/QueryHooks";
import { ErrorComponent } from "../Components/Error";
import { ScrollContainer } from "./ShadcnComponents/ScrollAreaScrollbar";

export const FriendsComponent: React.FC = () => {
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: friendRequests,
    isLoading: loadingRequests,
    isError: errorRequests,
    error: errorRequestsData,
  } = useGetFriendRequests();
  const { mutate: acceptRequest } = useAcceptFriendRequest();
  const { mutate: declineRequest } = useDeclineFriendRequest();

  const {
    data: users,
    isLoading: loadingUsers,
    isError: errorUsers,
    error: errorUsersData,
  } = useSearchUsers(searchTerm, { enabled: searchTerm.length > 1 });
  const { mutate: sendFriendRequest } = useSendFriendRequest();

  const {
    data: friends,
    isLoading: loadingFriends,
    isError: errorFriends,
    error: errorFriendsData,
  } = useGetFriends();
  const { mutate: unfriend } = useRemoveFriend();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAccept = (id: string) => {
    acceptRequest({ userId: id });
  };

  const handleDecline = (id: string) => {
    declineRequest({ userId: id });
  };

  const handleSendFriendRequest = (userId: string) => {
    sendFriendRequest({ userId });
  };

  const handleUnfriend = (userId: string) => {
    unfriend({ userId });
  };

  return (
    <FriendsWrapper>
      <div className="chat-header">FRIENDS</div>
      <ScrollContainer>
        <div className="friend-requests">
          <h2>Friend Requests:</h2>
          {loadingRequests && <Loading animation="pulse" />}
          {errorRequests && <ErrorComponent error={errorRequestsData} />}

          <div className="requests-list">
            {friendRequests
              ?.slice(0, showAllRequests ? friendRequests.length : 10)
              .map((request) => (
                <div key={request.id} className="request-card">
                  <img
                    src={request.avatarUrl || "/default-avatar.png"}
                    // alt={friend.displayName}
                    className="avatar-img"
                  />
                  <div className="name-email-column">
                    <h3>{request.displayName}</h3>
                    <p>{request.email}</p>
                  </div>
                  <div className="requestButtons">
                    <ButtonSecondary
                      className="acceptBtn"
                      onClick={() => handleAccept(request.id)}
                    >
                      Y
                    </ButtonSecondary>
                    <ButtonSecondary
                      className="declineBtn"
                      onClick={() => handleDecline(request.id)}
                    >
                      N
                    </ButtonSecondary>
                  </div>
                </div>
              ))}
          </div>

          {(friendRequests?.length ?? 0) > 10 && !showAllRequests && (
            <ButtonSecondary onClick={() => setShowAllRequests(true)}>
              Show The Rest
            </ButtonSecondary>
          )}
        </div>

        {/* Search Users */}
        <div className="search-users">
          <h2>Search Users:</h2>
          <InputDefault
            placeholder="Search by display name or email..."
            value={searchTerm}
            onChange={handleSearchChange}
          />

          {loadingUsers && <Loading animation="pulse" />}
          {errorUsers && <ErrorComponent error={errorUsersData} />}

          <div className="users-list">
            {users?.map((user) => (
              <div key={user.id} className="user-card">
                <img
                  src={user.id || "/default-avatar.png"}
                  // alt={friend.displayName}
                  className="avatar-img"
                />
                <div className="name-email-column">
                  <h3>{user.displayName}</h3>
                  <p>{user.email}</p>
                </div>
                <ButtonSecondary
                  className="sendRequestBtn"
                  onClick={() => handleSendFriendRequest(user.id)}
                >
                  Send Friend Request
                </ButtonSecondary>
              </div>
            ))}
          </div>
        </div>

        {/* Friends List */}
        <div className="friends-wrapper">
          <h2>Your Friends:</h2>
          {loadingFriends && <Loading animation="pulse" />}
          {errorFriends && <ErrorComponent error={errorFriendsData} />}

          <div className="friends-list">
            {friends?.map((friend) => (
              <div key={friend.id} className="friend-card">
                <img
                  src={friend.id || "/default-avatar.png"}
                  // alt={friend.displayName}
                  className="avatar-img"
                />
                <div className="name-email-column">
                  <h3>{friend.displayName}</h3>
                  <p>{friend.email}</p>
                </div>
                <ButtonSecondary
                  className="unfriendBtn"
                  onClick={() => handleUnfriend(friend.id)}
                >
                  Unfriend
                </ButtonSecondary>
              </div>
            ))}
          </div>
        </div>
      </ScrollContainer>
    </FriendsWrapper>
  );
};

// Styles for the Friends page
const FriendsWrapper = styled.div`
  height: 100%;
  width: 100%;
  background: var(--primary-foreground);
  margin: auto;
  display: flex;
  flex-direction: column;

  .chat-header {
    padding: 16px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    background-color: #000000;
    color: white;
    width: 100%;
    margin: 0;
  }

  h2 {
    color: var(--primary);
    font-size: 24px;
    margin-bottom: 10px;
  }

  .friend-requests,
  .search-users,
  .friends-wrapper {
    padding: 15px;
  }

  .name-email-column {
    display: flex;
    flex-direction: column;
  }

  .friends-list,
  .requests-list,
  .users-list {
    display: flex;
    flex-direction: wrap;
    flex-wrap: wrap;
    gap: 10px;
  }

  .request-card,
  .user-card,
  .friend-card {
    background-color: var(--foreground);
    color: var(--secondary);
    padding: 10px;
    border-radius: 8px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
  }

  .unfriendBtn,
  .sendRequestBtn,
  .acceptBtn,
  .declineBtn {
    margin-left: 10px;
  }
`;
