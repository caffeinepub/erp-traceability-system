import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { BarChart3, Layers, QrCode, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useAuth } from "../lib/auth";

export default function LoginPage() {
  const { isLoggedIn, isInitializing, isLoggingIn, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitializing && isLoggedIn) {
      navigate({ to: "/" });
    }
  }, [isLoggedIn, isInitializing, navigate]);

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
                desc: "Admin and user roles with controlled permissions",
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
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Internet Identity Login
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Secure, passwordless authentication
              </p>
            </div>

            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="login.primary_button"
            >
              {isLoggingIn ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing In...
                </>
              ) : (
                "Sign In with Internet Identity"
              )}
            </Button>
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
