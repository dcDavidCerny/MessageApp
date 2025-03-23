import styled from "@emotion/styled";
import { Outlet, Link } from "react-router-dom";

export const TemporaryComponent = () => {
  return (
    <TemporaryComponentWrapper>
      <h2>Temporary Component</h2>
      <div className="btnsDiv">
        <Link to="/getFriends">
          <button>My Friends</button>
        </Link>

        <Link to="/getFriendRequests">
          <button>Friend Requests</button>
        </Link>

        <Link to="/searchUsers">
          <button>Add Friend</button>
        </Link>

        <Link to="">
          <button>EMPTY</button>
        </Link>
      </div>
    </TemporaryComponentWrapper>
  );
};

const TemporaryComponentWrapper = styled.div`
  width: 300px;
  background-color: #f5f5f5;
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;

  h2 {
    text-align: center;
    padding-bottom: 15px;
    border-bottom: 1px solid #ccc;
  }

  .btnsDiv {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;

    button {
      width: 100%;
      padding: 10px;
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 5px;
      cursor: pointer;
      transition: 0.2s;

      &:hover {
        background-color: #f0f0f0;
      }
    }
  }
`;
