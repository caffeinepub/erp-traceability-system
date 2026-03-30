import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  ChevronRight,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  Printer,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useAuth } from "../lib/auth";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  {
    to: "/admin/materials",
    label: "Material Master",
    icon: PackageSearch,
    adminOnly: true,
  },
  {
    to: "/entry",
    label: "Material Entry",
    icon: ClipboardList,
    adminOnly: false,
  },
  { to: "/print", label: "Label Print", icon: Printer, adminOnly: false },
  { to: "/history", label: "Label History", icon: History, adminOnly: true },
  {
    to: "/admin/users",
    label: "User Management",
    icon: Users,
    adminOnly: true,
  },
];

const PAGE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/admin/materials": "Material Master",
  "/admin/users": "User Management",
  "/entry": "Material Entry",
  "/history": "Label History",
  "/print": "Label Print",
};

export default function Layout() {
  const { isLoggedIn, isAdmin, username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/login" });
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  const visibleNav = navItems.filter((item) => !item.adminOnly || isAdmin);
  const initials = username ? username.slice(0, 2).toUpperCase() : "U";
  const roleLabel = isAdmin ? "Master" : "Level 1";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className="no-print flex w-64 flex-shrink-0 flex-col"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.20 0.047 230) 0%, oklch(0.18 0.045 228) 100%)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-sidebar-foreground">
              Traceability
            </p>
            <p className="text-xs text-sidebar-foreground/60">Pro ERP</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" data-ocid="nav.panel">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            Main Menu
          </p>
          <ul className="space-y-1">
            {visibleNav.map((item) => {
              const isActive =
                item.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    data-ocid={`nav.${item.label.toLowerCase().replace(/ /g, "_")}.link`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.label}</span>
                    {isActive && (
                      <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-70" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-sidebar-foreground">
                {username ?? "Guest"}
              </p>
              <Badge
                variant="outline"
                className={`mt-0.5 h-4 px-1.5 text-[10px] ${
                  isAdmin
                    ? "border-primary/50 text-primary"
                    : "border-sidebar-foreground/30 text-sidebar-foreground/60"
                }`}
              >
                {roleLabel}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              onClick={logout}
              data-ocid="nav.logout.button"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="no-print flex h-14 flex-shrink-0 items-center justify-between border-b bg-card px-6 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {PAGE_LABELS[location.pathname] ?? ""}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              className={`${
                isAdmin
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {roleLabel}
            </Badge>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
