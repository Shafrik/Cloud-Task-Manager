import { useEffect, useState } from "react";
import { CalendarDays, X } from "lucide-react";

const emptyTask = {
  title: "",
  description: "",
  priority: "medium",
  status: "pending",
  deadline: "",
};

export default function TaskForm({ task, onClose, onSave, saving }) {
  const [form, setForm] = useState(emptyTask);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(task ? {
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      deadline: task.deadline || "",
    } : emptyTask);
    setError("");
  }, [task]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Give your task a title before saving.");
      return;
    }
    setError("");
    try {
      await onSave({ ...form, title: form.title.trim() });
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <div className="modal-heading">
          <div><span className="eyebrow">{task ? "MAKE IT BETTER" : "MAKE IT HAPPEN"}</span><h2 id="task-modal-title">{task ? "Edit task" : "Create a task"}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button>
        </div>
        <form onSubmit={submit}>
          <label className="field-label" htmlFor="task-title">Task name <span>*</span></label>
          <input id="task-title" className="text-input" autoFocus maxLength={200} placeholder="What needs to get done?" value={form.title} onChange={(event) => update("title", event.target.value)} />

          <label className="field-label" htmlFor="task-description">Description <span className="optional">(optional)</span></label>
          <textarea id="task-description" className="text-input textarea" placeholder="Add a few details..." rows={3} value={form.description} onChange={(event) => update("description", event.target.value)} />

          <div className="form-grid">
            <div><label className="field-label" htmlFor="task-priority">Priority</label>
              <select id="task-priority" className="text-input" value={form.priority} onChange={(event) => update("priority", event.target.value)}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
            <div><label className="field-label" htmlFor="task-status">Status</label>
              <select id="task-status" className="text-input" value={form.status} onChange={(event) => update("status", event.target.value)}>
                <option value="pending">Pending</option><option value="in_progress">In progress</option><option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <label className="field-label" htmlFor="task-deadline">Deadline <span className="optional">(optional)</span></label>
          <div className="date-input-wrap"><CalendarDays size={17} /><input id="task-deadline" className="text-input" type="date" value={form.deadline} onChange={(event) => update("deadline", event.target.value)} /></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? "Saving..." : task ? "Save changes" : "Create task"}</button></div>
        </form>
      </section>
    </div>
  );
}
