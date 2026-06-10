import QRCode from "qrcode";
import type { QrPayload } from "@/types/event";

export function encodeQrPayload(payload: QrPayload) {
  return JSON.stringify(payload);
}

export function parseQrPayload(value: string): QrPayload | null {
  try {
    const parsed = JSON.parse(value) as Partial<QrPayload>;
    if (!parsed.eventId || !parsed.participantId || !parsed.code) return null;
    return {
      eventId: String(parsed.eventId),
      participantId: Number(parsed.participantId),
      code: String(parsed.code).toUpperCase(),
    };
  } catch {
    return null;
  }
}

export async function createQrDataUrl(payload: QrPayload) {
  return QRCode.toDataURL(encodeQrPayload(payload), {
    width: 420,
    margin: 2,
    color: {
      dark: "#1e4b6b",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
}
