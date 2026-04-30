export default {
  async fetch(request, env) {
    if (!env.ASSETS || typeof env.ASSETS.fetch !== "function") {
      return new Response("ASSETS binding is missing from Wrangler configuration.", {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "text/plain; charset=UTF-8",
        },
      });
    }

    const url = new URL(request.url);

    return env.ASSETS.fetch(request);
  },
};
