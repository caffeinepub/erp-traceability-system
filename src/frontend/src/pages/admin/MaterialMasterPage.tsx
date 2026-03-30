import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Loader2,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import type { Material } from "../../backend";
import {
  useAddOrUpdateMaterial,
  useAllMaterials,
  useBulkImportMaterials,
  useDeleteMaterial,
} from "../../hooks/useQueries";
import { useAuth } from "../../lib/auth";

type FormState = {
  code: string;
  description: string;
  weight: string;
  minWeight: string;
  maxWeight: string;
  quantity: string;
};

const empty: FormState = {
  code: "",
  description: "",
  weight: "",
  minWeight: "",
  maxWeight: "",
  quantity: "",
};

function downloadTemplate() {
  const headers = [
    "Material Code",
    "Material Description",
    "Material Weight",
    "Min Weight",
    "Max Weight",
    "Quantity",
  ];
  const sampleRow = ["MAT-001", "Sample Material", 10.5, 9.0, 12.0, 100];
  const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
  // Set column widths
  ws["!cols"] = headers.map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Material Master");
  XLSX.writeFile(wb, "Material_Master_Template.xlsx");
}

export default function MaterialMasterPage() {
  const { isAdmin } = useAuth();
  const { data: materials, isLoading } = useAllMaterials();
  const addOrUpdate = useAddOrUpdateMaterial();
  const deleteMut = useDeleteMaterial();
  const bulkImport = useBulkImportMaterials();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Material | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateFileInputRef = useRef<HTMLInputElement>(null);

  if (!isAdmin) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-12 text-center"
        data-ocid="materials.error_state"
      >
        <ShieldAlert className="mb-4 h-12 w-12 text-destructive/60" />
        <h2 className="text-lg font-semibold text-destructive">
          Access Denied
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You need admin privileges to access Material Master.
        </p>
      </div>
    );
  }

  function openAdd() {
    setEditTarget(null);
    setForm(empty);
    setDialogOpen(true);
  }

  function openEdit(m: Material) {
    setEditTarget(m);
    setForm({
      code: m.code,
      description: m.description,
      weight: String(m.weight),
      minWeight: String(m.minWeight),
      maxWeight: String(m.maxWeight),
      quantity: String(m.quantity),
    });
    setDialogOpen(true);
  }

  async function handleSubmit() {
    if (
      !form.code ||
      !form.description ||
      !form.weight ||
      !form.minWeight ||
      !form.maxWeight ||
      !form.quantity
    ) {
      toast.error("All fields are required");
      return;
    }
    const weight = Number.parseFloat(form.weight);
    const minWeight = Number.parseFloat(form.minWeight);
    const maxWeight = Number.parseFloat(form.maxWeight);
    const quantity = BigInt(Number.parseInt(form.quantity, 10));
    if (Number.isNaN(weight) || weight <= 0) {
      toast.error("Invalid weight value");
      return;
    }
    if (Number.isNaN(minWeight) || minWeight < 0) {
      toast.error("Invalid minimum weight value");
      return;
    }
    if (Number.isNaN(maxWeight) || maxWeight <= 0) {
      toast.error("Invalid maximum weight value");
      return;
    }
    if (minWeight >= maxWeight) {
      toast.error("Minimum weight must be less than maximum weight");
      return;
    }
    try {
      await addOrUpdate.mutateAsync({
        code: form.code,
        description: form.description,
        weight,
        minWeight,
        maxWeight,
        quantity,
      });
      toast.success(editTarget ? "Material updated" : "Material added");
      setDialogOpen(false);
      setForm(empty);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to save material: ${msg}`);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget);
      toast.success("Material deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete material");
    }
  }

  async function handleFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    closeDialogAfter = false,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

      const parsed: Material[] = rows.map((row) => ({
        code: String(row["Material Code"] ?? row.code ?? ""),
        description: String(
          row["Material Description"] ?? row.description ?? "",
        ),
        weight: Number.parseFloat(
          String(row["Material Weight"] ?? row.weight ?? 0),
        ),
        minWeight: Number.parseFloat(
          String(row["Min Weight"] ?? row.minWeight ?? 0),
        ),
        maxWeight: Number.parseFloat(
          String(row["Max Weight"] ?? row.maxWeight ?? 0),
        ),
        quantity: BigInt(
          Number.parseInt(String(row.Quantity ?? row.quantity ?? 0), 10),
        ),
      }));

      const valid = parsed.filter(
        (m) => m.code && m.description && m.minWeight < m.maxWeight,
      );
      if (valid.length === 0) {
        toast.error(
          "No valid rows found. Check column headers and ensure Min Weight < Max Weight.",
        );
        return;
      }

      await bulkImport.mutateAsync(valid);
      toast.success(`Imported ${valid.length} materials`);
      if (closeDialogAfter) setDialogOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to parse Excel file: ${msg}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (updateFileInputRef.current) updateFileInputRef.current.value = "";
    }
  }

  return (
    <div data-ocid="materials.page">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground">
            Material Master
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage material codes, descriptions, weights and quantities
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.csv"
            className="hidden"
            onChange={(e) => handleFileUpload(e)}
          />
          <Button
            variant="outline"
            className="gap-2"
            onClick={downloadTemplate}
            data-ocid="materials.download_template_button"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={bulkImport.isPending}
            data-ocid="materials.upload_button"
          >
            {bulkImport.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload Excel
          </Button>
          <Button
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={openAdd}
            data-ocid="materials.primary_button"
          >
            <Plus className="h-4 w-4" />
            Add New Material
          </Button>
        </div>
      </div>

      {/* Excel format hint */}
      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs text-blue-700">
        <span className="font-semibold">Excel column headers required:</span>{" "}
        Material Code, Material Description, Material Weight, Min Weight, Max
        Weight, Quantity &nbsp;|&nbsp;
        <button
          type="button"
          onClick={downloadTemplate}
          className="underline font-medium hover:text-blue-900"
        >
          Download blank template
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Material Code
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Description
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Std. Weight (kg)
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Min Weight (kg)
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Max Weight (kg)
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Quantity
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : materials && materials.length > 0 ? (
              materials.map((m, idx) => (
                <TableRow
                  key={m.code}
                  className="hover:bg-muted/20"
                  data-ocid={`materials.item.${idx + 1}`}
                >
                  <TableCell className="font-mono font-medium text-primary">
                    {m.code}
                  </TableCell>
                  <TableCell className="text-sm">{m.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {m.weight} kg
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-mono border-amber-300 text-amber-700"
                    >
                      {m.minWeight} kg
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-mono border-green-300 text-green-700"
                    >
                      {m.maxWeight} kg
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {String(m.quantity)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => openEdit(m)}
                        data-ocid={`materials.edit_button.${idx + 1}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(m.code)}
                        data-ocid={`materials.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7}>
                  <div
                    className="py-8 text-center text-sm text-muted-foreground"
                    data-ocid="materials.empty_state"
                  >
                    No materials found. Add your first material or upload an
                    Excel file.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg" data-ocid="materials.dialog">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Material" : "Add New Material"}
            </DialogTitle>
          </DialogHeader>

          {/* Excel upload option inside dialog */}
          <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Or import from Excel template:
            </p>
            <div className="flex items-center gap-2">
              <input
                ref={updateFileInputRef}
                type="file"
                accept=".xlsx,.csv"
                className="hidden"
                onChange={(e) => handleFileUpload(e, true)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => updateFileInputRef.current?.click()}
                disabled={bulkImport.isPending}
              >
                {bulkImport.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                Upload Excel (XLSX/CSV)
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground"
                onClick={downloadTemplate}
              >
                <Download className="h-3.5 w-3.5" />
                Download Template
              </Button>
            </div>
          </div>

          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="mat-code">Material Code</Label>
              <Input
                id="mat-code"
                placeholder="e.g. MAT-001"
                value={form.code}
                onChange={(e) =>
                  setForm((p) => ({ ...p, code: e.target.value }))
                }
                disabled={!!editTarget}
                data-ocid="materials.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mat-desc">Description</Label>
              <Input
                id="mat-desc"
                placeholder="Material description"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                data-ocid="materials.input"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="mat-weight">Std. Weight (kg)</Label>
                <Input
                  id="mat-weight"
                  type="number"
                  min="0"
                  step="0.001"
                  placeholder="0.000"
                  value={form.weight}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, weight: e.target.value }))
                  }
                  data-ocid="materials.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mat-min">Min Weight (kg)</Label>
                <Input
                  id="mat-min"
                  type="number"
                  min="0"
                  step="0.001"
                  placeholder="0.000"
                  value={form.minWeight}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, minWeight: e.target.value }))
                  }
                  data-ocid="materials.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mat-max">Max Weight (kg)</Label>
                <Input
                  id="mat-max"
                  type="number"
                  min="0"
                  step="0.001"
                  placeholder="0.000"
                  value={form.maxWeight}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, maxWeight: e.target.value }))
                  }
                  data-ocid="materials.input"
                />
              </div>
            </div>
            {form.minWeight &&
              form.maxWeight &&
              Number(form.minWeight) >= Number(form.maxWeight) && (
                <p className="text-xs text-destructive">
                  Minimum weight must be less than maximum weight
                </p>
              )}
            <div className="space-y-1.5">
              <Label htmlFor="mat-qty">Quantity</Label>
              <Input
                id="mat-qty"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={form.quantity}
                onChange={(e) =>
                  setForm((p) => ({ ...p, quantity: e.target.value }))
                }
                data-ocid="materials.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="materials.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addOrUpdate.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="materials.save_button"
            >
              {addOrUpdate.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editTarget ? "Update" : "Add Material"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="materials.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Material</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete material{" "}
              <strong>{deleteTarget}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="materials.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="materials.delete_button"
            >
              {deleteMut.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
