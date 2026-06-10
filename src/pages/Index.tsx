import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Coffee, Mail, Phone, User, BadgeCheck } from "lucide-react";
import AppShell from "@/components/AppShell";
import EventSummary from "@/components/EventSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EVENT } from "@/lib/event";
import { registerParticipant } from "@/lib/event-service";

const Index = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", usn: "", email: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const participant = await registerParticipant(form);
      navigate(`/success/${participant.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <EventSummary />
      <section id="register" className="relative px-6 py-14 grid-bg">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="glass-card-strong glow-border rounded-2xl p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-pale/30 text-teal px-4 py-2 text-sm font-bold mb-5">
                <Coffee size={17} />
                {EVENT.tagline}
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gradient mb-5">Register for {EVENT.name}</h2>
              <p className="text-teal/75 text-lg leading-relaxed">
                Join us for alumni conversations, career insights, higher studies guidance, and professional growth with {EVENT.guest}.
              </p>
            </div>
          </motion.div>

          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card-strong glow-border rounded-2xl p-6 sm:p-8 space-y-5"
          >
            {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">{error}</div>}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field icon={<User size={18} />} label="Full Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
              <Field icon={<BadgeCheck size={18} />} label="USN" value={form.usn} onChange={(usn) => setForm({ ...form, usn })} />
              <Field icon={<Mail size={18} />} label="Email Address" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
              <Field icon={<Phone size={18} />} label="Phone Number" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
            </div>
            <Button disabled={loading} className="btn-primary w-full rounded-full h-12 text-base">
              {loading ? "Registering..." : "Register and Generate QR"}
            </Button>
          </motion.form>
        </div>
      </section>
    </AppShell>
  );
};

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  type?: string;
};

const Field = ({ label, value, onChange, icon, type = "text" }: FieldProps) => (
  <div className="space-y-2">
    <Label className="flex items-center gap-2 text-teal font-bold">{icon}{label}</Label>
    <Input required type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-12 bg-white border-teal-pale/60" />
  </div>
);

export default Index;
