import { CheckCircle2, Clock } from "lucide-react";

const StatusPill = ({ attended }: { attended: boolean }) => (
  <span
    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
      attended ? "bg-emerald-100 text-emerald-700" : "bg-teal-pale/30 text-teal"
    }`}
  >
    {attended ? <CheckCircle2 size={14} /> : <Clock size={14} />}
    {attended ? "Attended" : "Registered"}
  </span>
);

export default StatusPill;
