import { useState } from "react";
import { MailCheck, Search } from "lucide-react";
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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setParticipant(null);
    try {
      const result = await findParticipantByUsn(usn);
      if (!result) setMessage("No registration found for this USN.");
      setParticipant(result);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to retrieve QR code.");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (!participant) return;
    await sendRegistrationEmail(participant);
    setMessage("Registration email has been queued again.");
  }

  return (
    <AppShell>
      <section className="px-6 py-16 min-h-[70vh]">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[0.85fr_1.15fr] gap-8">
          <div className="glass-card-strong glow-border rounded-2xl p-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-4">Retrieve My QR Code</h1>
            <p className="text-teal/75 text-lg">Enter your USN to view your registration, attendance status, and QR code again.</p>
            <form onSubmit={lookup} className="mt-8 space-y-4">
              <div className="space-y-2">
                <Label className="font-bold text-teal">USN</Label>
                <Input required value={usn} onChange={(event) => setUsn(event.target.value)} className="h-12 bg-white border-teal-pale/60" />
              </div>
              <Button disabled={loading} className="btn-primary rounded-full w-full">
                <Search size={18} />
                {loading ? "Searching..." : "Find Registration"}
              </Button>
            </form>
            {message && <p className="mt-5 rounded-xl bg-teal-pale/20 p-4 font-semibold text-teal">{message}</p>}
          </div>

          {participant && (
            <div className="glass-card-strong glow-border rounded-2xl p-6 sm:p-8 grid md:grid-cols-[1fr_290px] gap-6">
              <div className="space-y-4">
                <StatusPill attended={participant.attendance_status} />
                <Info label="Name" value={participant.name} />
                <Info label="USN" value={participant.usn} />
                <Info label="Registration Code" value={participant.registration_code} />
                <Info label="Attendance" value={participant.attendance_status ? `Checked in at ${formatDateTime(participant.checked_in_at)}` : "Not attended yet"} />
                <Button type="button" variant="outline" className="rounded-full border-teal-pale text-teal" onClick={resend}>
                  <MailCheck size={18} />
                  Resend Email
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
