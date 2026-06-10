import { useState } from "react";
import { MailCheck, Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import QrCard from "@/components/QrCard";
import StatusPill from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findParticipantByUsn, sendRegistrationEmail } from "@/lib/event-service";
import { formatDateTime } from "@/lib/utils";
import type { Participant } from "@/types/event";

const RetrieveQrPage = () => {
  const [usn, setUsn] = useState("");
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setParticipant(null);
    try {
      const result = await findParticipantByUsn(usn);
      if (!result) {
        setError("No registration found for this USN. Please check and try again.");
      }
      setParticipant(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to retrieve QR code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (!participant) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await sendRegistrationEmail(participant);
      setSuccess("Registration email sent successfully! Please check your inbox.");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Failed to resend email.";
      // Strip raw SMTP technical noise, show friendly message
      if (raw.toLowerCase().includes("username and password") || raw.toLowerCase().includes("badcredentials")) {
        setError("Email service is temporarily unavailable. Please contact the event organizer.");
      } else if (raw.toLowerCase().includes("network") || raw.toLowerCase().includes("fetch")) {
        setError("Could not reach the email server. Make sure the backend is running.");
      } else {
        setError("Failed to send email. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <section className="px-6 py-16 min-h-[70vh]">
        <div className={`mx-auto grid gap-8 transition-all duration-500 ${participant ? "max-w-5xl lg:grid-cols-[0.85fr_1.15fr]" : "max-w-lg w-full"}`}>
          <div className="glass-card-strong glow-border rounded-2xl p-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-4">Retrieve My QR Code</h1>
            <p className="text-teal/75 text-lg">Enter your USN to view your registration, attendance status, and QR code again.</p>
            <form onSubmit={lookup} className="mt-8 space-y-4">
              <div className="space-y-2">
                <Label className="font-bold text-teal">USN</Label>
                <Input required value={usn} onChange={(event) => setUsn(event.target.value)} className="h-12 bg-white/40 backdrop-blur-sm border border-teal/30 focus:bg-white/80 focus:border-teal/60 focus:ring-2 focus:ring-teal/30 transition-all rounded-xl shadow-sm hover:bg-white/60 text-slate-900 placeholder:text-slate-500 font-medium" />
              </div>
              <Button disabled={loading} className="btn-primary rounded-full w-full h-12 transition-all hover:scale-[1.02] active:scale-95 hover:shadow-[0_0_20px_rgba(45,115,115,0.4)]">
                <Search size={18} />
                {loading ? "Searching..." : "Find Registration"}
              </Button>
            </form>
            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <XCircle className="mt-0.5 shrink-0 text-red-500" size={18} />
                <p className="text-sm font-semibold text-red-700">{error}</p>
              </div>
            )}
            {success && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={18} />
                <p className="text-sm font-semibold text-emerald-700">{success}</p>
              </div>
            )}
          </div>

          {participant && (
            <div className="glass-card-strong glow-border rounded-2xl p-6 sm:p-8 grid md:grid-cols-[1fr_290px] gap-6">
              <div className="space-y-4">
                <StatusPill attended={participant.attendance_status} />
                <Info label="Name" value={participant.name} />
                <Info label="USN" value={participant.usn} />
                <Info label="Registration Code" value={participant.registration_code} />
                <Info label="Attendance" value={participant.attendance_status ? `Checked in at ${formatDateTime(participant.checked_in_at)}` : "Not attended yet"} />
                <Button type="button" variant="outline" disabled={loading} className="rounded-full border-teal-pale text-teal" onClick={resend}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MailCheck size={18} />}
                  {loading ? "Sending..." : "Resend Email"}
                </Button>
              </div>
              <QrCard participant={participant} />
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs font-bold tracking-[0.18em] uppercase text-teal/55">{label}</div>
    <div className="font-bold text-foreground">{value}</div>
  </div>
);

export default RetrieveQrPage;
