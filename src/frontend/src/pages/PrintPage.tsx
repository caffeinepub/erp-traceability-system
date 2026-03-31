import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Loader2, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useGenerateLabel } from "../hooks/useQueries";

type PrintData = {
  code: string;
  description: string;
  standardWeight: number;
  minWeight: number;
  maxWeight: number;
  actualWeight: number;
  quantity: number;
};

export default function PrintPage() {
  const navigate = useNavigate();
  const generateLabel = useGenerateLabel();
  const [data, setData] = useState<PrintData | null>(null);
  const [timestamp] = useState(() => new Date().toISOString());
  const loggedRef = useRef(false);
  const printedRef = useRef(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("printData");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PrintData;
        setData(parsed);
      } catch {
        navigate({ to: "/entry" });
      }
    } else {
      navigate({ to: "/entry" });
    }
  }, [navigate]);

  useEffect(() => {
    if (data && !loggedRef.current) {
      loggedRef.current = true;
      generateLabel
        .mutateAsync({
          materialCode: data.code,
          actualWeight: data.actualWeight,
        })
        .then(() => toast.success("Label logged successfully"))
        .catch(() => toast.error("Failed to log label"));
    }
  }, [data, generateLabel]);

  // Auto-trigger print dialog once data is loaded
  useEffect(() => {
    if (data && !printedRef.current) {
      printedRef.current = true;
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading label data...</p>
        </div>
      </div>
    );
  }

  const qrData = JSON.stringify({
    code: data.code,
    description: data.description,
    standardWeight: data.standardWeight,
    minWeight: data.minWeight,
    maxWeight: data.maxWeight,
    actualWeight: data.actualWeight,
    quantity: data.quantity,
    timestamp,
  });

  const formattedDate = new Date(timestamp).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="min-h-screen bg-background p-6"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Action buttons - hidden on print */}
      <div className="no-print mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => navigate({ to: "/entry" })}
          data-ocid="print.cancel_button"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Entry
        </Button>
        <Button
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => window.print()}
          data-ocid="print.primary_button"
        >
          <Printer className="h-4 w-4" />
          Print Label
        </Button>
      </div>

      {/* Label Card */}
      <div className="mx-auto max-w-lg">
        <div
          id="print-label"
          className="overflow-hidden rounded-xl border-2 border-border bg-white shadow-lg"
          data-ocid="print.card"
          style={{ pageBreakInside: "avoid" }}
        >
          {/* Header */}
          <div
            className="px-6 py-4 text-center text-white"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.20 0.047 230) 0%, oklch(0.30 0.08 250) 100%)",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Essae Digitronics Pvt. Ltd.
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-wide">
              {data.code}
            </h1>
          </div>

          {/* Body */}
          <div className="flex gap-0">
            {/* Details */}
            <div className="flex-1 border-r border-border p-5">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">
                    {data.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-muted/50 p-2.5">
                    <p className="text-xs text-muted-foreground">Std. Weight</p>
                    <p className="mt-0.5 text-sm font-bold text-foreground">
                      {data.standardWeight} kg
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <p className="text-xs text-primary">Actual Weight</p>
                    <p className="mt-0.5 text-sm font-bold text-primary">
                      {data.actualWeight} kg
                    </p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-2.5">
                    <p className="text-xs text-amber-600">Min Weight</p>
                    <p className="mt-0.5 text-sm font-bold text-amber-700">
                      {data.minWeight} kg
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-2.5">
                    <p className="text-xs text-green-600">Max Weight</p>
                    <p className="mt-0.5 text-sm font-bold text-green-700">
                      {data.maxWeight} kg
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Quantity
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-foreground">
                    {data.quantity}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Generated At
                  </p>
                  <p className="mt-0.5 text-xs text-foreground">
                    {formattedDate}
                  </p>
                </div>
                {generateLabel.isSuccess && (
                  <div
                    className="flex items-center gap-1.5 text-xs text-green-600"
                    data-ocid="print.success_state"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Label logged
                  </div>
                )}
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center gap-2 p-5">
              <QRCodeSVG
                value={qrData}
                size={200}
                level="H"
                includeMargin
                style={{ display: "block" }}
              />
              <p className="text-center text-xs text-muted-foreground">
                Scan for details
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-muted/30 px-5 py-2.5">
            <p className="text-center text-xs text-muted-foreground">
              Material Code:{" "}
              <span className="font-mono font-bold text-foreground">
                {data.code}
              </span>
              {" · "}
              <span className="text-muted-foreground">
                Range: {data.minWeight}–{data.maxWeight} kg
              </span>
            </p>
          </div>
        </div>

        <p className="no-print mt-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-primary hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
