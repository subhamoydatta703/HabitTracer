import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { client } from "../api/client";
import { todayIn } from "../api/date";
import type { CheckIn, DashboardHabit } from "../api/types";
import { useAuth } from "../context/AuthContext";

export default function HabitDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const timezone = user?.timezone ?? "UTC";

  const [habit, setHabit] = useState<DashboardHabit | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [backfill, setBackfill] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [dash, history] = await Promise.all([
        client.get<{ habits: DashboardHabit[] }>("/dashboard"),
        client.get<{ checkIns: CheckIn[] }>(`/habits/${id}/check-ins`),
      ]);
      const found = dash.data.habits.find((h) => h.id === id);
      setHabit(found ?? null);
      setCheckIns(history.data.checkIns);
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Could not load habit");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function checkInToday() {
    setErr("");
    setMsg("");
    try {
      await client.post(`/habits/${id}/check-ins`, { date: todayIn(timezone) });
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Check-in failed");
    }
  }

  async function backfillSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!backfill) return;
    try {
      await client.post(`/habits/${id}/check-ins`, { date: backfill });
      setBackfill("");
      await load();
      setMsg("Backfilled!");
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Backfill failed");
    }
  }

  async function removeCheckIn(date: string) {
    try {
      await client.delete(`/habits/${id}/check-ins/${date}`);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Could not delete check-in");
    }
  }

  if (loading) return <p className="muted">Loading…</p>;
  if (!habit) return <p className="alert">Habit not found. <Link to="/">Back to dashboard</Link></p>;

  return (
    <div>
      <p><Link to="/">← Dashboard</Link></p>
      <div className="card">
        <h1>{habit.name}</h1>
        {habit.description && <p className="muted">{habit.description}</p>}
        <div className="stats">
          <div><strong>{habit.currentStreak}</strong><span>current</span></div>
          <div><strong>{habit.longestStreak}</strong><span>best</span></div>
          <div><strong>{habit.checkInCount}</strong><span>total</span></div>
        </div>
        <div className="habit-actions">
          <button className="btn small primary" disabled={habit.todayCheckedIn} onClick={checkInToday}>
            {habit.todayCheckedIn ? "Checked today ✓" : "Check in today"}
          </button>
        </div>
      </div>

      {err && <div className="alert">{err}</div>}
      {msg && <div className="notice">{msg}</div>}

      <form className="card" onSubmit={backfillSubmit}>
        <h3>Backfill a missed date</h3>
        <div className="row">
          <input type="date" max={todayIn(timezone)} value={backfill} onChange={(e) => setBackfill(e.target.value)} />
          <button className="btn primary" type="submit">Backfill</button>
        </div>
      </form>

      <div className="card">
        <h3>Check-in history</h3>
        {checkIns.length === 0 ? (
          <p className="muted">No check-ins yet.</p>
        ) : (
          <ul className="history">
            {checkIns.map((c) => (
              <li key={c.id}>
                <span>{c.date}</span>
                <button className="btn small ghost" onClick={() => removeCheckIn(c.date)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}