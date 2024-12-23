const TELEGRAM_BOT_URL = process.env.TELEGRAM_BOT_URL;
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

export async function notifyTelegramBot(endpoint: "grant" | "stage", data: unknown) {
  if (!TELEGRAM_BOT_URL || !TELEGRAM_WEBHOOK_SECRET) {
    if (!TELEGRAM_BOT_URL) {
      console.warn("TELEGRAM_BOT_URL is not set. Telegram notifications will be disabled.");
    }

    if (!TELEGRAM_WEBHOOK_SECRET) {
      console.warn("TELEGRAM_WEBHOOK_SECRET is not set. Telegram notifications will be disabled.");
    }
    return;
  }

  try {
    const response = await fetch(`${TELEGRAM_BOT_URL}/webhook/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": TELEGRAM_WEBHOOK_SECRET,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // We don't throw here to prevent the main flow from failing if notifications fail
    console.error(`Error notifying Telegram bot (${endpoint}):`, error);
  }
}
