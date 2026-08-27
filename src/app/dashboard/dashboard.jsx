import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CirclePlus,
  Clock,
  Copy,
  Filter,
  Flame,
  GripVertical,
  LayoutGrid,
  List,
  ListChecks,
  LogOut,
  NotebookTabs,
  PanelLeftClose,
  PanelRightClose,
  PencilLine,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import api from "../../axiosConfig.js";
import task_handler from "../task_handler.js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog.jsx";
import { Badge } from "../../components/ui/badge.jsx";
import { Button } from "../../components/ui/button.jsx";
import { Checkbox } from "../../components/ui/checkbox.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog.jsx";
import { Input } from "../../components/ui/input.jsx";
import { Label } from "../../components/ui/label.jsx";
import { Spinner } from "../../components/ui/spinner.jsx";
import { Textarea } from "../../components/ui/textarea.jsx";

const isCompleted = (task) => task.status === "completed" || task.completed === true;

const categories = ["Work", "Personal", "Urgent", "Health", "Finance"];
const priorities = [
  { value: "high", label: "High", color: "bg-rose-50 text-rose-700 border-rose-200" },
  { value: "medium", label: "Medium", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "low", label: "Low", color: "bg-sky-50 text-sky-700 border-sky-200" },
];

const getPriorityBadge = (priority) => {
  switch (priority) {
    case "high":
      return <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700 font-semibold">🔴 High</Badge>;
    case "medium":
      return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 font-semibold">🟡 Medium</Badge>;
    case "low":
      return <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700 font-semibold">🔵 Low</Badge>;
    default:
      return <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">Medium</Badge>;
  }
};

const getCategoryBadge = (category) => {
  switch (category) {
    case "Work":
      return <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 border border-indigo-100"><Tag className="size-3" /> Work</span>;
    case "Personal":
      return <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-100"><Tag className="size-3" /> Personal</span>;
    case "Urgent":
      return <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 border border-rose-100"><Flame className="size-3 text-rose-500" /> Urgent</span>;
    case "Health":
      return <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 border border-teal-100"><Sparkles className="size-3 text-teal-500" /> Health</span>;
    case "Finance":
      return <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-100"><Tag className="size-3" /> Finance</span>;
    default:
      return <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"><Tag className="size-3" /> {category || "General"}</span>;
  }
};

