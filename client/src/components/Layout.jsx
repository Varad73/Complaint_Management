import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate(); // Hook for navigation
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track auth status

  // This effect now also checks the login status whenever the route changes
  useEffect(() => {
    setIsMenuOpen(false);
    // Check if the isLoggedIn flag is set in localStorage
    const userIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(userIsLoggedIn);
  }, [location]);

  // Function to handle user logout
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn"); // Remove the flag
    setIsLoggedIn(false); // Update state
    navigate("/login"); // Redirect to the login page
  };
  
  // Check if a link is active
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-white text-blue-600 p-1 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold">Complaint Management</h1>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              <Link 
                className={`px-3 py-2 rounded-md transition-colors ${isActiveLink("/") ? "bg-blue-700" : "hover:bg-blue-500"}`} 
                to="/"
              >
                Home
              </Link>
              {isLoggedIn && (
                <>
                  <Link 
                    className={`px-3 py-2 rounded-md transition-colors ${isActiveLink("/new") ? "bg-blue-700" : "hover:bg-blue-500"}`} 
                    to="/new"
                  >
                    New Complaint
                  </Link>
                  <Link 
                    className={`px-3 py-2 rounded-md transition-colors ${isActiveLink("/my") ? "bg-blue-700" : "hover:bg-blue-500"}`} 
                    to="/my"
                  >
                    My Complaints
                  </Link>
                </>
              )}
            </nav>
            
            {/* Auth Links - Desktop */}
            <div className="hidden md:flex items-center space-x-2">
              {isLoggedIn ? (
                // If logged in, show Logout button
                <button 
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                >
                  Logout
                </button>
              ) : (
                // If not logged in, show Login and Sign Up links
                <>
                  <Link 
                    className={`px-3 py-2 rounded-md transition-colors ${isActiveLink("/login") ? "bg-blue-700" : "hover:bg-blue-500"}`} 
                    to="/login"
                  >
                    Login
                  </Link>
                  <Link 
                    className="px-3 py-2 rounded-md bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors" 
                    to="/signup"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-2 space-y-1">
              <Link 
                className={`block px-3 py-2 rounded-md transition-colors ${isActiveLink("/") ? "bg-blue-700" : "hover:bg-blue-500"}`} 
                to="/"
              >
                Home
              </Link>
              {isLoggedIn && (
                <>
                  <Link 
                    className={`block px-3 py-2 rounded-md transition-colors ${isActiveLink("/new") ? "bg-blue-700" : "hover:bg-blue-500"}`} 
                    to="/new"
                  >
                    New Complaint
                  </Link>
                  <Link 
                    className={`block px-3 py-2 rounded-md transition-colors ${isActiveLink("/my") ? "bg-blue-700" : "hover:bg-blue-500"}`} 
                    to="/my"
                  >
                    My Complaints
                  </Link>
                </>
              )}
              <div className="pt-2 border-t border-blue-500 mt-2">
                {isLoggedIn ? (
                  // If logged in, show Logout button for mobile
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-3 py-2 rounded-md bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors mt-2" 
                  >
                    Logout
                  </button>
                ) : (
                  // If not logged in, show Login and Sign Up links for mobile
                  <>
                    <Link 
                      className={`block px-3 py-2 rounded-md transition-colors ${isActiveLink("/login") ? "bg-blue-700" : "hover:bg-blue-500"}`} 
                      to="/login"
                    >
                      Login
                    </Link>
                    <Link 
                      className="block px-3 py-2 rounded-md bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors mt-2" 
                      to="/signup"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-semibold">Complaint Management System</h2>
              <p className="text-gray-400 mt-1">Resolving issues efficiently and effectively</p>
            </div>
            
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Privacy Policy">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Terms of Service">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Contact">
                Contact
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Complaint Management App. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}