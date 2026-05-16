import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatPage from "./pages/ChatPage";
import AutobiographyPage from "./pages/AutobiographyPage";
import MemoirReaderPage from "./pages/MemoirReaderPage";
import MemoirContinuePage from "./pages/MemoirContinuePage";
import OnboardingPage from "./pages/OnboardingPage";
import MicPermissionPage from "./pages/MicPermissionPage";
import HomePage from "./pages/HomePage";
import HelpPage from "./pages/HelpPage";
import SettingsPage from "./pages/SettingsPage";
import NarratorSettingsPage from "./pages/NarratorSettingsPage";
import LoginPage from "./pages/LoginPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Protected */}
          <Route
            path="/mic-permission"
            element={
              <ProtectedRoute>
                <MicPermissionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/autobiography"
            element={
              <ProtectedRoute>
                <AutobiographyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/autobiography/:id"
            element={
              <ProtectedRoute>
                <MemoirReaderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/autobiography/:id/continue"
            element={
              <ProtectedRoute>
                <MemoirContinuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <HelpPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/narrator"
            element={
              <ProtectedRoute>
                <NarratorSettingsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
