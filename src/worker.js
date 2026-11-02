// Each page is built to dist/<page>/index.html (the home page to dist/index.html).
const pageRoutes = new Set([
  "/",
  "/about",
  "/clients",
  "/work",
  "/crew",
  "/news",
  "/contact"
]);

// Older links that pointed at a section of the former one-page site.
const redirects = {
  "/locations": "/contact#locations"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === "scootermedia.co") {
      url.hostname = "www.scootermedia.co";
      return Response.redirect(url.toString(), 301);
    }

    const route = url.pathname.replace(/\/$/, "") || "/";

    if (redirects[route]) {
      return Response.redirect(new URL(redirects[route], url).toString(), 301);
    }

    if (pageRoutes.has(route)) {
      // One URL per page: /about/ → /about
      if (url.pathname !== route) {
        url.pathname = route;
        return Response.redirect(url.toString(), 301);
      }

      if (request.method === "GET" || request.method === "HEAD") {
        const file = route === "/" ? "/index.html" : `${route}/index.html`;
        return env.ASSETS.fetch(new Request(new URL(file, url), request));
      }
    }

    return env.ASSETS.fetch(request);
  }
};
