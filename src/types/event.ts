export type Participant = {
  id: number;
  name: string;
  usn: string;
  email: string;
  phone: string;
  registration_code: string;
  qr_data: QrPayload;
  registered_at: string;
  attendance_status: boolean;
  checked_in_at: string | null;
  checked_in_by: string | null;
  scan_device: string | null;
};

export type QrPayload = {
  eventId: string;
  participantId: number;
  code: string;
};

export type AttendanceLog = {
  id: number;
  created_at: string;
  registration_code: string | null;
  participant_name: string | null;
  scan_result: "Success" | "Duplicate Scan" | "Invalid QR";
  scanner_device: string | null;
};

export type RegistrationInput = {
  name: string;
  usn: string;
  email: string;
  phone: string;
};
