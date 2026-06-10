import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import QrCard from "@/components/QrCard";
import { Button } from "@/components/ui/button";
import { EVENT } from "@/lib/event";
import { findParticipantById } from "@/lib/event-service";
import type { Participant } from "@/types/event";

const SuccessPage = () => {
  const { id } = useParams();
  const [participant, setParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    if (id) findParticipantById(id).then(setParticipant);
  }, [id]);

  return (
    <AppShell>
      <section className="px-6 py-16 min-h-[70vh] grid place-items-center">
        <div className="max-w-4xl w-full glass-card-strong glow-border rounded-2xl p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="text-emerald-600" size={34} />
            <h1 className="text-4xl sm:text-5xl font-bold text-gradient">Registration Successful</h1>
          </div>
          {participant && (
            <div className="grid md:grid-cols-[1fr_320px] gap-8">
              <div className="space-y-4 text-lg text-teal/85">
                <p>{EVENT.confirmationMessage}</p>
                <Info label="Participant Name" value={participant.name} />
                <Info label="USN" value={participant.usn} />
                <Info label="Event" value={EVENT.name} />
                <Info label="Registration ID" value={String(participant.id)} />
                <Info label="Registration Code" value={participant.registration_code} />
                <Info label="Date and Venue" value={`${EVENT.dateLabel}, ${EVENT.timeLabel} at ${EVENT.venue}`} />
                <Button asChild className="btn-primary rounded-full mt-4">
                  <Link to="/retrieve">Retrieve My QR Code</Link>
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

export default SuccessPage;
