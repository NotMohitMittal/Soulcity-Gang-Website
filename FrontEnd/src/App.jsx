import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import About from "./pages/About.jsx";
import Frame from "./components/Frame.jsx";
import HomePage from "./components/HomePage";
import Dashboard from "./pages/Dashboard.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import Inventory from "./pages/Inventory.jsx";
import GangMembers from "./pages/GangMembers.jsx";
import { useEffect } from "react";
import useAuthStore from "./store/useAuthStore.js";
import PublicRoutes from "./components/PublicRoutes.jsx";
import ProtectedRoutes from "./components/ProtectedRoutes.jsx";
import HomeMember from "./pages/HomeMember.jsx";
import Garage from "./pages/Garage.jsx";
import MyProfile from "./pages/MyProfile.jsx";
import Streams from "./pages/Streams.jsx";

const App = () => {
  const location = useLocation();
  const isDashboard = location.pathname.toLowerCase().startsWith("/dashboard");
  const isStreamPage = location.pathname.toLowerCase().startsWith("/streams");

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
            background: "rgba(0, 0, 0, 0.7)", 
            backdropFilter: "blur(12px)", 
            border: "1px solid rgba(222, 66, 91, 0.4)", 
            borderLeft: "4px solid #de425b", 
            color: "#ffffff", 
            padding: "16px 24px",
            borderRadius: "1rem",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
            fontSize: "14px",
            fontWeight: "500",
            letterSpacing: "0.025em",
          },
          success: {
            iconTheme: {
              primary: "#de425b", 
              secondary: "#ffffff", 
            },
          },
          error: {
            iconTheme: {
              primary: "#ff3333", 
              secondary: "#ffffff",
            },
          },
        }}
      />

      <Routes>
        {/* --- ROUTES ACCESSIBLE TO EVERYONE --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/home/members" element={<HomeMember />} />
        
        {/* Streams Route moved here and explicitly set with the leading slash */}
        <Route path="/streams" element={<Streams />} />

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
            <Route path="profile" element={<MyProfile />} />
          </Route>
        </Route>
      </Routes>

      {/* FIXED LOGIC: Show Frame ONLY if it's NOT the Dashboard AND NOT the Streams page */}
      {!isDashboard && !isStreamPage && <Frame />}
    </div>
  );
};

export default App;