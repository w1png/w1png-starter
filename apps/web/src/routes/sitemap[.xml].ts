import { createFileRoute } from "@tanstack/react-router";
import { SitemapStream, streamToPromise } from "sitemap";

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: async () => {
				const sm = new SitemapStream({
					hostname: import.meta.env.VITE_FRONTEND_URL,
				});

				sm.write({
					url: "/",
					changefreq: "monthly",
					priority: 1.0,
				});

				sm.end();

				const xml = await streamToPromise(sm).then((data) => data.toString());

				return new Response(xml, {
					status: 200,
					headers: {
						"Content-Type": "application/xml",
						"Cache-Control": "public, max-age=86400",
					},
				});
			},
		},
	},
});
