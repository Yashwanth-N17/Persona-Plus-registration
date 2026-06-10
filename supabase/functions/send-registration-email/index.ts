import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const event = {
  id: "coffee-alumni-2026",
  name: "Coffee With Alumni",
  date: "Friday, June 12",
  time: "5:30 PM onwards",
  venue: "IS Seminar Hall 2",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const { participantId } = await req.json();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("REGISTRATION_EMAIL_FROM") || "Persona+ <onboarding@resend.dev>";

  const participantResponse = await fetch(`${supabaseUrl}/rest/v1/participants?id=eq.${participantId}&select=*`, {
    headers: {
      apikey: serviceRole,
      authorization: `Bearer ${serviceRole}`,
    },
  });
  const [participant] = await participantResponse.json();
  if (!participant) return Response.json({ error: "Participant not found" }, { status: 404, headers: corsHeaders });

  const qrPayload = JSON.stringify(participant.qr_data);
  const qrImageUrl = `https://quickchart.io/qr?size=360&text=${encodeURIComponent(qrPayload)}`;
  const html = `
    <p>Hello ${participant.name},</p>
    <p>You have successfully registered for ${event.name}.</p>
    <p><strong>Registration ID:</strong> ${participant.id}<br>
    <strong>Registration Code:</strong> ${participant.registration_code}<br>
    <strong>USN:</strong> ${participant.usn}</p>
    <p><strong>Event Date:</strong> ${event.date}, ${event.time}<br>
    <strong>Venue:</strong> ${event.venue}</p>
    <p>Please keep the QR code safe and present it during event check-in.</p>
    <p><img src="${qrImageUrl}" alt="Registration QR Code" width="220" height="220"></p>
    <p>Thank you.</p>
  `;

  if (!resendKey) return Response.json({ queued: false, reason: "RESEND_API_KEY not configured" }, { headers: corsHeaders });

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${resendKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: participant.email,
      subject: `${event.name} Registration Confirmation`,
      html,
    }),
  });

  const payload = await emailResponse.json();
  return Response.json(payload, { status: emailResponse.status, headers: corsHeaders });
});
