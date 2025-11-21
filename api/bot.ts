// @ts-ignore Generated after build
import { commands, components, events } from "../.dressed/index.js";
import {
  handleRequest,
  setupCommands,
  setupComponents,
  setupEvents,
} from "dressed/server";

type VercelEnv = {
  DISCORD_APP_ID?: string;
  DISCORD_PUBLIC_KEY?: string;
  DISCORD_TOKEN?: string;
  ESPN_USER_AGENT?: string;
  RUN_AT?: string;
  TZ?: string;
  FIGHT_NIGHT_SETTINGS?: {
    get(key: string): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
    delete?(key: string): Promise<void>;
  };
};

function registerEnv(env: VercelEnv): void {
  const globalAny = globalThis as Record<PropertyKey, unknown>;
  globalAny.env = env;
  if (env.FIGHT_NIGHT_SETTINGS) {
    globalAny.FIGHT_NIGHT_SETTINGS = env.FIGHT_NIGHT_SETTINGS;
  }

  const nodeProcess = globalAny.process as
    | { env?: Record<string, string> }
    | undefined;
  if (!nodeProcess) {
    globalAny.process = { env: {} };
  }
  const resolvedProcess = globalAny.process as { env: Record<string, string> };
  if (!resolvedProcess.env) {
    resolvedProcess.env = {};
  }
  const targetEnv = resolvedProcess.env;

  const inject = (key: keyof VercelEnv) => {
    const value = env[key];
    if (typeof value === "string" && value.length > 0) {
      targetEnv[String(key)] = value;
    }
  };

  inject("DISCORD_APP_ID");
  inject("DISCORD_PUBLIC_KEY");
  inject("DISCORD_TOKEN");
  inject("ESPN_USER_AGENT");
  inject("RUN_AT");
  inject("TZ");
}

export const POST = (req: Request) => {
  const env: VercelEnv = {
    DISCORD_APP_ID: process.env.DISCORD_APP_ID,
    DISCORD_PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY,
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    ESPN_USER_AGENT: process.env.ESPN_USER_AGENT,
    RUN_AT: process.env.RUN_AT,
    TZ: process.env.TZ,
    FIGHT_NIGHT_SETTINGS: (globalThis as Record<PropertyKey, unknown>)
      .FIGHT_NIGHT_SETTINGS as VercelEnv["FIGHT_NIGHT_SETTINGS"],
  };

  registerEnv(env);
  return handleRequest(
    req,
    setupCommands(commands),
    setupComponents(components),
    setupEvents(events),
  );
};
