import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import {
  useGetConversation,
  useUpdateConversation,
  useRemoveConversationParticipant,
  useAddConversationParticipants,
  useGetFriends,
} from "../Query/QueryHooks";
import {
  UpdateConversationRequest,
  AddParticipantsRequest,
  Conversation,
} from "../Query/types";

import { User } from "../Query/types";

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

const NameInput = styled.input`
  padding: 8px;
  margin: 8px 0px 0px 5px;
  border: none;
  background: #3a3b3c;
  color: #e4e6eb;
  border-radius: 6px;
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

const AddButton = styled.button`
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

const RemoveButton = styled.button`
  background: #e0245e;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background: #c81e4e;
  }
`;

const EditButton = styled.button`
  background: #2374e1;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    background: #1a5bbf;
  }
`;

interface ConversationProps {
  conversation: Conversation;
  onClose: () => void;
}
export const EditGroupConversation = ({
  conversation,
  onClose,
}: ConversationProps) => {
  const updateConversationNameMutation = useUpdateConversation();
  const removeParticipantMutation = useRemoveConversationParticipant();

  const [conversationName, setConversationName] = useState("");
  const [participants, setParticipants] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const isLoading = status === "pending";
  const { data: friends = [] } = useGetFriends();
  const filteredFriends = friends.filter(
    (friend) =>
      friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !participants.find((p) => p.id === friend.id)
  );

  useEffect(() => {
    if (conversation) {
      setConversationName(conversationName);
      setParticipants(conversation.otherParticipants);
    }
  }, [conversation]);

  const handleUpdateConversation = () => {
    updateConversationNameMutation.mutate({
      id: conversation.id,
      data: { name: conversationName },
    });

    addParticipantsMutation.mutate({
      id: conversation.id,
      data: {
        userIds: participants.map((p) => p.id),
      },
    });
    onClose();
  };

  const handleRemoveParticipant = (userId: string) => {
    removeParticipantMutation.mutate({
      conversationId: conversation.id,
      userId,
    });
    setParticipants(participants.filter((p) => p.id !== userId));
  };

  const addParticipantsMutation = useAddConversationParticipants();

  const handleAddParticipant = (user: User) => {
    if (!participants.find((participant) => participant.id === user.id)) {
      setParticipants([...participants, user]);
    }

    // Add the user to the group conversation immediately after adding them
    if (conversationName) {
      const data = { userIds: [user.id] };
      addParticipantsMutation.mutate({ id: conversationName, data });
    }
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <div>Edit Group Conversation</div>
          <CloseButton onClick={onClose}>X</CloseButton>
        </ModalHeader>

        <div>
          <label>Conversation Name:</label>
          <NameInput
            type="text"
            value={conversationName}
            onChange={(e) => setConversationName(e.target.value)}
            placeholder="Enter conversation name"
          />
        </div>

        <SearchBar>
          <SearchInput
            type="text"
            placeholder="Search for users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBar>

        <ListContainer>
          {filteredFriends.map((friend) => (
            <ListItem
              key={friend.id}
              onClick={() => handleAddParticipant(friend)}
            >
              <UserInfo>
                <Avatar src={friend.avatarUrl} alt={friend.displayName} />
                <span>{friend.displayName}</span>
              </UserInfo>
              <AddButton>Add</AddButton>
            </ListItem>
          ))}
        </ListContainer>

        <div>
          <h4>Participants:</h4>
          <ListContainer>
            {participants.map((participant) => (
              <ListItem key={participant.id}>
                <UserInfo>
                  <Avatar
                    src={participant.avatarUrl}
                    alt={participant.displayName}
                  />
                  <span>{participant.displayName}</span>
                </UserInfo>
                <RemoveButton
                  onClick={() => handleRemoveParticipant(participant.id)}
                >
                  Remove
                </RemoveButton>
              </ListItem>
            ))}
          </ListContainer>
        </div>

        <EditButton onClick={handleUpdateConversation}>
          Edit Conversation
        </EditButton>
      </ModalContainer>
    </ModalOverlay>
  );
};
