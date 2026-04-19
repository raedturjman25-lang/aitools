export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Protect admin pages with HTTP Basic Auth.
    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
      if (!isAuthorized(request, env)) {
        return new Response("Authentication required", {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="AITools Admin", charset="UTF-8"',
            "Cache-Control": "no-store",
          },
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};

function isAuthorized(request, env) {
  const expectedUser = env.ADMIN_USER;
  const expectedPass = env.ADMIN_PASS;

  // Deny access until secrets are configured.
  if (!expectedUser || !expectedPass) {
    return false;
  }

  const authHeader = request.headers.get("Authorization") || "";
  const [scheme, encoded] = authHeader.split(" ");

  if (!scheme || !encoded || scheme.toLowerCase() !== "basic") {
    return false;
  }

  let decoded = "";
  try {
    decoded = atob(encoded);
  } catch (_error) {
    return false;
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) {
    return false;
  }

  const user = decoded.slice(0, separatorIndex);
  const pass = decoded.slice(separatorIndex + 1);

  return timingSafeEqual(user, expectedUser) && timingSafeEqual(pass, expectedPass);
}

function timingSafeEqual(a, b) {
  const x = String(a || "");
  const y = String(b || "");
  const max = Math.max(x.length, y.length);
  let mismatch = x.length === y.length ? 0 : 1;

  for (let i = 0; i < max; i += 1) {
    const xCode = i < x.length ? x.charCodeAt(i) : 0;
    const yCode = i < y.length ? y.charCodeAt(i) : 0;
    mismatch |= xCode ^ yCode;
  }

  return mismatch === 0;
}
