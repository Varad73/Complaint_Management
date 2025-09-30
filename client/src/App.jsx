import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NewComplaint from "./pages/NewComplaint";
import MyComplaints from "./pages/MyComplaints";
import AdminDashboard from "./pages/AdminDashboard"; // 1. Import the new page
import { useAuth } from "./AuthContext"; // 2. We'll create this context in the next step

// 3. Create a component to protect the admin route
function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading session...</div>; // Or a spinner
  }

  // If there is a user and their role is 'admin', allow access.
  // Otherwise, redirect them to the home page.
  return user && user.role === 'admin' ? children : <Navigate to="/" />;
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* We can also protect these routes so only logged-in users can see them */}
          <Route path="/new" element={<NewComplaint />} />
          <Route path="/my" element={<MyComplaints />} />

          {/* 4. Add the new protected route */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;