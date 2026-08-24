import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { client } from "../api/client";
import { todayIn } from "../api/date";
import type { DashboardHabit } from "../api/types";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<DashboardHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const timezone = user?.timezone ?? "UTC";

  const load = useCallback(async () => {
    try {
      const { data } = await client.get<{ habits: DashboardHabit[] }>("/dashboard");
      setHabits(data.habits);
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createHabit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!name.trim()) return;
    try {
      await client.post("/habits", { name, description });
      setName("");
      setDescription("");
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Could not create habit");
    }
  }

  async function checkInToday(id: string) {
    setErr("");
    setMsg("");
    try {
      await client.post(`/habits/${id}/check-ins`, { date: todayIn(timezone) });
      await load();
      setMsg("Checked in!");
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Check-in failed");
    }
  }

  async function removeHabit(id: string) {
    if (!confirm("Delete this habit and all its check-ins?")) return;
    try {
      await client.delete(`/habits/${id}`);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Delete failed");
    }
  }

  return (
    <div>
      <h1>Your habits</h1>

      <form className="card" onSubmit={createHabit}>
        <div className="row">
          <input placeholder="New habit name" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <button className="btn primary" type="submit">Add</button>
        </div>
      </form>

      {err && <div className="alert">{err}</div>}
      {msg && <div className="notice">{msg}</div>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : habits.length === 0 ? (
        <div className="card empty">
          <p>No habits yet. Create your first habit above to start tracking.</p>
        </div>
      ) : (
        <div className="grid">
          {habits.map((h) => (
            <div className="card habit" key={h.id}>
              <div className="habit-top">
                <Link to={`/habits/${h.id}`} className="habit-name">{h.name}</Link>
                <span className={h.todayCheckedIn ? "badge done" : "badge"}>
                  {h.todayCheckedIn ? "✓ Today" : "Not today"}
                </span>
              </div>
              {h.description && <p className="muted">{h.description}</p>}
              <div className="stats">
                <div><strong>{h.currentStreak}</strong><span>current</span></div>
                <div><strong>{h.longestStreak}</strong><span>best</span></div>
                <div><strong>{h.checkInCount}</strong><span>total</span></div>
              </div>
              <div className="habit-actions">
                <button className="btn small primary" disabled={h.todayCheckedIn} onClick={() => checkInToday(h.id)}>
                  {h.todayCheckedIn ? "Checked" : "Check in today"}
                </button>
                <Link className="btn small" to={`/habits/${h.id}`}>Backfill / history</Link>
                <button className="btn small danger" onClick={() => removeHabit(h.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
