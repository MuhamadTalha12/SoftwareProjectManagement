import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./utils/context/AuthContext";
import { useContext, useEffect } from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProposalBuilder from "./pages/ProposalBuilder";
import MyProposals from "./pages/MyProposals";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

// New component to handle routes and URL param logic
function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");
    const user_id = searchParams.get("user_id");
    const user_name = searchParams.get("user_name");
    const user_email = searchParams.get("user_email");
    if (token && user_id && user_name && user_email) {
      localStorage.setItem("token", token);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("user_name", user_name);
      localStorage.setItem("user_email", user_email);
      // Remove search params from URL
      window.history.replaceState({}, document.title, location.pathname);
      navigate("/dashboard", { replace: true });
    }
  }, [location, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/proposals"
        element={
          <PrivateRoute>
            <MyProposals />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/proposal-builder"
        element={
          <PrivateRoute>
            <ProposalBuilder />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/proposal-builder/:id"
        element={
          <PrivateRoute>
            <ProposalBuilder />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
