import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const from = (location.state as { from?: string } | null)?.from || "/dashboard";

  if (session) return <Navigate to={from} replace />;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError("Invalid lead email or password.");
      return;
    }
    navigate(from, { replace: true });
  }

  return (
    <AppShell>
      <section className="px-6 py-16 min-h-[70vh] grid place-items-center">
        <form onSubmit={onSubmit} className="w-full max-w-md glass-card-strong glow-border rounded-2xl p-6 sm:p-8 space-y-5">
          <div>
            <h1 className="text-4xl font-bold text-gradient">Lead Login</h1>
            <p className="mt-2 text-teal/75">Access scanner, dashboard, and admin tools.</p>
          </div>
          {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">{error}</div>}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-teal font-bold"><Mail size={18} /> Email</Label>
            <Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 bg-white border-teal-pale/60" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-teal font-bold"><LockKeyhole size={18} /> Password</Label>
            <Input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 bg-white border-teal-pale/60" />
          </div>
          <Button disabled={loading} className="btn-primary rounded-full w-full h-12">
            {loading ? "Signing in..." : "Login to Dashboard"}
          </Button>
        </form>
      </section>
    </AppShell>
  );
};

export default LoginPage;
