import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, Loader2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
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
        <motion.form initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} onSubmit={onSubmit} className="w-full max-w-md glass-card-strong glow-border rounded-2xl p-6 sm:p-8 space-y-5">
          <div>
            <h1 className="text-4xl font-bold text-gradient">Lead Login</h1>
            <p className="mt-2 text-teal/75">Access scanner, dashboard, and admin tools.</p>
          </div>
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <XCircle className="mt-0.5 shrink-0 text-red-500" size={18} />
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-teal font-bold"><Mail size={18} /> Email</Label>
            <Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 bg-white/40 backdrop-blur-sm border border-teal/30 focus:bg-white/80 focus:border-teal/60 focus:ring-2 focus:ring-teal/30 transition-all rounded-xl shadow-sm hover:bg-white/60 text-slate-900 placeholder:text-slate-500 font-medium" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-teal font-bold"><LockKeyhole size={18} /> Password</Label>
            <Input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 bg-white/40 backdrop-blur-sm border border-teal/30 focus:bg-white/80 focus:border-teal/60 focus:ring-2 focus:ring-teal/30 transition-all rounded-xl shadow-sm hover:bg-white/60 text-slate-900 placeholder:text-slate-500 font-medium" />
          </div>
          <Button disabled={loading} className="btn-primary rounded-full w-full h-12 transition-all hover:scale-[1.02] active:scale-95 hover:shadow-[0_0_20px_rgba(45,115,115,0.4)]">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Login to Dashboard"
            )}
          </Button>
        </motion.form>
      </section>
    </AppShell>
  );
};

export default LoginPage;
