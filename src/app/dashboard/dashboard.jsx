import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CirclePlus,
  GripVertical,
  LogOut,
  NotebookTabs,
  PanelLeftClose,
  PanelRightClose,
  PencilLine,
  Trash2,
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
const taskDate = (task) => task.date_created || task.created_at;

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setTasks(await task_handler.fetchAllTasks());
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Couldn’t load your tasks", { description: "Please refresh the page and try again." });
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();
  }, []);

  const pendingCount = tasks.filter((task) => !isCompleted(task)).length;
  const completedCount = tasks.filter(isCompleted).length;
  const filteredTasks = useMemo(() => {
    if (filter === "pending") return tasks.filter((task) => !isCompleted(task));
    if (filter === "completed") return tasks.filter(isCompleted);
    return tasks;
  }, [filter, tasks]);

  const openCreateDialog = () => {
    setNewTask({ title: "", description: "" });
    setShowCreateDialog(true);
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    if (!newTask.title.trim()) {
      toast.error("Add a title first", { description: "Every task needs a short title." });
      return;
    }
    setIsSaving(true);
    try {
      const createdTask = await task_handler.createTask({ title: newTask.title.trim(), description: newTask.description.trim() });
      setTasks((current) => [createdTask, ...current]);
      setShowCreateDialog(false);
      setNewTask({ title: "", description: "" });
      toast.success("Task created", { description: `“${createdTask.title}” is ready to go.` });
    } catch (error) {
      console.error("Task creation failed:", error);
      toast.error("Couldn’t create task", { description: "Please check your connection and try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTaskDelete = async (id) => {
    setDeletingId(id);
    try {
      await task_handler.deleteTask(id);
      setTasks((current) => current.filter((task) => task.id !== id));
      if (selectedTask?.id === id) setSelectedTask(null);
      setDeleteCandidate(null);
      toast.success("Task deleted");
    } catch (error) {
      console.error("Error while deleting task:", error);
      toast.error("Couldn’t delete task", { description: "Please try again." });
    } finally {
      setDeletingId(null);
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
      const updated = await task_handler.updateTask(selectedTask.id, {
        title: selectedTask.title.trim(),
        description: selectedTask.description?.trim() || "",
        status: selectedTask.status || (isCompleted(selectedTask) ? "completed" : "pending"),
      });
      setTasks((current) => current.map((task) => (task.id === selectedTask.id ? { ...task, ...updated } : task)));
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
      setSelectedTask((current) => (current?.id === task.id ? { ...current, ...updatedTask } : current));
      toast.success("Task completed", { description: `Nice work on “${task.title}”.` });
    } catch (error) {
      console.error("Failed to mark task complete:", error);
      toast.error("Couldn’t update task status", { description: "Please try again." });
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

  const formatDate = (date) => date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
  const formatWeekday = (date) => date ? new Date(date).toLocaleDateString("en-US", { weekday: "long" }) : "—";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-950">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white shadow-xl transition-transform duration-300 md:static md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col gap-8 p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-lg font-semibold tracking-tight">Task Manager</p><p className="mt-1 text-xs text-slate-400">A calmer way to work</p></div>
            <Button variant="ghost" size="icon" className="text-slate-300 hover:bg-slate-800 hover:text-white md:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><PanelLeftClose /></Button>
          </div>
          <Button className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400" onClick={openCreateDialog}><CirclePlus /> Add task</Button>
          <nav className="space-y-1" aria-label="Task filters">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">View</p>
            {[["all", "All tasks", tasks.length], ["pending", "Pending", pendingCount], ["completed", "Completed", completedCount]].map(([value, label, count]) => (
              <button key={value} type="button" onClick={() => setFilter(value)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${filter === value ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}><span>{label}</span><span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-200">{count}</span></button>
            ))}
          </nav>
          <Button variant="outline" className="mt-auto w-full border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white" onClick={handleLogout}><LogOut /> Sign out</Button>
        </div>
      </aside>

      {!sidebarOpen && <Button variant="default" size="icon" className="fixed left-4 top-4 z-40 bg-slate-950 hover:bg-slate-800 md:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><PanelRightClose /></Button>}

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-5 pt-20 sm:p-8 md:pt-10">
          <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Your workspace</p><h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">My tasks</h1><p className="mt-2 text-sm text-slate-500">{tasks.length} total tasks · {completedCount} completed</p></div><Button className="w-fit bg-slate-950 hover:bg-slate-800" onClick={openCreateDialog}><CirclePlus /> New task</Button></header>
          {isLoading ? <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-white py-20 text-slate-500"><Spinner /><span className="mt-3 text-sm">Loading tasks…</span></div> : filteredTasks.length === 0 ? <Card className="border-dashed bg-white shadow-none"><CardContent className="flex flex-col items-center justify-center py-20 text-center"><NotebookTabs className="mb-4 size-12 text-slate-300" /><CardTitle className="text-lg">{filter === "all" ? "No tasks yet" : `No ${filter} tasks`}</CardTitle><CardDescription className="mt-2">{filter === "all" ? "Create your first task to get started." : "Try another view or add a new task."}</CardDescription><Button className="mt-6 bg-slate-950 hover:bg-slate-800" onClick={openCreateDialog}><CirclePlus /> Create task</Button></CardContent></Card> : <section className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label={`${filter} tasks`}>
            {filteredTasks.map((task) => { const complete = isCompleted(task); return <Card key={task.id} className="cursor-pointer bg-white transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md" onClick={() => setSelectedTask(task)}><CardContent className="flex items-start gap-4 p-5"><GripVertical className="mt-1 size-5 shrink-0 text-slate-300" /><Checkbox checked={complete} onCheckedChange={() => handleMarkComplete(task)} disabled={complete} onClick={(event) => event.stopPropagation()} aria-label={`Mark ${task.title} complete`} className="mt-1" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><p className={`truncate font-semibold ${complete ? "text-slate-400 line-through" : "text-slate-900"}`}>{task.title}</p><Badge variant="outline" className={complete ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>{complete ? "Completed" : "Pending"}</Badge></div><p className="mt-2 line-clamp-2 text-sm text-slate-500">{task.description || "No description"}</p><p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400"><CalendarDays className="size-3.5" /> {formatDate(taskDate(task))}</p></div><div className="flex shrink-0 gap-1"><Button variant="ghost" size="icon" className="text-slate-500 hover:bg-slate-100 hover:text-slate-900" onClick={(event) => { event.stopPropagation(); setSelectedTask(task); }} aria-label={`Edit ${task.title}`}><PencilLine /></Button><Button variant="ghost" size="icon" className="text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={(event) => { event.stopPropagation(); setDeleteCandidate(task); }} disabled={deletingId === task.id} aria-label={`Delete ${task.title}`}>{deletingId === task.id ? <Spinner /> : <Trash2 />}</Button></div></CardContent></Card>; })}
          </section>}
        </div>
      </main>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}><DialogContent><DialogHeader><DialogTitle>Create a task</DialogTitle><DialogDescription>Capture the next thing you want to move forward.</DialogDescription></DialogHeader><form onSubmit={handleCreateTask} className="space-y-5"><div className="space-y-2"><Label htmlFor="task-title">Title</Label><Input id="task-title" value={newTask.title} onChange={(event) => setNewTask({ ...newTask, title: event.target.value })} placeholder="e.g. Prepare weekly report" autoFocus /></div><div className="space-y-2"><Label htmlFor="task-description">Description <span className="font-normal text-slate-400">(optional)</span></Label><Textarea id="task-description" value={newTask.description} onChange={(event) => setNewTask({ ...newTask, description: event.target.value })} placeholder="Add a little context…" rows={4} /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button><Button type="submit" className="bg-slate-950 hover:bg-slate-800" disabled={isSaving}>{isSaving ? <><Spinner /> Saving…</> : "Create task"}</Button></DialogFooter></form></DialogContent></Dialog>

      <Dialog open={Boolean(selectedTask)} onOpenChange={(open) => { if (!open) setSelectedTask(null); }}><DialogContent className="max-w-2xl">{selectedTask && <><DialogHeader><DialogTitle>Edit task</DialogTitle><DialogDescription>Update the details or mark this task as complete.</DialogDescription></DialogHeader><form onSubmit={handleUpdateTask} className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="edit-task-title">Title</Label><Input id="edit-task-title" value={selectedTask.title} onChange={(event) => setSelectedTask({ ...selectedTask, title: event.target.value })} /></div><div className="space-y-2"><Label>Status</Label><div className="flex h-9 items-center"><Badge variant="outline" className={isCompleted(selectedTask) ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>{isCompleted(selectedTask) ? "Completed" : "Pending"}</Badge></div></div></div><div className="space-y-2"><Label htmlFor="edit-task-description">Description</Label><Textarea id="edit-task-description" value={selectedTask.description || ""} onChange={(event) => setSelectedTask({ ...selectedTask, description: event.target.value })} rows={5} /></div><div className="flex items-center gap-3 rounded-lg border bg-slate-50 p-3"><Checkbox id="edit-task-complete" checked={isCompleted(selectedTask)} onCheckedChange={() => handleMarkComplete(selectedTask)} disabled={isCompleted(selectedTask)} /><Label htmlFor="edit-task-complete" className="cursor-pointer">Mark as completed</Label></div><p className="flex items-center gap-1.5 text-xs text-slate-400"><CalendarDays className="size-3.5" /> Added {formatWeekday(taskDate(selectedTask))}, {formatDate(taskDate(selectedTask))}</p><DialogFooter><Button type="button" variant="outline" onClick={() => setSelectedTask(null)}>Cancel</Button><Button type="submit" className="bg-slate-950 hover:bg-slate-800" disabled={isSaving}>{isSaving ? <><Spinner /> Saving…</> : "Save changes"}</Button></DialogFooter></form></>}</DialogContent></Dialog>

      <AlertDialog open={Boolean(deleteCandidate)} onOpenChange={(open) => { if (!open) setDeleteCandidate(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this task?</AlertDialogTitle><AlertDialogDescription>“{deleteCandidate?.title}” will be permanently removed. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={() => handleTaskDelete(deleteCandidate.id)}>Delete task</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
};

export default Dashboard;
