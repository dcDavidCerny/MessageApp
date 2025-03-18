import styled from "@emotion/styled";
import React, { useState } from "react";
import { ErrorComponent } from "../Components/Error";
import { Loading } from "../Components/Loading";
import { useSearchUsers } from "../Query/QueryHooks";

export const SearchUsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useSearchUsers(searchTerm, {
    enabled: searchTerm.length > 1,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  return (
    <SearchUsersWrapper>
      <h1>Search Users</h1>
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Type a display name or email..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      {isError && <ErrorComponent error={error} />}

      {isLoading && <Loading animation="pulse" />}

      <div className="users-grid">
        {users?.map((user) => (
          <div className="user-card" key={user.id}>
            <h3>{user.displayName}</h3>
            <p>{user.email}</p>
          </div>
        ))}
      </div>
    </SearchUsersWrapper>
  );
};

const SearchUsersWrapper = styled.div`
  max-height: 100vh;
  padding: 20px;
  background-color: #f0f0f0;

  h1 {
    text-align: center;
    margin-bottom: 20px;
  }

  .search-input-container {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;

    input {
      width: 50%;
      padding: 10px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 8px;
      outline: none;
    }
  }

  .error {
    text-align: center;
    color: red;
    margin: 20px 0;
    font-size: 18px;
  }

  .users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 250px);
    gap: 20px;
    justify-content: center;
  }

  .user-card {
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
  }
`;
