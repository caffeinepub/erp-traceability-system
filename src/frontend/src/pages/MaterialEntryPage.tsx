import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Hash,
  Loader2,
  Package,
  QrCode,
  Weight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAllMaterials } from "../hooks/useQueries";

export default function MaterialEntryPage() {
  const navigate = useNavigate();
  const { data: materials, isLoading } = useAllMaterials();

  const [selectedCode, setSelectedCode] = useState<string>("");
  const [actualWeight, setActualWeight] = useState<string>("");
  const [isNavigating, setIsNavigating] = useState(false);

  const selectedMaterial =
    materials?.find((m) => m.code === selectedCode) ?? null;

  const parsedWeight = Number.parseFloat(actualWeight);
  const weightIsValid = !Number.isNaN(parsedWeight) && parsedWeight > 0;
  const weightInRange =
    selectedMaterial && weightIsValid
      ? parsedWeight >= selectedMaterial.minWeight &&
        parsedWeight <= selectedMaterial.maxWeight
      : null;

  function handleGenerate() {
    if (!selectedMaterial) {
      toast.error("Please select a material code");
      return;
    }
    if (!weightIsValid) {
      toast.error("Please enter a valid actual weight");
      return;
    }
    if (!weightInRange) {
      toast.error(
        `Weight must be between ${selectedMaterial.minWeight} kg and ${selectedMaterial.maxWeight} kg`,
      );
      return;
    }

    setIsNavigating(true);
    sessionStorage.setItem(
      "printData",
      JSON.stringify({
        code: selectedMaterial.code,
        description: selectedMaterial.description,
        standardWeight: selectedMaterial.weight,
        minWeight: selectedMaterial.minWeight,
        maxWeight: selectedMaterial.maxWeight,
        actualWeight: parsedWeight,
        quantity: Number(selectedMaterial.quantity),
      }),
    );
    navigate({ to: "/print" });
  }

  return (
    <div data-ocid="entry.page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground">
          Material Entry
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a material and enter the actual weight to generate a label
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <QrCode className="h-5 w-5 text-primary" />
              Generate Traceability Label
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Material Code Select */}
            <div className="space-y-1.5">
              <Label htmlFor="material-select" className="text-sm font-medium">
                Material Code
              </Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedCode} onValueChange={setSelectedCode}>
                  <SelectTrigger
                    id="material-select"
                    data-ocid="entry.select"
                    className="w-full"
                  >
                    <SelectValue placeholder="Select material code..." />
                  </SelectTrigger>
                  <SelectContent>
                    {materials && materials.length > 0 ? (
                      materials.map((m) => (
                        <SelectItem key={m.code} value={m.code}>
                          <span className="font-mono font-medium">
                            {m.code}
                          </span>
                          <span className="ml-2 text-muted-foreground">
                            — {m.description}
                          </span>
                        </SelectItem>
                      ))
                    ) : (
                      <div
                        className="py-4 text-center text-sm text-muted-foreground"
                        data-ocid="entry.empty_state"
                      >
                        No materials available
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Material Info */}
            {selectedMaterial && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Material Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Description
                      </p>
                      <p className="text-sm font-medium">
                        {selectedMaterial.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Standard Weight
                      </p>
                      <Badge variant="outline" className="mt-0.5 font-mono">
                        {selectedMaterial.weight} kg
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Quantity</p>
                      <p className="text-sm font-medium">
                        {String(selectedMaterial.quantity)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Weight Range
                      </p>
                      <p className="text-sm font-semibold">
                        <span className="text-amber-600">
                          {selectedMaterial.minWeight}
                        </span>
                        <span className="text-muted-foreground"> – </span>
                        <span className="text-green-600">
                          {selectedMaterial.maxWeight}
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">
                          kg
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actual Weight */}
            <div className="space-y-1.5">
              <Label htmlFor="actual-weight" className="text-sm font-medium">
                Actual Weight (kg)
              </Label>
              <Input
                id="actual-weight"
                type="number"
                min="0"
                step="0.001"
                placeholder="Enter actual weight..."
                value={actualWeight}
                onChange={(e) => setActualWeight(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                className={
                  actualWeight && selectedMaterial
                    ? weightInRange
                      ? "border-green-400 focus-visible:ring-green-400"
                      : "border-destructive focus-visible:ring-destructive"
                    : ""
                }
                data-ocid="entry.input"
              />
              {/* Weight range feedback */}
              {actualWeight && selectedMaterial && (
                <div className="mt-1">
                  {weightInRange ? (
                    <Alert className="border-green-300 bg-green-50 py-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-xs text-green-700">
                        Weight is within the acceptable range (
                        {selectedMaterial.minWeight} –{" "}
                        {selectedMaterial.maxWeight} kg). You can proceed.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive" className="py-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Weight <strong>{parsedWeight} kg</strong> is out of
                        range. Acceptable range:{" "}
                        <strong>
                          {selectedMaterial.minWeight} –{" "}
                          {selectedMaterial.maxWeight} kg
                        </strong>
                        . Label cannot be generated.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>

            <Button
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleGenerate}
              disabled={
                !selectedCode ||
                !actualWeight ||
                isNavigating ||
                weightInRange === false
              }
              data-ocid="entry.primary_button"
            >
              {isNavigating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <QrCode className="h-4 w-4" />
              )}
              Generate Label
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
