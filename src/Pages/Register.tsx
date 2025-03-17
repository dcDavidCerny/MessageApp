import styled from "styled-components";
import { useNavigate } from "react-router";
import { useState } from "react";

export const RegisterComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Passwords do not match!");
    console.log("Registering:", { email, password });
    navigate("/login");
  };

  return (
    <RegisterWrapper>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
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
  background-color: #00e5fa;
`;
