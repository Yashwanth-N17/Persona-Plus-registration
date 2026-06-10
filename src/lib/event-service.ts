import { EVENT } from "@/lib/event";
import { normalizeEmail, normalizePhone, normalizeUsn } from "@/lib/utils";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { AttendanceLog, Participant, RegistrationInput } from "@/types/event";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function buildRegistrationCode() {
  return Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
}

function validateRegistration(input: RegistrationInput) {
  if (!input.name.trim()) throw new Error("Full Name is required.");
  if (!input.usn.trim()) throw new Error("USN is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) throw new Error("Enter a valid email address.");
  if (!/^\+?\d{10,15}$/.test(normalizePhone(input.phone))) throw new Error("Enter a valid phone number.");
}

export async function registerParticipant(input: RegistrationInput) {
  validateRegistration(input);

  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable registration.");
  }

  const normalized = {
    name: input.name.trim(),
    usn: normalizeUsn(input.usn),
    email: normalizeEmail(input.email),
    phone: normalizePhone(input.phone),
  };

  const { data: duplicates, error: duplicateError } = await supabase
    .from("participants")
    .select("usn,email,phone")
    .or(`usn.eq.${normalized.usn},email.eq.${normalized.email},phone.eq.${normalized.phone}`)
    .limit(1);

  if (duplicateError) throw duplicateError;
  if (duplicates?.length) {
    const duplicate = duplicates[0];
    if (duplicate.usn === normalized.usn) throw new Error("This USN is already registered for Coffee With Alumni.");
    if (duplicate.email === normalized.email) throw new Error("This email address is already registered for Coffee With Alumni.");
    throw new Error("This phone number is already registered for Coffee With Alumni.");
  }

  const { data: participant, error } = await supabase.rpc("register_event_participant", {
    participant_name: normalized.name,
    participant_usn: normalized.usn,
    participant_email: normalized.email,
    participant_phone: normalized.phone,
    generated_code: buildRegistrationCode(),
  });

  if (error) {
    if (error.code === "23505") throw new Error("A participant with the same USN, email, phone, or registration code already exists.");
    throw error;
  }

  const typedParticipant = participant as Participant;
  try {
    await sendRegistrationEmail(typedParticipant);
  } catch (emailErr) {
    console.error("Failed to send registration email, but participant was registered successfully:", emailErr);
  }
  return typedParticipant;
}

export async function sendRegistrationEmail(participant: Participant) {
  const emailApiUrl = import.meta.env.VITE_EMAIL_API_URL;
  if (!emailApiUrl) return;

  const response = await fetch(emailApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId: EVENT.id, participant }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    console.warn(payload?.error || "Registration email could not be sent.");
    throw new Error(payload?.error || "Registration email could not be sent.");
  }
}

export async function findParticipantByUsn(usn: string) {
  const { data, error } = await supabase.rpc("retrieve_participant_by_usn", { participant_usn: normalizeUsn(usn) });
  if (error) throw error;
  return data as Participant | null;
}

export async function findParticipantById(id: string | number) {
  const { data, error } = await supabase.rpc("retrieve_participant_by_id", { participant_id: Number(id) });
  if (error) throw error;
  return data as Participant | null;
}

export async function getParticipants(search = "", filter = "all") {
  let query = supabase.from("participants").select("*").order("registered_at", { ascending: false });
  const value = search.trim();
  if (value) {
    query = query.or(`name.ilike.%${value}%,usn.ilike.%${normalizeUsn(value)}%,registration_code.ilike.%${value.toUpperCase()}%`);
  }
  if (filter === "attended") query = query.eq("attendance_status", true);
  if (filter === "not-attended" || filter === "registered") query = query.eq("attendance_status", false);
  const { data, error } = await query.returns<Participant[]>();
  if (error) throw error;
  return data ?? [];
}

export async function getAttendanceLogs() {
  const { data, error } = await supabase
    .from("attendance_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<AttendanceLog[]>();
  if (error) throw error;
  return data ?? [];
}

export async function getAttendanceStats() {
  const { count: total, error: totalError } = await supabase.from("participants").select("*", { count: "exact", head: true });
  if (totalError) throw totalError;
  const { count: attended, error: attendedError } = await supabase
    .from("participants")
    .select("*", { count: "exact", head: true })
    .eq("attendance_status", true);
  if (attendedError) throw attendedError;
  const registrations = total ?? 0;
  const attendees = attended ?? 0;
  return {
    registrations,
    attendees,
    absentees: registrations - attendees,
    percentage: registrations ? Math.round((attendees / registrations) * 100) : 0,
  };
}

export async function markAttendance(qrValue: string, checkedInBy: string, scanDevice: string) {
  const { data, error } = await supabase.rpc("mark_event_attendance", {
    qr_payload_text: qrValue,
    volunteer_name: checkedInBy.trim() || "Volunteer",
    scanner_device_name: scanDevice,
  });
  if (error) throw error;
  return data as {
    status: "success" | "duplicate" | "invalid";
    message: string;
    participant?: Participant;
    checked_in_at?: string;
  };
}
