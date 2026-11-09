import { CheckSquare, LayoutDashboard, ListTodo, LogOut, Menu, X } from "lucide-react";

export default function Sidebar({ page, user, onNavigate, onLogout, open, onToggle }) {
  const displayName = user.email.split("@")[0];
  const initials = displayName.slice(0, 2).toUpperCase();
  return (
    <>
      <button className="mobile-menu" onClick={onToggle} aria-label={open ? "Close menu" : "Open menu"}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open && <button className="sidebar-backdrop" onClick={onToggle} aria-label="Close navigation" />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); onNavigate("dashboard"); }}>
          <span className="brand-mark"><CheckSquare size={20} strokeWidth={2.5} /></span>
          <span>cloud<span className="brand-light">task</span></span>
        </a>

        <div className="workspace-switcher">
          <div className="workspace-avatar">W</div>
          <div className="workspace-copy"><strong>Workspace</strong><span>Personal space</span></div>
          <span className="switcher-dots">•••</span>
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav className="side-nav" aria-label="Main navigation">
          <button className={page === "dashboard" ? "nav-item active" : "nav-item"} onClick={() => onNavigate("dashboard")}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className={page === "tasks" ? "nav-item active" : "nav-item"} onClick={() => onNavigate("tasks")}>
            <ListTodo size={18} /> My tasks
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="cloud-card">
            <div className="cloud-icon"><CheckSquare size={16} /></div>
            <strong>Stay on track</strong>
            <p>A little progress each day adds up to big results.</p>
            <div className="cloud-progress"><span /></div>
            <span className="cloud-caption">Your personal workspace</span>
          </div>
          <div className="profile">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-info"><strong>{displayName}</strong><span>{user.email}</span></div>
            <button className="profile-logout" onClick={onLogout} aria-label="Sign out"><LogOut size={15} /></button>
          </div>
        </div>
      </aside>
    </>
  );
}
