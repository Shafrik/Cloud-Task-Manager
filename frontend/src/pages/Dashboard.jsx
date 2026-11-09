import { ArrowRight, Plus, Sparkles } from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import TaskList from "../components/TaskList.jsx";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard({ user, stats, tasks, onAddTask, onEdit, onDelete, onComplete, onViewTasks }) {
  const displayName = user.email.split("@")[0];
  return (
    <main className="page-content">
      <header className="welcome-row">
        <div><div className="date-kicker"><Sparkles size={14} /> YOUR PERSONAL WORKSPACE</div><h1>{getGreeting()}, {displayName} <span className="wave">✦</span></h1><p>Here’s what’s happening with your tasks today.</p></div>
        <button className="button button-primary add-task-button" onClick={onAddTask}><Plus size={17} /> New task</button>
      </header>

      <section className="stats-grid" aria-label="Task statistics">
        <StatCard label="Total tasks" value={stats.total ?? 0} tone="total" note="Across your workspace" />
        <StatCard label="Completed" value={stats.completed ?? 0} tone="completed" note={`${stats.completion_percentage ?? 0}% of all tasks`} change={`${stats.completion_percentage ?? 0}%`} />
        <StatCard label="In progress" value={stats.in_progress ?? 0} tone="progress" note="Keep the momentum" />
        <StatCard label="Pending" value={stats.pending ?? 0} tone="pending" note="Ready when you are" />
      </section>

      <section className="dashboard-lower">
        <div className="content-card recent-card">
          <div className="section-heading"><div><span className="eyebrow">YOUR WORK, AT A GLANCE</span><h2>Recent tasks</h2></div><button className="text-link" onClick={onViewTasks}>View all <ArrowRight size={15} /></button></div>
          <TaskList tasks={tasks.slice(0, 5)} onEdit={onEdit} onDelete={onDelete} onComplete={onComplete} compact />
        </div>
        <aside className="focus-card">
          <div className="focus-shape shape-one" /><div className="focus-shape shape-two" />
          <span className="focus-tag">A MOMENT OF FOCUS</span>
          <div className="focus-illustration"><div className="focus-orbit orbit-a" /><div className="focus-orbit orbit-b" /><div className="focus-star">✦</div><div className="focus-dot dot-a" /><div className="focus-dot dot-b" /><div className="focus-dot dot-c" /></div>
          <h3>One thing at a time.</h3>
          <p>Great things are done by a series of small things brought together.</p>
          <button onClick={onAddTask}>Plan your next win <ArrowRight size={15} /></button>
        </aside>
      </section>
      <footer className="page-footer">Made for a little more focus <span>✦</span></footer>
    </main>
  );
}
