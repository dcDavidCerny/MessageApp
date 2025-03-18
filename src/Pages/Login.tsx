import styled from "@emotion/styled";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Loading } from "../Components/Loading";
import { useLogin } from "../Query/QueryHooks";

export const LoginComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { mutate: loginUser, isPending: loginPending } = useLogin();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    loginUser(
      {
        email,
        password,
      },
      {
        onError: (error) => {
          console.error("Login error:", error);
          alert("Login failed. Please try again.");
        },
        onSuccess: () => {
          alert("Login successful!");
          navigate("/chat");
        },
      }
    );
  };

  return (
    <LoginWrapper>
      {loginPending && <Loading animation="pulse" />}
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </LoginWrapper>
  );
};

const LoginWrapper = styled.div`
  width: 50vw;
  height: 50vh;
  margin: auto;
  background-color: #00e5fa;
  display: flex;
  justify-content: center;
  align-items: center;
`;
