import { useEffect, useState } from "react";
import { Activity, Percent, UserCheck, Users } from "lucide-react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { getAttendanceLogs, getAttendanceStats } from "@/lib/event-service";
import { formatDateTime } from "@/lib/utils";
import type { AttendanceLog } from "@/types/event";

const DashboardPage = () => {
  const [stats, setStats] = useState({ registrations: 0, attendees: 0, absentees: 0, percentage: 0 });
  const [logs, setLogs] = useState<AttendanceLog[]>([]);

  useEffect(() => {
    const refresh = () => {
      getAttendanceStats().then(setStats);
      getAttendanceLogs().then(setLogs);
    };
    refresh();
    const channel = supabase
      .channel("attendance-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_logs" }, refresh)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <AppShell>
      <section className="px-6 py-12 min-h-[75vh]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl sm:text-6xl font-bold text-gradient">Real-Time Attendance</h1>
            <p className="mt-3 text-teal/75 text-lg">Live counters update whenever a QR code is scanned.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Metric icon={<Users />} label="Total Registrations" value={stats.registrations} />
            <Metric icon={<UserCheck />} label="Total Attendees" value={stats.attendees} />
            <Metric icon={<Activity />} label="Total Absentees" value={stats.absentees} />
            <Metric icon={<Percent />} label="Attendance Percentage" value={`${stats.percentage}%`} />
          </div>
          <div className="glass-card-strong glow-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-teal-pale/30">
              <h2 className="text-2xl font-bold text-foreground">Attendance Logs</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-teal-pale/20 text-teal text-sm">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Code</th>
                    <th className="p-4">Participant</th>
                    <th className="p-4">Result</th>
                    <th className="p-4">Scanner Device</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t border-teal-pale/20">
                      <td className="p-4">{formatDateTime(log.created_at)}</td>
                      <td className="p-4 font-mono font-bold">{log.registration_code || "-"}</td>
                      <td className="p-4">{log.participant_name || "-"}</td>
                      <td className="p-4 font-bold text-teal">{log.scan_result}</td>
                      <td className="p-4 max-w-[280px] truncate">{log.scanner_device || "-"}</td>
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

const Metric = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) => (
  <div className="glass-card-strong glow-border rounded-2xl p-6">
    <div className="text-teal mb-5">{icon}</div>
    <div className="text-4xl font-bold text-gradient">{value}</div>
    <div className="mt-2 text-sm font-bold tracking-[0.14em] uppercase text-teal/60">{label}</div>
  </div>
);

export default DashboardPage;
