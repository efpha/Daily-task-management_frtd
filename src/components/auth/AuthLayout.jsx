import { CalendarDays, Check, Circle, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";

const AuthLayout = ({ eyebrow, title, description, children, footer }) => {
  return (
    <main className="auth-shell">
      <section className="auth-brand-panel" aria-label="Task Manager introduction">
        <div className="auth-brand-content">
          <Link to="/home" className="auth-brand" aria-label="Task Manager home">
            <span className="auth-brand-mark"><ListChecks size={20} strokeWidth={2.5} /></span>
            <span>Task Manager</span>
          </Link>

          <div className="auth-brand-copy">
            <p className="auth-brand-kicker">A calmer way to work</p>
            <h2>Make space for the work that matters.</h2>
          </div>
          
        </div>
        <p className="auth-brand-footer">Simple planning for focused days.</p>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-mobile-brand">
            <Link to="/home" className="auth-brand" aria-label="Task Manager home">
              <span className="auth-brand-mark"><ListChecks size={18} strokeWidth={2.5} /></span>
              <span>Task Manager</span>
            </Link>
          </div>

          <div className="auth-card">
            <div className="auth-card-header">
              <p className="auth-eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
            {children}
          </div>

          {footer && <div className="auth-footer">{footer}</div>}
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;
