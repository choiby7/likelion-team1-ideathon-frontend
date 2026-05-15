import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import ChatPage from "./pages/ChatPage";
import AutobiographyPage from "./pages/AutobiographyPage";
import MemoirReaderPage from "./pages/MemoirReaderPage";
import OnboardingPage from "./pages/OnboardingPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/onboarding" replace />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/home" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/autobiography" element={<AutobiographyPage />} />
        <Route path="/autobiography/:id" element={<MemoirReaderPage />} />
        <Route path="/help" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
