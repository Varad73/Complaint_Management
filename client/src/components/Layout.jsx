import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { Toaster } from "react-hot-toast";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user, logout } = useAuth();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActiveLink = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="sm:hidden p-2 rounded-md hover:bg-blue-500 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-white text-blue-600 p-1 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold hidden sm:block">Complaint Management</h1>
              <h1 className="text-lg font-bold sm:hidden">CM</h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden sm:flex space-x-2">
              <Link className={`px-3 py-2 rounded-md transition-colors ${isActiveLink("/") ? "bg-blue-700" : "hover:bg-blue-500"}`} to="/">Home</Link>

              {user && (
                <>
                  <Link className={`px-3 py-2 rounded-md transition-colors ${isActiveLink("/new") ? "bg-blue-700" : "hover:bg-blue-500"}`} to="/new">New Complaint</Link>
                  <Link className={`px-3 py-2 rounded-md transition-colors ${isActiveLink("/my") ? "bg-blue-700" : "hover:bg-blue-500"}`} to="/my">My Complaints</Link>

                  {user.role === 'admin' && (
                    <>
                      <Link className={`px-3 py-2 rounded-md transition-colors ${isActiveLink("/admin") ? "bg-blue-700" : "hover:bg-blue-500"}`} to="/admin">Admin Dashboard</Link>
                      <Link className={`px-3 py-2 rounded-md transition-colors ${isActiveLink("/analytics") ? "bg-blue-700" : "hover:bg-blue-500"}`} to="/analytics">Analytics</Link>
                    </>
                  )}
                </>
              )}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden sm:flex items-center space-x-2">
              {user ? (
                <button onClick={handleLogout} className="px-3 py-2 rounded-md bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors">Logout</button>
              ) : (
                <>
                  <Link className={`px-3 py-2 rounded-md transition-colors ${isActiveLink("/login") ? "bg-blue-700" : "hover:bg-blue-500"}`} to="/login">Login</Link>
                  <Link className="px-3 py-2 rounded-md bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors" to="/signup">Sign Up</Link>
                </>
              )}
            </div>

            {/* Mobile Auth Button / User Info */}
            <div className="sm:hidden">
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium">{user.name?.charAt(0) || 'U'}</div>
                </div>
              ) : (
                <Link className="px-3 py-2 rounded-md bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors text-sm" to="/login">Login</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white">
              <div className="flex items-center space-x-2">
                <div className="bg-white text-blue-600 p-1 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold">Complaint Management</h2>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-md hover:bg-blue-500 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex flex-col h-full">
              {/* User Info */}
              {user && (
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name || 'User'}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.role === 'admin' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                <Link
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${isActiveLink("/") ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  to="/"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="font-medium">Home</span>
                </Link>

                {user && (
                  <>
                    <Link
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${isActiveLink("/new") ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" : "text-gray-700 hover:bg-gray-100"
                        }`}
                      to="/new"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="font-medium">New Complaint</span>
                    </Link>

                    <Link
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${isActiveLink("/my") ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" : "text-gray-700 hover:bg-gray-100"
                        }`}
                      to="/my"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-medium">My Complaints</span>
                    </Link>

                    {user.role === 'admin' && (
                      <>
                        <Link
                          className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${isActiveLink("/admin") ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" : "text-gray-700 hover:bg-gray-100"
                            }`}
                          to="/admin"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span className="font-medium">Admin Dashboard</span>
                        </Link>

                        <Link
                          className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${isActiveLink("/analytics") ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" : "text-gray-700 hover:bg-gray-100"
                            }`}
                          to="/analytics"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span className="font-medium">Analytics</span>
                        </Link>
                      </>
                    )}
                  </>
                )}

                {!user && (
                  <>
                    <Link
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${isActiveLink("/login") ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" : "text-gray-700 hover:bg-gray-100"
                        }`}
                      to="/login"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span className="font-medium">Login</span>
                    </Link>

                    <Link
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${isActiveLink("/signup") ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" : "text-gray-700 hover:bg-gray-100"
                        }`}
                      to="/signup"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span className="font-medium">Sign Up</span>
                    </Link>
                  </>
                )}
              </nav>

              {/* Logout Button */}
              {user && (
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content with top padding to account for fixed header */}
      <main className="flex-grow pt-20 overflow-hidden">
        {children}
      </main>
    </div>
  );
}