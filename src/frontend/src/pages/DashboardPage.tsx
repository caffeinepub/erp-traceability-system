import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Activity, Layers, Package, Tag } from "lucide-react";
import { useAllLabelLogs, useAllMaterials } from "../hooks/useQueries";
import { useAuth } from "../lib/auth";

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const { data: materials, isLoading: mLoading } = useAllMaterials();
  const { data: logs, isLoading: lLoading } = useAllLabelLogs();

  const totalMaterials = materials?.length ?? 0;
  const totalLabels = logs?.length ?? 0;
  const totalQuantity =
    materials?.reduce((s, m) => s + Number(m.quantity), 0) ?? 0;

  const stats = [
    {
      title: "Total Materials",
      value: totalMaterials,
      icon: Package,
      accent: "#D97706",
      bg: "#fffbeb",
      loading: mLoading,
    },
    {
      title: "Labels Generated",
      value: totalLabels,
      icon: Tag,
      accent: "#16a34a",
      bg: "#f0fdf4",
      loading: lLoading,
    },
    {
      title: "Total Quantity",
      value: totalQuantity,
      icon: Layers,
      accent: "#b45309",
      bg: "#fef3c7",
      loading: mLoading,
    },
    {
      title: "Role",
      value: isAdmin ? "Admin" : "Level 1",
      icon: Activity,
      accent: isAdmin ? "#7c3aed" : "#0891b2",
      bg: isAdmin ? "#f5f3ff" : "#ecfeff",
      loading: false,
    },
  ];

  return (
    <div data-ocid="dashboard.page" className="space-y-6">
      {/* Hero Banner */}
      <div
        className="relative overflow-hidden rounded-2xl px-8 py-7"
        style={{
          background:
            "linear-gradient(135deg, #1C1917 0%, #292524 50%, #44403C 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, #fbbf24 0%, transparent 50%)",
          }}
        />
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">
          Welcome to
        </p>
        <h1
          className="mt-1 text-2xl font-extrabold tracking-tight"
          style={{ color: "#DC2626" }}
        >
          Essae Digitronics Pvt. Ltd.
        </h1>
        <p className="mt-1 text-sm text-amber-100/80">
          ERP Traceability System &mdash; Material Master & Label Management
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card
            key={s.title}
            className="overflow-hidden border-0 shadow-md transition-shadow hover:shadow-lg"
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ background: s.bg }}
              >
                <s.icon className="h-6 w-6" style={{ color: s.accent }} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {s.title}
                </p>
                {s.loading ? (
                  <Skeleton className="mt-1 h-7 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">
                    {s.value}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions + Recent Materials */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link to="/entry">
              <Button
                className="w-full justify-start gap-2 text-white"
                style={{ background: "#D97706" }}
                data-ocid="dashboard.entry.primary_button"
              >
                <Layers className="h-4 w-4" />
                Go to Material Entry
              </Button>
            </Link>
            {isAdmin && (
              <Link to="/admin/materials">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
                  data-ocid="dashboard.materials.secondary_button"
                >
                  <Package className="h-4 w-4" />
                  Manage Material Master
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Recent Materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : materials && materials.length > 0 ? (
              <ul className="space-y-2">
                {materials.slice(0, 5).map((m) => (
                  <li
                    key={m.code}
                    className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2"
                  >
                    <span className="text-sm font-semibold text-amber-800">
                      {m.code}
                    </span>
                    <span className="text-xs text-amber-500">
                      {m.description}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div
                className="py-4 text-center text-sm text-muted-foreground"
                data-ocid="dashboard.materials.empty_state"
              >
                No materials yet. Add some in Material Master.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
