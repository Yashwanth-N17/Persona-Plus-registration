import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import AppShell from "@/components/AppShell";
import StatusPill from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getParticipants } from "@/lib/event-service";
import { formatDateTime } from "@/lib/utils";
import type { Participant } from "@/types/event";

const filters = [
  { id: "all", label: "All Participants" },
  { id: "registered", label: "Registered" },
  { id: "attended", label: "Attended" },
  { id: "not-attended", label: "Not Attended" },
];

const AdminPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      getParticipants(search, filter).then(setParticipants);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [search, filter]);

  return (
    <AppShell>
      <section className="px-6 py-12 min-h-[75vh]">
        <div className="max-w-7xl mx-auto space-y-7">
          <div>
            <h1 className="text-4xl sm:text-6xl font-bold text-gradient">Admin Dashboard</h1>
            <p className="mt-3 text-teal/75 text-lg">Search participants and monitor attendance status.</p>
          </div>
          <div className="glass-card-strong glow-border rounded-2xl p-5 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-teal/60" size={18} />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, USN, or registration code" className="pl-10 h-12 bg-white border-teal-pale/60" />
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant={filter === item.id ? "default" : "outline"}
                  className={filter === item.id ? "btn-primary rounded-full" : "rounded-full border-teal-pale text-teal"}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="glass-card-strong glow-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-teal-pale/20 text-teal text-sm">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">USN</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Registration Code</th>
                    <th className="p-4">Attendance Status</th>
                    <th className="p-4">Checked-In Time</th>
                    <th className="p-4">Checked-In By</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant) => (
                    <tr key={participant.id} className="border-t border-teal-pale/20">
                      <td className="p-4 font-bold">{participant.name}</td>
                      <td className="p-4">{participant.usn}</td>
                      <td className="p-4">{participant.email}</td>
                      <td className="p-4">{participant.phone}</td>
                      <td className="p-4 font-mono font-bold">{participant.registration_code}</td>
                      <td className="p-4"><StatusPill attended={participant.attendance_status} /></td>
                      <td className="p-4">{formatDateTime(participant.checked_in_at)}</td>
                      <td className="p-4">{participant.checked_in_by || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
};

export default AdminPage;
