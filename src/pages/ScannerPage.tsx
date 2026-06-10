import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, ScanLine, ShieldAlert } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { EVENT } from "@/lib/event";
import { markAttendance } from "@/lib/event-service";
import { formatDateTime } from "@/lib/utils";

type ScanResult = {
  tone: "success" | "duplicate" | "invalid";
  title: string;
  body: string;
  time?: string;
};

const ScannerPage = () => {
  const { user } = useAuth();
  const [volunteer, setVolunteer] = useState(user?.email || "Volunteer");
  const [result, setResult] = useState<ScanResult | null>(null);
  const lastScan = useRef({ value: "", at: 0 });
  const volunteerRef = useRef(volunteer);

  useEffect(() => {
    volunteerRef.current = volunteer;
  }, [volunteer]);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 260, height: 260 },
          },
          async (decodedText) => {
            const now = Date.now();
            if (lastScan.current.value === decodedText && now - lastScan.current.at < 2500) return;
            lastScan.current = { value: decodedText, at: now };
            
            try {
              const response = await markAttendance(decodedText, volunteerRef.current, navigator.userAgent);
              if (response.status === "success" && response.participant) {
                setResult({
                  tone: "success",
                  title: `Welcome ${response.participant.name}`,
                  body: `USN: ${response.participant.usn}\nChecked In Successfully`,
                  time: formatDateTime(response.checked_in_at),
                });
              } else if (response.status === "duplicate") {
                setResult({
                  tone: "duplicate",
                  title: "Attendance Already Recorded",
                  body: response.message,
                  time: formatDateTime(response.checked_in_at),
                });
              } else {
                setResult({ tone: "invalid", title: "Invalid or Unregistered QR Code", body: response.message });
              }
            } catch (err) {
              setResult({ tone: "invalid", title: "Invalid or Unregistered QR Code", body: err instanceof Error ? err.message : "Scan failed." });
            }
          },
          () => {
            // ignore frame read errors
          }
        );
      } catch (err) {
        console.error("Failed to start scanner", err);
      }
    };

    startScanner();

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => undefined);
      }
    };
  }, []);

  return (
    <AppShell>
      <section className="px-6 py-10 min-h-[75vh]">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[380px_1fr] gap-8">
          <div className="glass-card-strong glow-border rounded-2xl p-6 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-pale/30 px-4 py-2 text-teal font-bold">
              <ScanLine size={18} />
              Volunteer Scanner
            </div>
            <h1 className="text-4xl font-bold text-gradient">{EVENT.name} Check-In</h1>

            {result && <ResultCard result={result} />}
          </div>

          <div className="glass-card-strong glow-border rounded-2xl p-4 sm:p-6">
            <div id="qr-reader" className="overflow-hidden rounded-xl text-teal" />
          </div>
        </div>
      </section>
    </AppShell>
  );
};

const ResultCard = ({ result }: { result: ScanResult }) => {
  const success = result.tone === "success";
  return (
    <div className={`rounded-2xl p-5 border ${success ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
      <div className="flex items-center gap-2 font-bold text-xl mb-3">
        {success ? <CheckCircle2 /> : <ShieldAlert />}
        {result.title}
      </div>
      <p className="whitespace-pre-line font-semibold">{result.body}</p>
      {result.time && <p className="mt-3 text-sm font-bold">Time: {result.time}</p>}
    </div>
  );
};

export default ScannerPage;
