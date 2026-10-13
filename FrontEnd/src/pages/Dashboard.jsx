import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Shield, ChevronDown, User, Settings, LogOut, Radio } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";

import { motion } from "framer-motion";
import useGarageStore from "@/store/useGarageStore";

const Dashboard = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUpdatingOnline, setIsUpdatingOnline] = useState(false);
  const location = useLocation();

  const navigate = useNavigate();

  const { authUser, logoutMember, toggleOnline } = useAuthStore();
  const { getPersonalGarage, personalGarage } = useGarageStore();

  const navLinks = [
    { name: "Home", path: "/dashboard/home" },
    { name: "Inventory", path: "/dashboard/inventory" },
    { name: "Garage", path: "/dashboard/garage" },
    { name: "Members", path: "/dashboard/members" },
    { name: "Streams", path: "/dashboard/streams" },
  ];

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate("/dashboard/profile");
  };

  const handlePersonalGarageClick = async () => {
    const loadingToast = toast.loading("Accessing personal garage intel...");
    try {
      const res = await getPersonalGarage();
      if (res?.success) {
        toast.dismiss(loadingToast);
        navigate("/dashboard/garage", {state: {defaultTab : "personal"}})
      } else {
        toast.error(res?.message || "Failed to locate vehicles", { id: loadingToast });
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error while accessing garage", { id: loadingToast });
    }
  };

  const handleLogout = () => {
    logoutMember();
    navigate("/");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleToggleOnline = async () => {
    if (isUpdatingOnline) return;
    setIsUpdatingOnline(true);

    try {
      const res = await toggleOnline();
      if (res?.success) {
        const status = res.user?.is_online ? "Online" : "Offline";
        toast.success(`Player status: ${status}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error toggling online state");
    } finally {
      setIsUpdatingOnline(false);
    }
  };

  const isOnline = Boolean(authUser?.is_online);

  return (
    <div className="w-full h-full flex flex-col bg-[#1a1a1a] text-white z-50 relative">
      {/* 3-Part Navbar */}
      <nav className="flex justify-between items-center px-8 py-3 border-b border-white/10 bg-black/50 backdrop-blur-md relative z-50">
        {/* LEFT: Logo & Company Name */}
        <motion.div
          className="flex items-center gap-5 cursor-pointer group p-1.5 -ml-1.5 rounded-xl hover:bg-white/10 transition-colors duration-300"
          onClick={handleLogoClick}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.div
            className="w-10 h-10 bg-[#FFFFFF] rounded-xl flex items-center justify-center shadow-lg overflow-hidden"
            variants={{
              hover: { scale: 1.1, rotate: 8, backgroundColor: "#FFFFFF" },
              tap: { scale: 0.9, rotate: -5 },
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <img src="/_logo.png" alt="Red Network Logo" className="w-full h-full object-contain scale-120" />
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

        {/* RIGHT: Online Toggle & User Profile */}
        <div className="flex items-center gap-4">
          {/* Radio Online Toggle */}
          {authUser && (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-3.5 py-1.5 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Radio size={15} className={isOnline ? "text-emerald-400 animate-pulse" : "text-gray-500"} />
                <span className="hidden sm:inline-block text-[11px] font-black uppercase tracking-wider text-gray-300">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isOnline}
                disabled={isUpdatingOnline}
                onClick={handleToggleOnline}
                className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-colors duration-300 focus:outline-none disabled:opacity-50 cursor-pointer ${
                  isOnline ? "bg-[#de425b]" : "bg-black/60 border border-white/10"
                }`}
                title={`Turn radio ${isOnline ? "offline" : "online"}`}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="bg-white w-4 h-4 rounded-full shadow-md"
                  style={{
                    marginLeft: isOnline ? "auto" : "0px",
                  }}
                />
              </button>
            </div>
          )}

          {/* User Profile & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 hover:bg-white/5 p-1.5 pr-3 rounded-2xl transition-colors border border-transparent hover:border-white/10"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-[#de425b]">
                {authUser?.profile_picture ? (
                  <img src={authUser.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={18} className="text-gray-300" />
                )}
              </div>
              {/* User Details */}
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold leading-none text-white">{authUser?.user_name}</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">{authUser?.gang_role}</p>
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
                  <p className="text-sm text-white font-bold">{authUser?.user_name}</p>
                  <p className="text-xs text-gray-400">{authUser?.user_email}</p>
                </div>

                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <User size={16} /> My Profile
                </button>

                <button
                  onClick={handlePersonalGarageClick}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Settings size={16} /> Personal Garage
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
        </div>
      </nav>

      {/* Dynamic Content Area */}
      <div className="flex-1 p-8 overflow-y-auto bg-[#0a0a0a]/40 bg-[url('/images/thumbnail.jpg')] bg-cover bg-center bg-no-repeat bg-blend-multiply">
        <Outlet />
      </div>

      {/* Invisible overlay to close dropdown when clicking outside */}
      {isDropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />}
    </div>
  );
};

export default Dashboard;
