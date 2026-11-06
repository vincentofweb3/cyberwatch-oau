const origin = process.env.SMOKE_ORIGIN ?? "http://127.0.0.1:3000";

async function get(path, cookie) {
  const response = await fetch(`${origin}${path}`, {
    headers: cookie ? { cookie } : undefined,
    redirect: "manual",
  });
  return { response, html: await response.text() };
}

const health = await fetch(`${origin}/api/health`);
if (!health.ok || (await health.json()).status !== "ok") throw new Error("Health endpoint failed.");

const home = await get("/");
if (!home.response.ok || !home.html.includes("A safer way to raise a cyber concern")) {
  throw new Error("Public home page failed.");
}

const tracking = await get("/track");
if (!tracking.response.ok || !tracking.html.includes("Private tracking key")) {
  throw new Error("Tracking page failed.");
}

const login = await get("/login");
if (!login.response.ok || !login.html.includes("Sign in securely")) {
  throw new Error("Login page failed.");
}

const dashboard = await get("/dashboard");
if (!dashboard.html.includes("url=/login") || !dashboard.html.includes("NEXT_REDIRECT")) {
  throw new Error("Dashboard authentication gate failed.");
}

console.log("Production smoke passed: health, public routes, login UI, and dashboard auth gate.");
