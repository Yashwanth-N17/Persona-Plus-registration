import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createQrDataUrl, downloadDataUrl } from "@/lib/qr";
import type { Participant } from "@/types/event";

type QrCardProps = {
  participant: Participant;
};

const QrCard = ({ participant }: QrCardProps) => {
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    createQrDataUrl(participant.qr_data).then(setQrUrl);
  }, [participant.qr_data]);

  return (
    <div className="glass-card-strong glow-border rounded-2xl p-5 text-center">
      {qrUrl && <img src={qrUrl} alt="Registration QR code" className="mx-auto w-64 max-w-full rounded-xl bg-white p-3" />}
      <Button
        type="button"
        className="btn-primary mt-5 rounded-full"
        disabled={!qrUrl}
        onClick={() => downloadDataUrl(qrUrl, `${participant.usn}-${participant.registration_code}.png`)}
      >
        <Download size={18} />
        Download QR Code
      </Button>
    </div>
  );
};

export default QrCard;
