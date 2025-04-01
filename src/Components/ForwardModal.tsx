import styled from "@emotion/styled";
import React, { useMemo, useState } from "react";
import {
  useCreateDirectConversation,
  useGetFriends,
  useGetRecentConversations,
  useSearchUsers,
  useSendMessage,
} from "../Query/QueryHooks";
import {
  Conversation,
  Message,
  SendMessageRequest,
  User,
} from "../Query/types";
import { queryClient } from "../main";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: #18191a;
  width: 400px;
  border-radius: 8px;
  padding: 16px;
  color: #e4e6eb;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #b0b3b8;
  font-size: 18px;
  cursor: pointer;
  &:hover {
    color: #ffffff;
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: #3a3b3c;
  border-radius: 20px;
  padding: 8px 12px;
  margin: 10px 0;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  color: #e4e6eb;
  margin-left: 8px;
  outline: none;
`;

const ListContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background: #3a3b3c;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 10px;
`;

const SendButton = styled.button`
  background: #2374e1;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background: #1a5bbf;
  }
`;

interface ForwardModalProps {
  onClose: () => void;
  currentUserId: string;
  forwardMessage: SendMessageRequest | null;
}

export const ForwardModalComponent: React.FC<ForwardModalProps> = ({
  onClose,
  currentUserId,
  forwardMessage,
}) => {
  const [search, setSearch] = useState("");

  const { data: recentConversations } = useGetRecentConversations();
  const { data: friends } = useGetFriends();
  const { data: searchResults } = useSearchUsers(search, {
    enabled: search.length > 0,
  });

  const createDirectConversation = useCreateDirectConversation();
  const sendMessage = useSendMessage();

  const getOtherUserFromConversation = (
    conversation: Conversation
  ): User | null => {
    if (!conversation.participantIds) return null;
    const otherId =
      conversation.participantIds.find((p) => p !== currentUserId) || null;
    return otherId
      ? friends?.find((friend) => friend.id === otherId) || null
      : null;
  };

  const recentUsers = useMemo(() => {
    if (!recentConversations) return [];
    const topFive = recentConversations.slice(0, 5);
    const users: User[] = [];
    topFive.forEach((conv) => {
      const other = getOtherUserFromConversation(conv);
      if (other) users.push(other);
    });
    const uniqueUsers = Array.from(new Set(users.map((u) => u.id))).map(
      (id) => users.find((u) => u.id === id)!
    );
    return uniqueUsers;
  }, [recentConversations]);

  const friendsExcludingRecent = useMemo(() => {
    if (!friends) return [];
    const recentUserIds = recentUsers.map((u) => u.id);
    return friends.filter((friend) => !recentUserIds.includes(friend.id));
  }, [friends, recentUsers]);

  let userList: User[] = [];
  if (search.length > 0 && searchResults) {
    userList = searchResults;
  } else {
    userList = [...recentUsers, ...friendsExcludingRecent];
  }

  const handleSend = (user: User) => {
    if (!forwardMessage) {
      console.error("No message to forward.");
      return;
    }

    createDirectConversation.mutate(
      { userId: user.id },
      {
        onSuccess: (conversation) => {
          queryClient.invalidateQueries();

          sendMessage.mutate(
            { conversationId: conversation.id, data: forwardMessage },
            {
              onSuccess: (message: Message) => {
                queryClient.invalidateQueries();
                console.log("Message forwarded successfully:", message);
                onClose();
              },
              onError: (error: Error) => {
                console.error("Error forwarding message:", error);
              },
            }
          );
        },
        onError: (error: Error) => {
          console.error("Error creating conversation:", error);
        },
      }
    );
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <span>Forward</span>
          <CloseButton onClick={onClose}>X</CloseButton>
        </ModalHeader>

        <SearchBar>
          <SearchInput
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchBar>

        <ListContainer>
          {userList.map((user) => (
            <ListItem key={user.id}>
              <UserInfo>
                <Avatar
                  src={user.avatarUrl || "https://i.pravatar.cc/36"}
                  alt={user.displayName}
                />
                <span>{user.displayName}</span>
              </UserInfo>
              <SendButton onClick={() => handleSend(user)}>Send</SendButton>
            </ListItem>
          ))}
        </ListContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};
