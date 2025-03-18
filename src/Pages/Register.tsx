import { useState } from "react";
import { useNavigate } from "react-router";
import styled from "styled-components";
import { Loading } from "../Components/Loading";
import { useRegister } from "../Query/QueryHooks";

export const RegisterComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUserName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const navigate = useNavigate();
  const { mutate: registerUser, isPending: registerPending } = useRegister();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Passwords do not match!");
    registerUser(
      {
        email,
        password,
        username,
        displayName,
      },
      {
        onError: (error) => {
          console.error("Registration error:", error);
          alert("Registration failed. Please try again.");
        },
        onSuccess: () => {
          alert("Registration successful!");
          navigate("/chat");
        },
      }
    );
  };

  return (
    <RegisterWrapper>
      {registerPending && <Loading animation="pulse" />}
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
    </RegisterWrapper>
  );
};

const RegisterWrapper = styled.div`
  width: 50vw;
  height: 50vh;
  margin: auto;
  background-color: #00e5fa;
  display: flex;
  justify-content: center;
  align-items: center;
`;
