import styled from "@emotion/styled";
import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import { ChatPage } from "./Pages/Chat";
import { LoginComponent } from "./Pages/Login";
import { RegisterComponent } from "./Pages/Register";
import { SearchUsersPage } from "./Pages/SearchUsers";
import { GetFriendRequestsPage } from "./Pages/GetFriendRequests";
import { GetFriendsPage } from "./Pages/GetFriends";

function App() {
  return (
    <AppWrapper>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/register" element={<RegisterComponent />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/searchUsers" element={<SearchUsersPage />} />
          <Route
            path="/getFriendRequests"
            element={<GetFriendRequestsPage />}
          />
          <Route path="/getFriends" element={<GetFriendsPage />} />
        </Routes>
      </BrowserRouter>
    </AppWrapper>
  );
}

const AppWrapper = styled.div``;

export default App;
