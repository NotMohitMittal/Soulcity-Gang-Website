import React, { useEffect, useState } from "react";
import Thumbnail from "./Thumbnail";
import { ArrowRight, TrendingUp } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import RegistrationPage from "../pages/RegistrationLogin";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";

const HomePage = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.requireLogin) {
      setIsRegistrationOpen(true);
      toast.success("Login is required")
      // Clear the state so it doesn't pop up again on refresh / back-nav
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // 2. Update the click handler to toggle state instead of navigating
  const handleSubmitEvent = () => {
    if (authUser) {
      toast.success(`Welcome, ${authUser.user_name}`);
      navigate("/dashboard");
      return; // don't fall through to opening the modal
    }
    setIsRegistrationOpen(true);
  };

  return (
    <div className="w-full h-full relative">
      {/* Background layer - Absolute bottom */}
      <div className="absolute inset-0 z-0">
        <img src="/images/background.jpg" alt="Background" className="w-full h-full object-cover" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 backdrop-blur-xl [-webkit-mask-image:radial-gradient(circle_at_bottom_right,black,transparent_70%)] mask-[radial-gradient(circle_at_bottom_right,black,transparent_70%)]" />
      </div>

      {/* Main Content Layer */}
      <div className="absolute inset-7 pt-24 p-6 z-20 pointer-events-none">
        {/* CENTER LEFT: Main Heading & Subtext */}
        <div className="absolute left-8 top-[20%] max-w-4xl pointer-events-auto text-white">
          <h1 className="text-8xl font-bold leading-tight mb-20 tracking-tight">
            RED NETWORK <br /> SOULCITY
          </h1>
          <p className="text-xl text-gray-300 font-medium mb-4 ml-30 max-w-md leading-relaxed">
            we maximize the potential of every gangs. From big events to exclusive deals, we're here to support their
            role-play journey.
            <br />
            <span className="text-gray-100 mt-1 block">#WMatters #lifeinsoulcity #RedNetwork</span>
          </p>
          <div className="flex items-center text-l font-bold tracking-widest uppercase mt-6">
            <span className="text-black mr-4 ml-30 text-extrabold">//</span> Let's show how the gang runs
          </div>
        </div>

        {/* BOTTOM LEFT: Action Buttons */}
        <div className="absolute inset-7 pt-24 p-6 z-20 pointer-events-none">
          <div className="absolute left-8 bottom-4 flex items-center space-x-6 pointer-events-auto">
            {/* 3. Button triggers the state change */}
            <button
              onClick={handleSubmitEvent}
              className="flex items-center justify-center bg-white text-gray-900 px-6 py-3 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform duration-300"
            >
              Get Started
              <ArrowRight size={18} className="ml-2 text-gray-500" />
            </button>
            <button className="flex items-center justify-center text-white font-medium text-sm bg-black rounded-full px-6 py-3 hover:text-gray-300 transition-colors duration-300 underline underline-offset-4">
              Learn More
            </button>
          </div>
        </div>

        {/* 4. Mount the panel inside HomePage and pass the props */}
        <RegistrationPage isOpen={isRegistrationOpen} onClose={() => setIsRegistrationOpen(false)} />

        {/* TOP RIGHT: Thumbnail Component */}
        <div className="absolute right-4 top-4 pointer-events-auto">
          <Thumbnail />
        </div>

        {/* BOTTOM RIGHT: Stats / Glassmorphism Div */}
        <div className="absolute right-4 bottom-4 pointer-events-auto bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-4xl w-80 shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-4xl text-black font-extrabold tracking-tight">20+</h3>
              <p className="text-xs text-shadow-black mt-1 font-medium tracking-wide">Gang Member's Journey</p>
            </div>
            <TrendingUp className="text-green-400" size={24} />
          </div>

          {/* Mock Avatars Stack */}
          <div className="flex -space-x-4">
            {["bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-400", "bg-purple-400"].map((color, idx) => (
              <div
                key={idx}
                className={`w-10 h-10 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-white ${color}`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;