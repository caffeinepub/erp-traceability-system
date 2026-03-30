import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History, RefreshCw, ShieldAlert } from "lucide-react";
import { useAllLabelLogs } from "../hooks/useQueries";
import { useAuth } from "../lib/auth";

export default function LabelHistoryPage() {
  const { isAdmin } = useAuth();
  const { data: logs, isLoading, refetch } = useAllLabelLogs();

  if (!isAdmin) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-12 text-center"
        data-ocid="history.error_state"
      >
        <ShieldAlert className="mb-4 h-12 w-12 text-destructive/60" />
        <h2 className="text-lg font-semibold text-destructive">
          Access Denied
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You need admin privileges to view label history.
        </p>
      </div>
    );
  }

  return (
    <div data-ocid="history.page">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground">
            Label History
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Audit log of all generated traceability labels
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => refetch()}
          data-ocid="history.secondary_button"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                #
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Material Code
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Actual Weight
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                User Principal
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Timestamp
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  {[1, 2, 3, 4, 5].map((j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : logs && logs.length > 0 ? (
              [...logs]
                .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
                .map((log, idx) => (
                  <TableRow
                    key={`${log.materialCode}-${String(log.timestamp)}`}
                    className="hover:bg-muted/20"
                    data-ocid={`history.item.${idx + 1}`}
                  >
                    <TableCell className="text-muted-foreground">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-medium text-primary">
                        {log.materialCode}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {log.actualWeight} kg
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.user.toString().slice(0, 20)}...
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(
                        Number(log.timestamp / BigInt(1_000_000)),
                      ).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  <div
                    className="flex flex-col items-center py-10 text-center"
                    data-ocid="history.empty_state"
                  >
                    <History className="mb-2 h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      No label history yet
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
