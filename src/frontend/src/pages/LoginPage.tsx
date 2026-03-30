import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { BarChart3, Eye, EyeOff, Layers, QrCode, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";

export default function LoginPage() {
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      navigate({ to: "/" });
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = login(username, password);
    if (!success) {
      setError("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div
        className="hidden w-1/2 flex-col justify-between p-12 lg:flex"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.20 0.047 230) 0%, oklch(0.30 0.08 250) 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Traceability Pro</span>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-4xl font-bold leading-tight text-white">
              ERP Traceability
              <br />
              <span className="text-white/70">System</span>
            </h1>
            <p className="mt-4 text-base text-white/60">
              Complete material traceability with QR-code labels, Excel imports,
              and role-based access control.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              {
                icon: Shield,
                title: "Role-Based Access",
                desc: "Master and Level 1 roles with controlled permissions",
              },
              {
                icon: Layers,
                title: "Material Master",
                desc: "Manage material codes, weights and quantities",
              },
              {
                icon: QrCode,
                title: "QR Code Labels",
                desc: "Auto-generate traceability labels with QR codes",
              },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <f.icon className="h-5 w-5 text-white/80" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-white/50">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="text-xs text-white/30">
          © {new Date().getFullYear()} ERP Traceability System
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-foreground">Traceability Pro</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>

          <div className="mt-8 rounded-xl border bg-card p-6 shadow-card">
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              data-ocid="login.dialog"
            >
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  data-ocid="login.input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="pr-10"
                    data-ocid="login.textarea"
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

              {error && (
                <p
                  className="text-sm text-destructive"
                  data-ocid="login.error_state"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="login.primary_button"
              >
                Sign In
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
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
        </motion.div>
      </div>
    </div>
  );
}
