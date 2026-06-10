import { motion } from "framer-motion";
import { CalendarDays, Clock, MapPin, Mic2, Users } from "lucide-react";
import { EVENT } from "@/lib/event";

const items = [
  { icon: CalendarDays, label: EVENT.dateLabel },
  { icon: Clock, label: EVENT.timeLabel },
  { icon: MapPin, label: EVENT.venue },
  { icon: Mic2, label: `${EVENT.guest}, ${EVENT.guestRole}` },
];

const EventSummary = () => (
  <section className="relative px-6 pb-10">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-7">
        <div className="inline-flex items-center gap-2 glass-card glow-border rounded-full px-4 py-2 text-xs font-bold tracking-[0.18em] uppercase text-teal">
          <Users size={16} />
          Presented by {EVENT.organizer}
        </div>
        <div>
          <p className="text-sm sm:text-base font-semibold tracking-[0.2em] text-teal/70 uppercase mb-3">
            In association with {EVENT.association}
          </p>
          <h1 className="text-5xl sm:text-7xl font-bold leading-[0.95] text-gradient">{EVENT.name}</h1>
        </div>
        <p className="text-lg text-teal/75 leading-relaxed max-w-2xl">{EVENT.description}</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map(({ icon: Icon, label }) => (
            <div key={label} className="glass-card-strong glow-border rounded-2xl p-4 flex items-center gap-3">
              <Icon className="text-teal shrink-0" size={22} />
              <span className="font-semibold text-teal">{label}</span>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative flex justify-center">
        <img
          src={EVENT.posterUrl}
          alt={`${EVENT.name} poster`}
          className="w-full max-w-md max-h-[520px] object-contain rounded-2xl border border-teal-pale/40 shadow-[0_24px_60px_rgba(30,75,107,0.18)] bg-white transition-transform hover:scale-[1.02] duration-300"
        />
      </motion.div>
    </div>
  </section>
);

export default EventSummary;
