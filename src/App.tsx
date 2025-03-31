import styled from "@emotion/styled";
import { Navigate, Route, Routes } from "react-router";
import "./App.css";
import { ChatPage } from "./Pages/Chat";
import { LoginComponent } from "./Pages/Login";
import { RegisterComponent } from "./Pages/Register";
import { SearchUsersPage } from "./Pages/SearchUsers";
import { GetFriendRequestsPage } from "./Pages/GetFriendRequests";
import { GetFriendsPage } from "./Pages/GetFriends";
import { useCheckUpdates } from "./Query/QueryHooks";
import { useEffect } from "react";
import { queryClient } from "./main";

function App() {
  const { data: checkUpdatesData } = useCheckUpdates({
    queryKey: ["check"],
    refetchInterval: 1000, // 1 second
  });

  useEffect(() => {
    if (checkUpdatesData?.hasNewItems) {
      queryClient.invalidateQueries();
    }
  }, [checkUpdatesData]);

  return (
    <AppWrapper>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/register" element={<RegisterComponent />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/searchUsers" element={<SearchUsersPage />} />
        <Route path="/getFriendRequests" element={<GetFriendRequestsPage />} />
        <Route path="/getFriends" element={<GetFriendsPage />} />
        {/* path for unknown paths */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AppWrapper>
  );
}

const AppWrapper = styled.div``;

export default App;
