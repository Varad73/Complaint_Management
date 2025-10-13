import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { Toaster } from "react-hot-toast";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const { user, logout } = useAuth(); 

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  
  const isActiveLink = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-center" reverseOrder={false} />

      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-white text-blue-600 p-1 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h1 className="text-xl font-bold">Complaint Management</h1>
            </Link>
            
            <nav className="hidden md:flex space-x-2">
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
            
            <div className="hidden md:flex items-center space-x-2">
              {user ? (
                <button onClick={handleLogout} className="px-3 py-2 rounded-md bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors">Logout</button>
              ) : (
                <>
                  <Link className={`px-3 py-2 rounded-md transition-colors ${isActiveLink("/login") ? "bg-blue-700" : "hover:bg-blue-500"}`} to="/login">Login</Link>
                  <Link className="px-3 py-2 rounded-md bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors" to="/signup">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

