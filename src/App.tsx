import { BrowserRouter, Route, Routes } from "react-router";
import styled from "styled-components";
import "./App.css";
import { ChatPage } from "./Pages/Chat";
import { LoginComponent } from "./Pages/Login";
import { RegisterComponent } from "./Pages/Register";
import { SearchUsersPage } from "./Pages/SearchUsers";

function App() {
  return (
    <AppWrapper>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/register" element={<RegisterComponent />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/searchUsers" element={<SearchUsersPage />} />
        </Routes>
      </BrowserRouter>
    </AppWrapper>
  );
}

const AppWrapper = styled.div``;

export default App;
