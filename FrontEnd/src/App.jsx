import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import About from "./pages/About.jsx";
import Frame from "./components/Frame.jsx";
import HomePage from "./components/HomePage";
import Dashboard from "./pages/Dashboard.jsx";
import Achievements from "./pages/Achievements.jsx";
import RegistrationPage from "./pages/RegistrationLogin.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import Inventory from "./pages/Inventory.jsx";
import Garage from "./pages/Garage.jsx";
import GangMembers from "./pages/GangMembers.jsx";
import { useEffect } from "react";
import useAuthStore from "./store/useAuthStore.js";
import PublicRoutes from "./components/PublicRoutes.jsx";
import ProtectedRoutes from "./components/ProtectedRoutes.jsx";
import HomeMember from "./pages/HomeMember.jsx";

const App = () => {
  const location = useLocation();
  const isDashboard = location.pathname.toLowerCase().startsWith("/dashboard");

  const { checkAuth, authUser, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#1a1a1a] text-white">
        {/* Themed loading screen */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#de425b] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-bold tracking-widest text-sm uppercase animate-pulse">
            Verifying Credentials...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(0, 0, 0, 0.7)", // Transparent black background
            backdropFilter: "blur(12px)", // Glassmorphism blur
            border: "1px solid rgba(222, 66, 91, 0.4)", // Subtle crimson red border
            borderLeft: "4px solid #de425b", // Bold red accent on the left
            color: "#ffffff", // White text
            padding: "16px 24px",
            borderRadius: "1rem",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
            fontSize: "14px",
            fontWeight: "500",
            letterSpacing: "0.025em",
          },
          success: {
            iconTheme: {
              primary: "#de425b", // Crimson red success icon
              secondary: "#ffffff", // White checkmark inside the icon
            },
          },
          error: {
            iconTheme: {
              primary: "#ff3333", // Brighter red for errors
              secondary: "#ffffff",
            },
          },
        }}
      />

      <Routes>
        {/* --- ROUTES ACCESSIBLE TO EVERYONE --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/home/members" element={<HomeMember />} />

        {/* --- PUBLIC ROUTES (Only for non-logged-in users) --- */}
        <Route element={<PublicRoutes />} />

        {/* --- PROTECTED ROUTES (Only for logged-in gang members) --- */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<DashboardHome />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="garage" element={<Garage />} />
            <Route path="members" element={<GangMembers />} />
          </Route>
        </Route>
      </Routes>

      {!isDashboard && <Frame />}
    </div>
  );
};

export default App;
