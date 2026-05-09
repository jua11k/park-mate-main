interface WebhookPayload {
  tenantId: string;
  eventType: string;
  data: any;
}

export async function sendToN8n(payload: WebhookPayload) {
  const url = process.env.N8N_WEBHOOK_URL;
  
  if (!url) {
    console.warn("N8N_WEBHOOK_URL not set, skipping integration.");
    return;
  }

  // Fire-and-forget approach (don't await)
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(err => console.error("Error sending to n8n:", err));
}
