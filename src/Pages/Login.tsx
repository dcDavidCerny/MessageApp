import styled from "styled-components";
import { useNavigate } from "react-router";
import { useState } from "react";
export const LoginComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const user = {
      email,
      password,
    };
    console.log("loggin in:", user);
    localStorage.setItem("token", "mock-jwt-token");
    navigate("/chat");
  };

  return (
    <LoginWrapper>
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
  background-color: #00e5fa;
`;
