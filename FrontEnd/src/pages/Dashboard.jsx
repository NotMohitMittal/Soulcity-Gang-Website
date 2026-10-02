import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Shield, ChevronDown, User, Settings, LogOut } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";

import { motion } from "framer-motion";

const Dashboard = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const navigate = useNavigate();

  const { authUser, logoutMember } = useAuthStore();

  const navLinks = [
    { name: "Home", path: "/dashboard/home" },
    { name: "Inventory", path: "/dashboard/inventory" },
    { name: "Garage", path: "/dashboard/garage" },
    { name: "Members", path: "/dashboard/members" },
  ];

  // Placeholder actions for dropdown methods
  const handleProfileClick = () => console.log("Navigate to Profile");
  const handleLogout = () => {
    logoutMember();
    navigate("/");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#1a1a1a] text-white z-50 relative">
      {/* 3-Part Navbar */}
      <nav className="flex justify-between items-center px-8 pt-3 border-b border-white/10 bg-black/50 backdrop-blur-md relative z-50">
        {/* // STYLING THE LOGO OF THE PAGE */}
        {/* LEFT: Logo & Company Name */}
        <motion.div
          className="flex items-center gap-5 cursor-pointer group p-1.5 -ml-1.5 rounded-xl hover:bg-white/9 transition-colors duration-300"
          onClick={handleLogoClick}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.div
            className="w-10 h-10 bg-[#de425b] rounded-xl flex items-center justify-center shadow-lg"
            variants={{
              hover: { scale: 1.1, rotate: 8, backgroundColor: "#c83850" },
              tap: { scale: 0.9, rotate: -5 },
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Shield size={22} className="text-white" />
          </motion.div>

          <div className="flex flex-col">
            <motion.span
              className="font-extrabold text-lg tracking-widest uppercase leading-none text-white"
              variants={{
                hover: { color: "#de425b" },
              }}
            >
              Red Network
            </motion.span>
            <motion.span
              className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1"
              variants={{
                hover: { letterSpacing: "0.25em", color: "#d1d5db" },
              }}
            >
              Soulcity
            </motion.span>
          </div>
        </motion.div>

        {/* MIDDLE: Navigation Items */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-bold transition-colors ${
                  isActive ? "text-[#de425b]" : "text-gray-300 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
        {/* RIGHT: User Profile & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:bg-white/5 p-1.5 pr-3 rounded-2xl transition-colors border border-transparent hover:border-white/10"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-[#de425b]">
              <User size={18} className="text-gray-300" />
            </div>
            {/* User Details */}
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold leading-none text-white">{authUser.user_name}</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">{authUser.gang_role}</p>
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-black border border-white/10 rounded-2xl shadow-2xl py-2 flex flex-col z-50">
              <div className="px-4 py-3 border-b border-white/5 mb-1">
                <p className="text-sm text-white font-bold">{authUser.user_name}</p>
                <p className="text-xs text-gray-400">{authUser.user_email}</p>
              </div>

              <button
                onClick={handleProfileClick}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/25 transition-colors"
              >
                <User size={16} /> My Profile
              </button>

              <button className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/25 transition-colors">
                <Settings size={16} /> Gang Settings
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[#de425b] hover:bg-[#de425b]/20 transition-colors mt-1 border-t border-white/5"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Dynamic Content Area */}
      <div className="flex-1 p-8 overflow-y-auto bg-[#0a0a0a]/40 bg-[url('/images/dashboardBG.png')] bg-cover bg-center bg-no-repeat bg-blend-multiply">
        <Outlet />
      </div>

      {/* Invisible overlay to close dropdown when clicking outside */}
      {isDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />}
    </div>
  );
};

export default Dashboard;
