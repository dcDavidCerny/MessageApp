import React, { useState } from "react";
import styled from "@emotion/styled";
import {
  useSearchUsers,
  useCreateGroupConversation,
  useAddConversationParticipants,
} from "../Query/QueryHooks";
import { User, CreateGroupConversationRequest } from "../Query/types";

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

const CreateButton = styled.button`
  background: #1f1f1f;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    background: #111111;
  }
`;

export const CreateGroupConversation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conversationName, setConversationName] = useState("");
  const [participants, setParticipants] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users, isLoading } = useSearchUsers(searchQuery);
  const createGroupConversationMutation = useCreateGroupConversation();
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

  const handleRemoveParticipant = (userId: string) => {
    const updatedParticipants = participants.filter(
      (participant) => participant.id !== userId
    );
    setParticipants(updatedParticipants);

    // Optionally remove the user from the conversation using the remove participant hook
    // Replace `conversationId` with actual ID after conversation is created
    const conversationId = conversationName;
    addParticipantsMutation.mutate({
      id: conversationId,
      data: { userIds: updatedParticipants.map((p) => p.id) },
    });
  };

  const handleCreateConversation = async () => {
    const requestData: CreateGroupConversationRequest = {
      name: conversationName,
      userIds: participants.map((user) => user.id),
    };

    // Create the conversation
    const createdConversation =
      await createGroupConversationMutation.mutateAsync(requestData);

    // Set conversation ID after creation and reset modal state
    setConversationName(createdConversation.id);
    setIsModalOpen(false);
  };

  return (
    <div>
      <CreateButton onClick={() => setIsModalOpen(true)}>
        Create Group Conversation
      </CreateButton>

      {isModalOpen && (
        <ModalOverlay>
          <ModalContainer>
            <ModalHeader>
              <div>Create Group Conversation</div>
              <CloseButton onClick={() => setIsModalOpen(false)}>X</CloseButton>
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
              {isLoading ? (
                <div>Loading...</div>
              ) : (
                users?.map((user) => (
                  <ListItem
                    key={user.id}
                    onClick={() => handleAddParticipant(user)}
                  >
                    <UserInfo>
                      <Avatar src={user.avatarUrl} alt={user.displayName} />
                      <span>{user.displayName}</span>
                    </UserInfo>
                    <AddButton>Add</AddButton>
                  </ListItem>
                ))
              )}
            </ListContainer>

            <div>
              <h4>Participants:</h4>
              <ul>
                {participants.map((participant) => (
                  <li key={participant.id}>
                    {participant.displayName}
                    <button
                      onClick={() => handleRemoveParticipant(participant.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <CreateButton onClick={handleCreateConversation}>
                Create Conversation
              </CreateButton>
            </div>
          </ModalContainer>
        </ModalOverlay>
      )}
    </div>
  );
};
