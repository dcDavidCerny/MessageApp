import styled from "@emotion/styled";
import { Link } from "react-router-dom";

export const ErrorComponent = ({ error }: { error: unknown }) => {
  const errorText = error instanceof Error ? error.message : String(error);
  console.error("Error:", errorText);
  return (
    <ErrorWrapper className="error">
      Error: {errorText}
      {errorText.includes("status: 401") && (
        <div>
          <br />
          You are not logged in. Please log in to continue:{" "}
          <Link to="/login">Login</Link>
        </div>
      )}
    </ErrorWrapper>
  );
};

// nice box in the middle of the screen with overlay
const ErrorWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #f8d7da;
  color: #721c24;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
`;
