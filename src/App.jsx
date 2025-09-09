import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Offers from "./pages/Offers.jsx";
import Profile from "./pages/Profile.jsx";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { AppStateProvider } from "./context/AppState.jsx";

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppStateProvider>
          <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/profile" element={<Profile />} />
              <Route
                path="/dashboard"
                element={
                  <Protected>
                    <Dashboard />
                  </Protected>
                }
              />
            </Routes>
          </div>
        </AppStateProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
