import logo from "../assets/images/logo.png";
import { Link } from "react-router-dom";
const Navbar = () => {
  const navlinks = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#features", label: "Features" },
    { href: "#contact", label: "Contact" },
  ];
  return (
    <nav className="fixed h-13 top-0 left-0 right-0 bg-white/90 backdrop-blur-sm z-50 border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="w-full container mx-auto flex items-center justify-between px-4  sm:px-6 lg:px-8 md:h-20 h-16">
        {/* Logo */}
        <div className="flex items-center gap-1 cursor-pointer">
          <img src={logo} alt="Logo" className="w-20 h-20 rounded-full" />
        </div>
        {/* desktop nav-items */}
        <div className="hidden md:flex items-center space-x-6">
          {navlinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-gray-700 hover:text-blue-500 transition-colors duration-300 font-medium mx-4"
            >
              {link.label}
            </a>
          ))}
        </div>
        {/* Login / Signup */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/login"
            className="px-4 py-2 text-white bg-blue-600  rounded-md hover:bg-blue-700 transition-all duration-300 hover:shadow-md font-medium"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 text-white bg-green-600  rounded-md hover:bg-green-700 transition-all duration-300 hover:shadow-md font-medium"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
