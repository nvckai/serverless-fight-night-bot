import { runNotifier, type NotifierEnv } from "../src/notifier/notifier";

type VercelRequest = Request & {
  body?: unknown;
};

export const POST = async (req: VercelRequest) => {
  // Verify the request is from Vercel Cron
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.VERCEL_CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const notifierEnv: NotifierEnv = {
    DISCORD_TOKEN:
      typeof process.env.DISCORD_TOKEN === "string"
        ? process.env.DISCORD_TOKEN
        : "",
    FIGHT_NIGHT_SETTINGS: (globalThis as Record<PropertyKey, unknown>)
      .FIGHT_NIGHT_SETTINGS as NotifierEnv["FIGHT_NIGHT_SETTINGS"],
  };

  try {
    await runNotifier(notifierEnv);
    return new Response(
      JSON.stringify({ success: true, message: "Notifier executed" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Cron notifier error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
