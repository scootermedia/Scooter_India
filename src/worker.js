const sectionRoutes = new Set([
  "/",
  "/about",
  "/clients",
  "/work",
  "/crew",
  "/news",
  "/contact",
  "/locations"
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === "scootermedia.co") {
      url.hostname = "www.scootermedia.co";
      return Response.redirect(url.toString(), 301);
    }

    const route = url.pathname.replace(/\/$/, "") || "/";

    if ((request.method === "GET" || request.method === "HEAD") && sectionRoutes.has(route)) {
      const indexUrl = new URL("/index.html", url);
      return env.ASSETS.fetch(new Request(indexUrl, request));
    }

    return env.ASSETS.fetch(request);
  }
};
