import { Search, SlidersHorizontal, Plus } from "lucide-react";
import TaskList from "../components/TaskList.jsx";

export default function Tasks({ tasks, filters, onFiltersChange, onAddTask, onEdit, onDelete, onComplete, loading }) {
  function setFilter(name, value) {
    onFiltersChange((current) => ({ ...current, [name]: value }));
  }

  return (
    <main className="page-content tasks-page">
      <header className="welcome-row">
        <div><div className="date-kicker"><SlidersHorizontal size={14} /> YOUR WORKSPACE</div><h1>My tasks</h1><p>Keep all the important things moving forward.</p></div>
        <button className="button button-primary add-task-button" onClick={onAddTask}><Plus size={17} /> New task</button>
      </header>
      <section className="content-card tasks-panel">
        <div className="tasks-toolbar">
          <div className="toolbar-title"><h2>All tasks</h2><span className="task-count">{tasks.length}</span></div>
          <div className="task-filters">
            <label className="search-box"><Search size={16} /><input aria-label="Search tasks" placeholder="Search tasks..." value={filters.search} onChange={(event) => setFilter("search", event.target.value)} /><kbd>⌘ K</kbd></label>
            <select aria-label="Filter by status" className="filter-select" value={filters.status} onChange={(event) => setFilter("status", event.target.value)}><option value="">All statuses</option><option value="pending">Pending</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select>
            <select aria-label="Filter by priority" className="filter-select" value={filters.priority} onChange={(event) => setFilter("priority", event.target.value)}><option value="">All priorities</option><option value="low">Low priority</option><option value="medium">Medium priority</option><option value="high">High priority</option></select>
          </div>
        </div>
        {loading ? <div className="loading-state">Loading your tasks...</div> : <TaskList tasks={tasks} onEdit={onEdit} onDelete={onDelete} onComplete={onComplete} />}
      </section>
    </main>
  );
}
