import React from "react";
import { Outlet, Link } from "react-router-dom";

const DashboardNavigator = () => {
  const navLinks = [
    { name: "Home", path: "/dashboard/home" },
    { name: "Vault", path: "/dashboard/vault" },
    { name: "Garage", path: "/dashboard/garage" },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#1a1a1a] text-white z-50 relative">
      {/* Dashboard Specific Navbar */}
      <nav className="flex space-x-6 p-6 border-b border-white/10 bg-black/50 backdrop-blur-md">
        {navLinks.map((link) => (
          <Link key={link.name} to={link.path} className="font-bold hover:text-[#de425b] transition-colors">
            {link.name}
          </Link>
        ))}
      </nav>

      {/* Dynamic Content Area: The Outlet swaps content based on the URL */}
      <div className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardNavigator;