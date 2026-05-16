import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import ChatPage from "./pages/ChatPage";
import AutobiographyPage from "./pages/AutobiographyPage";
import MemoirReaderPage from "./pages/MemoirReaderPage";
import OnboardingPage from "./pages/OnboardingPage";
import MicPermissionPage from "./pages/MicPermissionPage";
import HomePage from "./pages/HomePage";
import HelpPage from "./pages/HelpPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/onboarding" replace />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/mic-permission" element={<MicPermissionPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/autobiography" element={<AutobiographyPage />} />
        <Route path="/autobiography/:id" element={<MemoirReaderPage />} />
        <Route path="/help" element={<HelpPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
