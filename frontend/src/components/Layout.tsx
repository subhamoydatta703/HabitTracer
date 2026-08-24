import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">◼ HabitTracker</Link>
        <nav>
          <Link to="/">Dashboard</Link>
          {user && <span className="email">{user.email} · {user.timezone}</span>}
          <button
            className="btn ghost"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Logout
          </button>
        </nav>
      </header>
      <main className="container"><Outlet /></main>
    </div>
  );
}
