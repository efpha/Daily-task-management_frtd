import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import {
  ListChecks,
  Menu,
  X,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  CalendarDays,
  Sparkles,
  Check,
} from "lucide-react";
import { AuthContext } from "../../AuthContext.js";

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);

  // Sample tasks for the interactive preview card
  const [sampleTasks, setSampleTasks] = useState([
    { id: 1, title: "Review quarterly goals and strategy", desc: "Focus on high-impact priorities", status: "completed", date: "Today" },
    { id: 2, title: "Finalize client proposal presentation", desc: "Include key milestones & budget", status: "pending", date: "Today" },
    { id: 3, title: "Sync with engineering on API release", desc: "Verify authentication endpoints", status: "pending", date: "Tomorrow" },
  ]);

  const toggleTask = (id) => {
    setSampleTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, status: task.status === "completed" ? "pending" : "completed" }
          : task
      )
    );
  };

  const completedCount = sampleTasks.filter((t) => t.status === "completed").length;
  const progressPercent = Math.round((completedCount / sampleTasks.length) * 100);

  return (
    <div className="home-shell">
      {/* Hero & Navigation Wrapper */}
      <div className="home-hero-bg">
        {/* Navbar Header */}
        <header className="home-header">
          <Link to="/home" className="home-brand" aria-label="Task Manager home">
            <span className="home-brand-mark">
              <ListChecks size={20} strokeWidth={2.5} />
            </span>
            <span>Task Manager</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="home-nav-links" aria-label="Main navigation">
            {isAuthenticated ? (
              <Link to="/dashboard" className="home-nav-btn-primary">
                <span>Go to Dashboard</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/home/login" className="home-nav-btn-ghost">
                  Sign in
                </Link>
                <Link to="/home/register" className="home-nav-btn-primary">
                  <span>Get Started</span>
                  <ArrowRight size={16} />
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="home-mobile-toggle"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="home-mobile-menu">
            {isAuthenticated ? (
              <Link to="/dashboard" className="home-nav-btn-primary" onClick={() => setIsOpen(false)}>
                <span>Go to Dashboard</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/home/login" className="home-nav-btn-ghost" onClick={() => setIsOpen(false)}>
                  Sign in
                </Link>
                <Link to="/home/register" className="home-nav-btn-primary" onClick={() => setIsOpen(false)}>
                  <span>Get Started</span>
                  <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        )}

        {/* Hero Section */}
        <main className="home-hero-container">
          {/* Left Hero Copy */}
          <div className="home-hero-content">
            <h1 className="home-hero-title">
              Make space for the <span>work that matters.</span>
            </h1>

            <p className="home-hero-subtitle">
              Stay organized, track your progress, and simplify your daily routine with a clean, clutter-free task workspace.
            </p>

            <div className="home-hero-ctas">
              {isAuthenticated ? (
                <Link to="/dashboard" className="home-btn-lg-primary">
                  <span>Open Your Workspace</span>
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/home/register" className="home-btn-lg-primary">
                    <span>Get Started — It's Free</span>
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/home/login" className="home-btn-lg-secondary">
                    <span>Sign In to Workspace</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Interactive Mock Preview Card */}
          <div className="home-preview-wrapper" aria-label="Interactive task manager preview">
            <div className="home-preview-card">
              <div className="home-preview-topbar">
                <div className="home-preview-topbar-title">
                  <ListChecks size={18} className="text-[#8fd5ac]" />
                  <span>Today's Focus</span>
                </div>
                <span className="home-preview-topbar-badge">
                  {completedCount} of {sampleTasks.length} Completed
                </span>
              </div>

              <div className="home-preview-task-list">
                {sampleTasks.map((task) => {
                  const isDone = task.status === "completed";
                  return (
                    <div
                      key={task.id}
                      className="home-preview-task-item"
                      onClick={() => toggleTask(task.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <button
                        type="button"
                        className={`home-preview-checkbox ${isDone ? "is-checked" : ""}`}
                        aria-label={`Toggle ${task.title}`}
                      >
                        {isDone && <Check size={13} strokeWidth={3} />}
                      </button>

                      <div className="home-preview-task-body">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`home-preview-task-title ${isDone ? "is-done" : ""}`}>
                            {task.title}
                          </p>
                          <span className={`home-preview-tag ${isDone ? "completed" : "pending"}`}>
                            {isDone ? "Completed" : "Pending"}
                          </span>
                        </div>
                        <p className="home-preview-task-desc">{task.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="home-preview-progress-bar">
                <span>Daily Momentum</span>
                <span>{progressPercent}% Complete</span>
              </div>
              <div className="home-preview-progress-track">
                <div
                  className="home-preview-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Features Section */}
      <section className="home-features-section" aria-label="Platform features">
        <div className="home-section-header">
          <p className="home-section-kicker">Designed for Clarity</p>
          <h2 className="home-section-title">Everything you need, nothing you don't.</h2>
          <p className="home-section-desc">
            Focus on getting things done with a streamlined workflow built for everyday productivity.
          </p>
        </div>

        <div className="home-features-grid">
          <div className="home-feature-card">
            <div className="home-feature-icon">
              <ListChecks size={24} />
            </div>
            <h3>Calm Task Tracking</h3>
            <p>
              Create, organize, and manage your tasks without clutter. Keep track of priorities with clean visual indicators.
            </p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">
              <ShieldCheck size={24} />
            </div>
            <h3>Private & Secure</h3>
            <p>
              Your tasks are strictly owner-scoped and protected with JWT token authentication and encrypted backend storage.
            </p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">
              <Zap size={24} />
            </div>
            <h3>Instant Status Filters</h3>
            <p>
              Quickly filter tasks by pending, completed, or all views so you always know what requires your attention next.
            </p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">
              <CalendarDays size={24} />
            </div>
            <h3>Thoughtful Planning</h3>
            <p>
              Structure your daily agenda with ease. Seamlessly mark tasks complete as you progress through your workday.
            </p>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="home-cta-banner" aria-label="Call to action">
        <div className="home-cta-banner-inner">
          <h2>Ready for a calmer way to work?</h2>
          <p>Create your free account today and bring clarity to your daily task management.</p>
          {isAuthenticated ? (
            <Link to="/dashboard" className="home-btn-lg-primary inline-flex">
              <span>Go to Your Workspace</span>
              <ArrowRight size={18} />
            </Link>
          ) : (
            <Link to="/home/register" className="home-btn-lg-primary inline-flex">
              <span>Get Started Now</span>
              <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </section>

      {/* Brand Footer */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-left">
            <span className="home-brand-mark" style={{ width: "1.8rem", height: "1.8rem", borderRadius: "0.5rem" }}>
              <ListChecks size={16} strokeWidth={2.5} />
            </span>
            <span>Task Manager</span>
          </div>

          <p className="home-footer-copy">
            Task Manager · A calmer way to work · Simple planning for focused days.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;