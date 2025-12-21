import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../utils/context/AuthContext";
import { Sparkles } from "lucide-react";

const navLinks = [
  { label: "Volvox", key: "volvox", selected: true },
  { label: "Kick Start", key: "kickstart" },
  { label: "Innoscope", key: "innoscope" },
  { label: "Smart Search", key: "smart_search" },
  { label: "Dashboard", key: "dashboard" },
];

function getAuthSessionData() {
  let token = localStorage.getItem("token") || "";
  let userName = localStorage.getItem("user_name") || "";
  let userEmail = localStorage.getItem("user_email") || "";
  let userId = localStorage.getItem("user_id") || "";
  return { token, userName, userEmail, userId };
}

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const openUrl = (key) => {
    let baseUrlEnv = "";
    if (key === "dashboard") {
      navigate("/dashboard");
      return;
    }
    if (key === "innoscope") {
      baseUrlEnv = import.meta.env.VITE_INNOSCOPE_URL || "";
    } else if (key === "smart_search") {
      baseUrlEnv = import.meta.env.VITE_SMART_SEARCH_URL || "";
    } else if (key === "volvox") {
      baseUrlEnv = import.meta.env.VITE_VOLVOX_URL || "";
    }
    const { token, userName, userEmail, userId } = getAuthSessionData();
    if (!baseUrlEnv) return;
    const url = new URL(baseUrlEnv);
    url.searchParams.set("token", token);
    url.searchParams.set("user_name", userName);
    url.searchParams.set("user_email", userEmail);
    url.searchParams.set("user_id", userId);
    window.open(url.toString(), "_blank");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  function handleGetStarted() {
    const LOGOUT_URL = import.meta.env.VITE_LOGOUT_URL + "/workflows" || "";
    window.location.href = LOGOUT_URL;
  }

  function handleBackToDashboard() {
    const DASHBOARD_URL = import.meta.env.VITE_LOGOUT_URL || "";
    window.location.href = DASHBOARD_URL;
  }

  return (
    <header className="border-b border-zinc-800/50 backdrop-blur-sm sticky top-0 z-50 bg-white/80 dark:bg-transparent transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg blur-md opacity-75"></div>
            <div className="relative bg-black dark:bg-black px-3 py-2 rounded-lg border border-purple-500/50">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <h1 className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            idealForge AI
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isSelected = link.key === "kickstart";
            return (
              <button
                key={link.label}
                onClick={() => openUrl(link.key)}
                className={`transition-colors px-4 py-2 rounded-lg font-medium ${
                  isSelected
                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-extrabold shadow-xl border-2 border-purple-500/80 scale-105 ring-2 ring-purple-400/40 dark:ring-purple-400/60 drop-shadow-lg  outline-white dark:outline-black"
                    : "text-zinc-700 dark:text-zinc-400 hover:text-white dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
                style={
                  isSelected
                    ? {
                        color: "#fff",
                        textShadow: "0 2px 8px rgba(0,0,0,0.25), 0 0 2px #fff",
                        letterSpacing: "0.03em",
                      }
                    : {}
                }
              >
                {link.label}
              </button>
            );
          })}
          <button
            onClick={handleGetStarted}
            className="px-5 py-2 rounded-lg font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 shadow-lg transition-all hover:scale-105"
          >
            Get Started
          </button>
          <button
            onClick={handleBackToDashboard}
            className="px-5 py-2 rounded-lg font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 shadow-lg transition-all hover:scale-105"
          >
            Back
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
