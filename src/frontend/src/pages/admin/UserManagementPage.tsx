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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, EyeOff, Pencil, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type Credential,
  getCredentials,
  saveCredentials,
} from "../../lib/localAuth";

export default function UserManagementPage() {
  const [creds, setCreds] = useState<Credential[]>(getCredentials);
  const [editing, setEditing] = useState<Credential | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const openEdit = (cred: Credential) => {
    setEditing(cred);
    setEditUsername(cred.username);
    setEditPassword(cred.password);
    setShowPassword(false);
  };

  const handleSave = () => {
    if (!editing) return;
    const updated = creds.map((c) =>
      c.role === editing.role
        ? { ...c, username: editUsername, password: editPassword }
        : c,
    );
    saveCredentials(updated);
    setCreds(updated);
    setEditing(null);
    toast.success("Credentials updated successfully");
  };

  return (
    <div className="space-y-6" data-ocid="user_management.page">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage login credentials for system users.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
        <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-sm text-amber-800 dark:text-amber-300">
          Credentials are stored locally in your browser. Changes will only
          apply on this device.
        </p>
      </div>

      <div
        className="rounded-xl border bg-card"
        data-ocid="user_management.table"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creds.map((cred, idx) => (
              <TableRow
                key={cred.role}
                data-ocid={`user_management.item.${idx + 1}`}
              >
                <TableCell className="font-medium">{cred.username}</TableCell>
                <TableCell className="font-mono text-sm">
                  {"•".repeat(cred.password.length)}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      cred.role === "admin"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {cred.role === "admin" ? "Master" : "Level 1"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(cred)}
                    data-ocid={`user_management.edit_button.${idx + 1}`}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent data-ocid="user_management.dialog">
          <DialogHeader>
            <DialogTitle>
              Edit {editing?.role === "admin" ? "Master" : "Level 1"}{" "}
              Credentials
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                data-ocid="user_management.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="pr-10"
                  data-ocid="user_management.textarea"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditing(null)}
              data-ocid="user_management.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!editUsername || !editPassword}
              data-ocid="user_management.save_button"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
