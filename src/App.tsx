import "./App.css";
import styled from "styled-components";
import { BrowserRouter, Routes, Route } from "react-router";
import { ProtectedRoute } from "./Components/ProtectedRoute";
import { ChatPage } from "./Pages/Chat";
import { LoginComponent } from "./Pages/Login";
import { RegisterComponent } from "./Pages/Register";

function App() {
  return (
    <AppWrapper>
      <BrowserRouter>
        <ChatPage />
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/register" element={<RegisterComponent />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppWrapper>
  );
}

const AppWrapper = styled.div``;

export default App;
