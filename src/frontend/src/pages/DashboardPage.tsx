import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Layers, Package, Tag, TrendingUp } from "lucide-react";
import { useAllMaterials } from "../hooks/useQueries";
import { useAllLabelLogs } from "../hooks/useQueries";
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
      color: "text-primary",
      bg: "bg-primary/10",
      loading: mLoading,
    },
    {
      title: "Labels Generated",
      value: totalLabels,
      icon: Tag,
      color: "text-success",
      bg: "bg-success/10",
      loading: lLoading,
    },
    {
      title: "Total Quantity",
      value: totalQuantity,
      icon: Layers,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
      loading: mLoading,
    },
    {
      title: "Active Users",
      value: isAdmin ? "Admin" : "User",
      icon: TrendingUp,
      color: "text-chart-4",
      bg: "bg-chart-4/10",
      loading: false,
    },
  ];

  return (
    <div data-ocid="dashboard.page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your ERP traceability system
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title} className="shadow-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${s.bg}`}
              >
                <s.icon className={`h-6 w-6 ${s.color}`} />
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

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link to="/entry">
              <Button
                className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
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
                  className="w-full justify-start gap-2"
                  data-ocid="dashboard.materials.secondary_button"
                >
                  <Package className="h-4 w-4" />
                  Manage Material Master
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide">
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
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {m.code}
                    </span>
                    <span className="text-xs text-muted-foreground">
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
