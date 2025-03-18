import { BrowserRouter, Route, Routes } from "react-router";
import styled from "styled-components";
import "./App.css";
import { ChatPage } from "./Pages/Chat";
import { LoginComponent } from "./Pages/Login";
import { RegisterComponent } from "./Pages/Register";

function App() {
  return (
    <AppWrapper>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/register" element={<RegisterComponent />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </BrowserRouter>
    </AppWrapper>
  );
}

const AppWrapper = styled.div``;

export default App;
