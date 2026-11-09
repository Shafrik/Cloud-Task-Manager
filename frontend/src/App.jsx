import { useCallback, useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import TaskForm from "./components/TaskForm.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Tasks from "./pages/Tasks.jsx";
import { completeTask, createTask, deleteTask, getCurrentUser, getStats, getTasks, signIn, signOut, signUp, updateTask } from "./lib/api.js";

const initialStats = { total: 0, completed: 0, pending: 0, in_progress: 0, completion_percentage: 0 };

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [stats, setStats] = useState(initialStats);
  const [filters, setFilters] = useState({ search: "", status: "", priority: "" });
  const [modalTask, setModalTask] = useState(undefined);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchTimer = useRef(null);

  const refreshDashboard = useCallback(async () => {
    const [allTasks, taskStats] = await Promise.all([getTasks(), getStats()]);
    setRecentTasks(allTasks);
    setStats(taskStats);
  }, []);

  const refreshList = useCallback(async (nextFilters = filters) => {
    const data = await getTasks(nextFilters);
    setTasks(data);
  }, [filters]);

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((currentUser) => { if (active) setUser(currentUser); })
      .catch((requestError) => {
        if (active && requestError.status !== 401) setError(requestError.message);
      })
      .finally(() => { if (active) setAuthLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    setLoading(true);
    Promise.all([getTasks(), getStats()])
      .then(([allTasks, taskStats]) => {
        if (!active) return;
        setTasks(allTasks);
        setRecentTasks(allTasks);
        setStats(taskStats);
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.status === 401) setUser(null);
        else setError(requestError.message);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (page !== "tasks") return undefined;
    setLoading(true);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      refreshList(filters)
        .catch((requestError) => setError(requestError.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(searchTimer.current);
  }, [filters, page, refreshList]);

  async function refreshAfterMutation() {
    setError("");
    await Promise.all([refreshDashboard(), refreshList()]);
  }

  async function saveTask(taskData) {
    setSaving(true);
    setError("");
    try {
      if (modalTask) await updateTask(modalTask.id, taskData);
      else await createTask(taskData);
      setModalTask(undefined);
      await refreshAfterMutation();
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setSaving(false);
    }
  }

  async function removeTask(task) {
    if (!window.confirm(`Delete "${task.title}"? This can't be undone.`)) return;
    try {
      await deleteTask(task.id);
      await refreshAfterMutation();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function markComplete(task) {
    try {
      await completeTask(task.id);
      await refreshAfterMutation();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function navigate(nextPage) {
    setPage(nextPage);
    setSidebarOpen(false);
    setError("");
  }

  async function authenticate(credentials, mode) {
    if (mode === "register") {
      await signUp(credentials);
      return;
    }
    const authenticatedUser = await signIn(credentials);
    setUser(authenticatedUser);
    setError("");
  }

  async function logoutUser() {
    try {
      await signOut();
      setUser(null);
      setTasks([]);
      setRecentTasks([]);
      setStats(initialStats);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (authLoading) {
    return <main className="auth-loading"><span className="loading-spinner" />Getting your workspace ready...</main>;
  }

  if (!user) {
    return <><Login onAuthenticate={authenticate} />{error && <div className="error-banner" role="alert"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}</>;
  }

  return (
    <div className="app-shell">
      <Sidebar page={page} user={user} onLogout={logoutUser} onNavigate={navigate} open={sidebarOpen} onToggle={() => setSidebarOpen((open) => !open)} />
      <div className="main-area">
        {error && <div className="error-banner" role="alert"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}
        {page === "dashboard"
          ? <Dashboard user={user} stats={stats} tasks={recentTasks} onAddTask={() => setModalTask(null)} onEdit={(task) => setModalTask(task)} onDelete={removeTask} onComplete={markComplete} onViewTasks={() => navigate("tasks")} />
          : <Tasks tasks={tasks} filters={filters} onFiltersChange={setFilters} onAddTask={() => setModalTask(null)} onEdit={(task) => setModalTask(task)} onDelete={removeTask} onComplete={markComplete} loading={loading} />}
      </div>
      {modalTask !== undefined && <TaskForm task={modalTask} onClose={() => setModalTask(undefined)} onSave={saveTask} saving={saving} />}
    </div>
  );
}
