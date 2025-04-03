import React, { useState } from "react";
import styled from "@emotion/styled";
import { Link } from "react-router-dom";
import { ButtonSecondary } from "./ShadcnComponents/ButtonSecondary";
import { DoorOpenIcon } from "./Icons/DoorOpenIcon";
import { DoorClosedIcon } from "./Icons/DoorClosedIcon";
import { ButtonOutlineIcon } from "./ShadcnComponents/ButtonOutlineIcon";
import { MockIcon } from "./Icons/MockIcon";
import { ArrowLeftIcon } from "./Icons/ArrowLeftIcon";
import { ArrowRightIcon } from "./Icons/ArrowRightIcon";

export const TemporaryComponent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <TemporaryComponentWrapper isSidebarOpen={isSidebarOpen}>
      <ToggleSidebarButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? (
          <>
            <ArrowLeftIcon />
            <DoorOpenIcon />
          </>
        ) : (
          <>
            <DoorClosedIcon />
            <ArrowRightIcon />
          </>
        )}
      </ToggleSidebarButton>

      {isSidebarOpen && <h2>Temporary Column</h2>}
      <div className="btnsDiv">
        <Link to="/getFriends">
          {isSidebarOpen ? (
            <ButtonSecondary className="btn">My Friends</ButtonSecondary>
          ) : (
            <ButtonOutlineIcon>
              <MockIcon />
            </ButtonOutlineIcon>
          )}
        </Link>

        <Link to="/getFriendRequests">
          {isSidebarOpen ? (
            <ButtonSecondary className="btn">Friend Requests</ButtonSecondary>
          ) : (
            <ButtonOutlineIcon>
              <MockIcon />
            </ButtonOutlineIcon>
          )}
        </Link>

        <Link to="/searchUsers">
          {isSidebarOpen ? (
            <ButtonSecondary className="btn">Add Friend</ButtonSecondary>
          ) : (
            <ButtonOutlineIcon>
              <MockIcon />
            </ButtonOutlineIcon>
          )}
        </Link>
      </div>
    </TemporaryComponentWrapper>
  );
};

const TemporaryComponentWrapper = styled.div<{ isSidebarOpen: boolean }>`
  width: ${({ isSidebarOpen }) => (isSidebarOpen ? "300px" : "60px")};
  border-right: 1px solid #303030;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease-in-out;

  h2 {
    text-align: center;
    padding-bottom: 15px;
    border-bottom: 1px solid #303030;
    overflow: hidden;
  }

  .btnsDiv {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
  }

  .btn {
    width: 100%;
    text-align: center;
    padding: 10px;
    cursor: pointer;
  }
`;

const ToggleSidebarButton = styled.button`
  background-color: #303030;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 10px;
  text-align: center;
  display: flex;
  justify-content: flex-end;

  &:hover {
    background-color: #555;
  }
`;
