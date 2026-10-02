import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Our Members", path: "/home/members" },
    { name: "Achievements", path: "/achievements" },
    { name: "About", path: "/about" },
  ];


  return (
    <nav className="flex space-x-8 px-8 py-3 bg-white shadow-sm [clip-path:polygon(0_0,100%_0,95%_100%,5%_100%)]">
      {navLinks.map((link) => {
        const isActive = location.pathname === link.path;
        return (
          <Link
            to={link.path}
            key={link.name}
            className={`text-sm font-medium px-6 py-2.5 rounded-full transition-all duration-300 ${
              isActive ? "bg-[#de425b] text-[#fdfbf6] shadow-sm" : "text-gray-700 bg-transparent hover:text-gray-900"
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
};

export default Navbar;
