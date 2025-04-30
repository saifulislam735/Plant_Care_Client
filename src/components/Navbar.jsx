"use client"

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMenu, FiX, FiShield } from "react-icons/fi";

const Navbar = () => {
  const { user, logout, isOfficer } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  // Common styles for NavLink (except Dashboard)
  const navLinkClass = ({ isActive }) =>
    `text-gray-700 font-medium transition-all duration-300 ${isActive
      ? "text-green-600 border-b-2 border-green-600"
      : "hover:text-green-600 hover:border-b-2 hover:border-green-400"
    }`;

  // Special styles for Dashboard NavLink
  const dashboardLinkClass = ({ isActive }) =>
    `inline-flex items-center text-gray-700 font-medium transition-all duration-300 ${isActive
      ? "text-green-800 border-b-2 border-green-800 bg-green-100 rounded-md px-2 py-1"
      : "hover:text-green-800 hover:bg-green-50 hover:rounded-md hover:px-2 hover:py-1"
    }`;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <NavLink to="/" className="text-2xl font-extrabold text-green-600">
            PlantCare
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/get-help" className={navLinkClass}>
              Get Help
            </NavLink>
            <NavLink to="/data-collect" className={navLinkClass}>
              Data Collect
            </NavLink>
            <NavLink to="/blogs" className={navLinkClass}>
              Blogs
            </NavLink>
            <NavLink
              to="/code"
              className={navLinkClass}
              onClick={toggleMenu}
            >
              Code
            </NavLink>
            {user ? (
              <>
                <NavLink to="/history" className={navLinkClass}>
                  History
                </NavLink>
                <NavLink to="/profile" className={navLinkClass}>
                  Profile
                </NavLink>
                {isOfficer() && (
                  <NavLink to="/dashboard" className={dashboardLinkClass}>
                    <FiShield className="mr-1 text-green-700" />
                    Dashboard
                  </NavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300"
                >
                  Register
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-green-600 focus:outline-none"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 mt-4 py-4 animate-slide-in">
            <div className="flex flex-col space-y-3 px-4">
              <NavLink
                to="/"
                className={navLinkClass}
                onClick={toggleMenu}
              >
                Home
              </NavLink>
              <NavLink
                to="/get-help"
                className={navLinkClass}
                onClick={toggleMenu}
              >
                Get Help
              </NavLink>
              <NavLink
                to="/data-collect"
                className={navLinkClass}
                onClick={toggleMenu}
              >
                Data Collect
              </NavLink>
              <NavLink
                to="/blogs"
                className={navLinkClass}
                onClick={toggleMenu}
              >
                Blogs
              </NavLink>
              <NavLink
                to="/code"
                className={navLinkClass}
                onClick={toggleMenu}
              >
                Code
              </NavLink>
              {user ? (
                <>
                  <NavLink
                    to="/history"
                    className={navLinkClass}
                    onClick={toggleMenu}
                  >
                    History
                  </NavLink>
                  <NavLink
                    to="/profile"
                    className={navLinkClass}
                    onClick={toggleMenu}
                  >
                    Profile
                  </NavLink>
                  {isOfficer() && (
                    <NavLink
                      to="/dashboard"
                      className={dashboardLinkClass}
                      onClick={toggleMenu}
                    >
                      <FiShield className="mr-1 text-green-700" />
                      Dashboard
                    </NavLink>
                  )}
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className={navLinkClass}
                    onClick={toggleMenu}
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300"
                    onClick={toggleMenu}
                  >
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;