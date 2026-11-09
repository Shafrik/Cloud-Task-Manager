import { useState } from "react";
import { CalendarDays, Check, Circle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

const statusNames = { pending: "Pending", in_progress: "In progress", completed: "Completed" };

function formatDeadline(deadline) {
  if (!deadline) return null;
  const date = new Date(`${deadline}T00:00:00`);
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

export function TaskRow({ task, onEdit, onDelete, onComplete, compact = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isComplete = task.status === "completed";

  return (
    <article className={`task-row ${isComplete ? "task-done" : ""} ${compact ? "task-compact" : ""}`}>
      <button className={`task-check ${isComplete ? "checked" : ""}`} onClick={() => !isComplete && onComplete(task)} aria-label={isComplete ? "Task completed" : `Complete ${task.title}`} disabled={isComplete}>
        {isComplete ? <Check size={15} /> : <Circle size={18} />}
      </button>
      <div className="task-main">
        <button className="task-title" onClick={() => onEdit(task)}>{task.title}</button>
        {!compact && task.description && <p className="task-description">{task.description}</p>}
        <div className="task-meta">
          <span className={`status-pill status-${task.status}`}>{statusNames[task.status]}</span>
          {!compact && <span className={`priority-pill priority-${task.priority}`}><i />{task.priority}</span>}
          {task.deadline && <span className="deadline-meta"><CalendarDays size={13} />{formatDeadline(task.deadline)}</span>}
        </div>
      </div>
      <div className="task-menu-wrap">
        <button className="icon-button task-menu-trigger" onClick={() => setMenuOpen((open) => !open)} aria-label={`Actions for ${task.title}`}><MoreHorizontal size={19} /></button>
        {menuOpen && <><button className="menu-dismiss" onClick={() => setMenuOpen(false)} aria-label="Close actions" /><div className="task-menu">
          <button onClick={() => { setMenuOpen(false); onEdit(task); }}><Pencil size={14} /> Edit task</button>
          <button className="delete-action" onClick={() => { setMenuOpen(false); onDelete(task); }}><Trash2 size={14} /> Delete task</button>
        </div></>}
      </div>
    </article>
  );
}

export default function TaskList({ tasks, onEdit, onDelete, onComplete, compact = false }) {
  if (!tasks.length) {
    return <div className="empty-state"><span className="empty-icon"><Check size={21} /></span><strong>Nothing on your list yet</strong><p>Add a task to get your momentum going.</p></div>;
  }
  return <div className="task-list">{tasks.map((task) => <TaskRow key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onComplete={onComplete} compact={compact} />)}</div>;
}