const formatDueDate = (dueDateStr) => {
  if (!dueDateStr) return null;
  const targetDate = new Date(dueDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `Overdue (${Math.abs(diffDays)}d)`, isOverdue: true };
  } else if (diffDays === 0) {
    return { text: "Due Today", isToday: true };
  } else if (diffDays === 1) {
    return { text: "Due Tomorrow", isUpcoming: true };
  } else {
    return {
      text: targetDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      isUpcoming: true,
    };
  }
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Search, Filter & View States
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [sortBy, setSortBy] = useState("due_date"); // "due_date" | "priority" | "created" | "title"

  // Dialog States
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "Work",
    due_date: "",
    status: "pending",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await task_handler.fetchAllTasks();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Couldn’t load your tasks", { description: "Please refresh the page to try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Counts & Derived metrics
  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => !isCompleted(t) && t.status !== "in_progress").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const completedCount = tasks.filter(isCompleted).length;
  const highPriorityCount = tasks.filter((t) => t.priority === "high" && !isCompleted(t)).length;

  const todayCount = tasks.filter((t) => {
    if (isCompleted(t)) return false;
    const dueInfo = formatDueDate(t.due_date);
    return dueInfo?.isToday || dueInfo?.isOverdue;
  }).length;

  const overdueCount = tasks.filter((t) => {
    if (isCompleted(t)) return false;
    const dueInfo = formatDueDate(t.due_date);
    return dueInfo?.isOverdue;
  }).length;

  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered and Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Status / Smart View Filter
        if (filter === "today") {
          const dueInfo = formatDueDate(task.due_date);
          if (!dueInfo?.isToday && !dueInfo?.isOverdue) return false;
        } else if (filter === "overdue") {
          const dueInfo = formatDueDate(task.due_date);
          if (!dueInfo?.isOverdue || isCompleted(task)) return false;
        } else if (filter === "pending") {
          if (isCompleted(task)) return false;
        } else if (filter === "in_progress") {
          if (task.status !== "in_progress") return false;
        } else if (filter === "completed") {
          if (!isCompleted(task)) return false;
        } else if (filter === "high_priority") {
          if (task.priority !== "high") return false;
        }

        // Priority Filter
        if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;

        // Category Filter
        if (categoryFilter !== "all" && task.category !== categoryFilter) return false;

        // Search Query Filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const titleMatch = task.title?.toLowerCase().includes(query);
          const descMatch = (task.cleanDescription || task.description || "")
            .toLowerCase()
            .includes(query);
          if (!titleMatch && !descMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "priority") {
          const pOrder = { high: 1, medium: 2, low: 3 };
          return (pOrder[a.priority] || 2) - (pOrder[b.priority] || 2);
        } else if (sortBy === "due_date") {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        } else if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        } else {
          // created date
          return new Date(b.date_created || 0) - new Date(a.date_created || 0);
        }
      });
  }, [tasks, filter, priorityFilter, categoryFilter, searchQuery, sortBy]);

  const openCreateDialog = () => {
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      category: "Work",
      due_date: new Date().toISOString().split("T")[0],
      status: "pending",
    });
    setShowCreateDialog(true);
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    if (!newTask.title.trim()) {
      toast.error("Add a title first", { description: "Every task needs a clear title." });
      return;
    }
    setIsSaving(true);
    try {
      const createdTask = await task_handler.createTask(newTask);
      setTasks((current) => [createdTask, ...current]);
      setShowCreateDialog(false);
      toast.success("Task created", { description: `“${createdTask.title}” added to your workspace.` });
    } catch (error) {
      console.error("Task creation failed:", error);
      toast.error("Couldn’t create task", { description: "Please check your connection and try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTask = async (event) => {
    event.preventDefault();
    if (!selectedTask?.title.trim()) {
      toast.error("Add a title first");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await task_handler.updateTask(selectedTask.id, selectedTask);
      setTasks((current) => current.map((t) => (t.id === selectedTask.id ? updated : t)));
      setSelectedTask(null);
      toast.success("Task updated");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Couldn’t update task", { description: "Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkComplete = async (task) => {
    if (isCompleted(task)) return;
    try {
      const updatedTask = await task_handler.handleMarkComplete(task.id);
      setTasks((current) => current.map((item) => (item.id === task.id ? updatedTask : item)));
      if (selectedTask?.id === task.id) setSelectedTask(updatedTask);
      toast.success("Task completed", { description: `Great job completing “${task.title}”.` });
    } catch (error) {
      console.error("Failed to mark task complete:", error);
      toast.error("Couldn’t update task status", { description: "Please try again." });
    }
  };

  const handleStatusToggle = async (task, newStatus) => {
    try {
      const updated = await task_handler.updateTask(task.id, {
        ...task,
        status: newStatus,
        description: task.cleanDescription || task.description,
      });
      setTasks((current) => current.map((t) => (t.id === task.id ? updated : t)));
      toast.success(`Task status changed to ${newStatus.replace("_", " ")}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleTaskDelete = async (id) => {
    setDeletingId(id);
    try {
      await task_handler.deleteTask(id);
      setTasks((current) => current.filter((t) => t.id !== id));
      if (selectedTask?.id === id) setSelectedTask(null);
      setDeleteCandidate(null);
      toast.success("Task deleted");
    } catch (error) {
      console.error("Error while deleting task:", error);
      toast.error("Couldn’t delete task");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicateTask = async (task) => {
    try {
      const dupData = {
        title: `${task.title} (Copy)`,
        description: task.cleanDescription || task.description,
        priority: task.priority || "medium",
        category: task.category || "Work",
        due_date: task.due_date,
        status: "pending",
      };
      const created = await task_handler.createTask(dupData);
      setTasks((current) => [created, ...current]);
      toast.success("Task duplicated");
    } catch (error) {
      console.error("Error duplicating task:", error);
      toast.error("Failed to duplicate task");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("users/logout/", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      toast.success("You’re signed out");
      window.location.href = "/";
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-950 font-sans">
      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#17382c] text-white shadow-xl transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col justify-between p-5">
          <div className="space-y-6">
            {/* Brand Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-[#bce8cb] text-[#17382c]">
                  <ListChecks size={20} strokeWidth={2.5} />
                </span>
                <div>
                  <p className="font-bold tracking-tight text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    Task Manager
                  </p>
                  <p className="text-xs text-[#8fd5ac]">A calmer way to work</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-300 hover:bg-[#1f4a3b] hover:text-white md:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
              >
                <PanelLeftClose />
              </Button>
            </div>

            {/* Primary Action Button */}
            <Button
              className="w-full bg-[#bce8cb] text-[#17382c] hover:bg-[#d2f2dc] font-bold shadow-md transition"
              onClick={openCreateDialog}
            >
              <CirclePlus size={18} /> Add task
            </Button>

            {/* Main Views Navigation */}
            <nav className="space-y-1" aria-label="Task views">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8da99a]">
                Views
              </p>

              {[
                { value: "today", label: "Today's Focus", count: todayCount, icon: CalendarDays },
                { value: "overdue", label: "Overdue", count: overdueCount, icon: AlertCircle },
                { value: "all", label: "All Tasks", count: totalCount, icon: List },
                { value: "pending", label: "Pending", count: pendingCount, icon: Clock },
                { value: "in_progress", label: "In Progress", count: inProgressCount, icon: RefreshCw },
                { value: "completed", label: "Completed", count: completedCount, icon: CheckCircle2 },
                { value: "high_priority", label: "High Priority", count: highPriorityCount, icon: Flame },
              ].map((item) => {
                const NavIcon = item.icon;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setFilter(item.value);
                      setSidebarOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                      filter === item.value
                        ? "bg-[#235241] text-white shadow-sm"
                        : "text-[#c3d8cb] hover:bg-[#1a4234] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <NavIcon size={16} className={filter === item.value ? "text-[#8fd5ac]" : "text-[#8da99a]"} />
                      <span>{item.label}</span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        item.value === "overdue" && item.count > 0
                          ? "bg-rose-500/20 text-rose-300"
                          : item.value === "today" && item.count > 0
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-[#17251f] text-[#8fd5ac]"
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Category Filter Pills in Sidebar */}
            <div className="space-y-1 pt-2">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8da99a]">
                Categories
              </p>
              {categories.map((cat) => {
                const count = tasks.filter((t) => t.category === cat && !isCompleted(t)).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategoryFilter(categoryFilter === cat ? "all" : cat);
                      setSidebarOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs font-medium transition ${
                      categoryFilter === cat
                        ? "bg-[#235241] text-white"
                        : "text-[#a2c2b0] hover:bg-[#1a4234] hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Tag size={13} className="text-[#8fd5ac]" /> {cat}
                    </span>
                    <span className="text-[11px] text-[#7a9d8a]">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Momentum Progress Card */}
          <div className="space-y-4 pt-4 border-t border-[#235241]">
            <div className="rounded-xl bg-[#112d23] p-3.5 border border-[#235241]">
              <div className="flex items-center justify-between text-xs font-semibold text-[#c3d8cb]">
                <span>Daily Momentum</span>
                <span className="text-[#8fd5ac]">{completionPercentage}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#17382c]">
                <div
                  className="h-full rounded-full bg-[#8fd5ac] transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-[#8da99a]">
                {completedCount} of {totalCount} tasks completed
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-[#235241] bg-transparent text-[#c3d8cb] hover:bg-[#1a4234] hover:text-white"
              onClick={handleLogout}
            >
              <LogOut size={16} /> Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay Button */}
      {!sidebarOpen && (
        <Button
          variant="default"
          size="icon"
          className="fixed left-4 top-4 z-40 bg-[#17382c] hover:bg-[#1f4a3b] text-white md:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <PanelRightClose />
        </Button>
      )}

      {/* Main Workspace Section */}
      <main className="flex-1 overflow-auto bg-slate-50/50">
        <div className="mx-auto max-w-6xl p-4 sm:p-8">
          {/* Header & Quick Action Banner */}
          <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-[#2f8f68]">
                Your Workspace
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                {filter === "today"
                  ? "Today's Focus"
                  : filter === "overdue"
                  ? "Overdue Tasks"
                  : filter === "pending"
                  ? "Pending Tasks"
                  : filter === "in_progress"
                  ? "In Progress Tasks"
                  : filter === "completed"
                  ? "Completed Tasks"
                  : filter === "high_priority"
                  ? "High Priority Tasks"
                  : "All Tasks"}
              </h1>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"} shown · {completedCount} of {totalCount} completed
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                className="bg-[#17382c] text-white hover:bg-[#235241] shadow-sm transition"
                onClick={openCreateDialog}
              >
                <CirclePlus size={18} /> New task
              </Button>
            </div>
          </header>

          {/* Stats Cards Grid */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Card className="border-slate-200/80 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Tasks</span>
                <List size={16} className="text-slate-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{totalCount}</p>
            </Card>

            <Card className="border-amber-200/80 bg-amber-50/30 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700">Due Today</span>
                <CalendarDays size={16} className="text-amber-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-amber-900">{todayCount}</p>
            </Card>

            <Card className="border-rose-200/80 bg-rose-50/30 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-700">High Priority</span>
                <Flame size={16} className="text-rose-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-rose-900">{highPriorityCount}</p>
            </Card>

            <Card className="border-emerald-200/80 bg-emerald-50/30 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700">Completed</span>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-emerald-900">{completedCount}</p>
            </Card>
          </div>

          {/* Search, Filters & View Control Bar */}
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search tasks by title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs sm:text-sm border-slate-200 focus:border-[#2f8f68]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Dropdowns & View Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Priority Select */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:border-[#2f8f68] focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="high">🔴 High Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="low">🔵 Low Priority</option>
              </select>

              {/* Category Select */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:border-[#2f8f68] focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Sort By Select */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:border-[#2f8f68] focus:outline-none"
              >
                <option value="due_date">Sort by Due Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="created">Sort by Date Created</option>
                <option value="title">Sort by Title</option>
              </select>

              {/* Grid / List View Toggle */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-md p-1.5 text-xs transition ${
                    viewMode === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`rounded-md p-1.5 text-xs transition ${
                    viewMode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  }`}
                  aria-label="List view"
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Workspace Task Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-slate-500 shadow-sm">
              <Spinner />
              <span className="mt-3 text-xs sm:text-sm font-medium">Loading your tasks…</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <Card className="border-dashed border-slate-300 bg-white p-8 text-center shadow-none">
              <CardContent className="flex flex-col items-center py-12">
                <NotebookTabs className="mb-4 size-12 text-slate-300" />
                <CardTitle className="text-lg font-bold text-slate-800">
                  {searchQuery ? "No matching tasks found" : "No tasks in this view"}
                </CardTitle>
                <CardDescription className="mt-2 max-w-sm text-xs text-slate-500 sm:text-sm">
                  {searchQuery
                    ? `No tasks matched “${searchQuery}”. Try clearing your search or filters.`
                    : "Create a new task to organize your day and stay productive."}
                </CardDescription>
                <Button
                  className="mt-6 bg-[#17382c] text-white hover:bg-[#235241]"
                  onClick={openCreateDialog}
                >
                  <CirclePlus size={16} /> Create first task
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Tasks grid">
              {filteredTasks.map((task) => {
                const complete = isCompleted(task);
                const dueInfo = formatDueDate(task.due_date);

                return (
                  <Card
                    key={task.id}
                    className={`group cursor-pointer transition-all duration-200 border-slate-200/90 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${
                      complete ? "opacity-75 bg-slate-50/50" : ""
                    }`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardContent className="p-5">
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {getPriorityBadge(task.priority)}
                          {getCategoryBadge(task.category)}
                        </div>

                        {/* Quick Status Pill Toggle */}
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={task.status || (complete ? "completed" : "pending")}
                            onChange={(e) => handleStatusToggle(task, e.target.value)}
                            className={`h-6 rounded-md border text-[11px] font-semibold px-2 focus:outline-none ${
                              complete
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : task.status === "in_progress"
                                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>

                      {/* Main Title & Description */}
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={complete}
                          onCheckedChange={() => handleMarkComplete(task)}
                          disabled={complete}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1"
                          aria-label={`Mark ${task.title} complete`}
                        />
                        <div className="min-w-0 flex-1">
                          <h3
                            className={`font-semibold text-sm sm:text-base tracking-tight ${
                              complete ? "text-slate-400 line-through" : "text-slate-900"
                            }`}
                          >
                            {task.title}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                            {task.cleanDescription || task.description || "No description details"}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Meta & Actions Row */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          {dueInfo ? (
                            <span
                              className={`flex items-center gap-1 font-medium text-[11px] ${
                                dueInfo.isOverdue
                                  ? "text-rose-600 font-bold"
                                  : dueInfo.isToday
                                  ? "text-amber-600 font-bold"
                                  : "text-slate-500"
                              }`}
                            >
                              <CalendarDays size={13} /> {dueInfo.text}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Calendar size={13} /> Added {formatDate(task.date_created)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            onClick={() => handleDuplicateTask(task)}
                            title="Duplicate task"
                          >
                            <Copy size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                            onClick={() => setSelectedTask(task)}
                            title="Edit task"
                          >
                            <PencilLine size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            onClick={() => setDeleteCandidate(task)}
                            disabled={deletingId === task.id}
                            title="Delete task"
                          >
                            {deletingId === task.id ? <Spinner /> : <Trash2 size={14} />}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </section>
          ) : (
            /* List View */
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {filteredTasks.map((task) => {
                  const complete = isCompleted(task);
                  const dueInfo = formatDueDate(task.due_date);

                  return (
                    <div
                      key={task.id}
                      className="group flex flex-wrap items-center justify-between gap-3 p-3.5 hover:bg-slate-50 transition cursor-pointer"
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Checkbox
                          checked={complete}
                          onCheckedChange={() => handleMarkComplete(task)}
                          disabled={complete}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Mark ${task.title} complete`}
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate font-semibold text-xs sm:text-sm ${
                              complete ? "text-slate-400 line-through" : "text-slate-900"
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="truncate text-[11px] text-slate-500">
                            {task.cleanDescription || task.description || "No description"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getPriorityBadge(task.priority)}
                        {getCategoryBadge(task.category)}
                        {dueInfo && (
                          <span
                            className={`text-[11px] font-medium ${
                              dueInfo.isOverdue
                                ? "text-rose-600 font-bold"
                                : dueInfo.isToday
                                ? "text-amber-600 font-bold"
                                : "text-slate-500"
                            }`}
                          >
                            {dueInfo.text}
                          </span>
                        )}

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-slate-400 hover:bg-slate-200"
                            onClick={() => handleDuplicateTask(task)}
                            title="Duplicate task"
                          >
                            <Copy size={13} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-slate-400 hover:bg-slate-200"
                            onClick={() => setSelectedTask(task)}
                            title="Edit task"
                          >
                            <PencilLine size={13} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            onClick={() => setDeleteCandidate(task)}
                            disabled={deletingId === task.id}
                            title="Delete task"
                          >
                            {deletingId === task.id ? <Spinner /> : <Trash2 size={13} />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CREATE TASK DIALOG (Reference Container Design) */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg rounded-2xl border border-slate-200 p-6 shadow-xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-[#17382c]">
                <CirclePlus size={16} />
              </span>
              <DialogTitle className="text-lg font-bold text-slate-900" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Create a task
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Capture the next thing you want to move forward in your daily agenda.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
            {/* Title Input */}
            <div className="space-y-1.5">
              <Label htmlFor="task-title" className="text-xs font-bold text-slate-700">
                Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g. Finalize weekly project proposal"
                className="text-xs sm:text-sm border-slate-200 focus:border-[#2f8f68]"
                autoFocus
              />
            </div>

            {/* Priority & Category Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Priority Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Priority</Label>
                <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                  {priorities.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setNewTask({ ...newTask, priority: p.value })}
                      className={`flex-1 rounded-md py-1 text-center text-xs font-bold transition ${
                        newTask.priority === p.value
                          ? p.color + " shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Picker */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Category</Label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 focus:border-[#2f8f68] focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status & Due Date Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Status Select */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Status</Label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 focus:border-[#2f8f68] focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Due Date Picker */}
              <div className="space-y-1.5">
                <Label htmlFor="task-duedate" className="text-xs font-bold text-slate-700">
                  Due Date
                </Label>
                <Input
                  id="task-duedate"
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  className="h-8 text-xs border-slate-200 focus:border-[#2f8f68]"
                />
              </div>
            </div>

            {/* Description Input */}
            <div className="space-y-1.5">
              <Label htmlFor="task-description" className="text-xs font-bold text-slate-700">
                Description <span className="font-normal text-slate-400">(optional)</span>
              </Label>
              <Textarea
                id="task-description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Add contextual details, steps, or notes..."
                rows={3}
                className="text-xs sm:text-sm border-slate-200 focus:border-[#2f8f68]"
              />
            </div>

            {/* Footer Dialog Actions */}
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="text-xs border-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#17382c] text-white hover:bg-[#235241] text-xs font-bold"
                disabled={isSaving}
              >
                {isSaving ? <><Spinner /> Saving…</> : "Create task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT TASK DIALOG */}
      <Dialog
        open={Boolean(selectedTask)}
        onOpenChange={(open) => {
          if (!open) setSelectedTask(null);
        }}
      >
        <DialogContent className="max-w-xl rounded-2xl border border-slate-200 p-6 shadow-xl">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                    <PencilLine size={16} />
                  </span>
                  <DialogTitle className="text-lg font-bold text-slate-900" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    Edit task
                  </DialogTitle>
                </div>
                <DialogDescription className="text-xs text-slate-500">
                  Update task details, priority, due date, or status.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleUpdateTask} className="space-y-4 pt-2">
                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-task-title" className="text-xs font-bold text-slate-700">
                    Title
                  </Label>
                  <Input
                    id="edit-task-title"
                    value={selectedTask.title}
                    onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                    className="text-xs sm:text-sm border-slate-200"
                  />
                </div>

                {/* Priority & Category Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Priority</Label>
                    <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                      {priorities.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setSelectedTask({ ...selectedTask, priority: p.value })}
                          className={`flex-1 rounded-md py-1 text-center text-xs font-bold transition ${
                            selectedTask.priority === p.value
                              ? p.color + " shadow-xs"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Category</Label>
                    <select
                      value={selectedTask.category || "Work"}
                      onChange={(e) => setSelectedTask({ ...selectedTask, category: e.target.value })}
                      className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status & Due Date Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Status</Label>
                    <select
                      value={selectedTask.status || (isCompleted(selectedTask) ? "completed" : "pending")}
                      onChange={(e) => setSelectedTask({ ...selectedTask, status: e.target.value })}
                      className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-duedate" className="text-xs font-bold text-slate-700">
                      Due Date
                    </Label>
                    <Input
                      id="edit-duedate"
                      type="date"
                      value={selectedTask.due_date || ""}
                      onChange={(e) => setSelectedTask({ ...selectedTask, due_date: e.target.value })}
                      className="h-8 text-xs border-slate-200"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-description" className="text-xs font-bold text-slate-700">
                    Description
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={selectedTask.cleanDescription || selectedTask.description || ""}
                    onChange={(e) => setSelectedTask({ ...selectedTask, cleanDescription: e.target.value, description: e.target.value })}
                    rows={4}
                    className="text-xs sm:text-sm border-slate-200"
                  />
                </div>

                {/* Action Completion Checkbox Container */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <Checkbox
                    id="edit-task-complete"
                    checked={isCompleted(selectedTask)}
                    onCheckedChange={() => handleMarkComplete(selectedTask)}
                    disabled={isCompleted(selectedTask)}
                  />
                  <Label htmlFor="edit-task-complete" className="cursor-pointer text-xs font-semibold text-slate-700">
                    Mark task as completed
                  </Label>
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedTask(null)}
                    className="text-xs border-slate-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#17382c] text-white hover:bg-[#235241] text-xs font-bold"
                    disabled={isSaving}
                  >
                    {isSaving ? <><Spinner /> Saving…</> : "Save changes"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog
        open={Boolean(deleteCandidate)}
        onOpenChange={(open) => {
          if (!open) setDeleteCandidate(null);
        }}
      >
        <AlertDialogContent className="max-w-md rounded-2xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Delete this task?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              “{deleteCandidate?.title}” will be permanently removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs border-slate-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold"
              onClick={() => handleTaskDelete(deleteCandidate.id)}
            >
              Delete task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
