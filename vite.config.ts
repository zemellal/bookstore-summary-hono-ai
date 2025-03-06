import build from "@hono/vite-build/cloudflare-pages";
import pages from "@hono/vite-cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import adapter from "@hono/vite-dev-server/cloudflare";
import { defineConfig } from "vite";

// export default defineConfig({
// 	plugins: [
// 		devServer({
// 			entry: "src/index.tsx",
// 			adapter,
// 		}),
// 		build(),
// 	],
// });

export default defineConfig(({ mode }) => {
	if (mode === "client") {
		return {
			build: {
				rollupOptions: {
					input: {
						client: "./src/client.ts",
						style: "./src/style.css", // Add CSS as an entry point
					},
					output: {
						// entryFileNames: "static/client.js",
						entryFileNames: "static/[name].js",
						assetFileNames: "static/[name].[ext]",
					},
				},
			},
		};
	}
	return {
		plugins: [
			devServer({
				entry: "src/index.tsx",
				adapter,
				// Add CSS handling for dev server
				injectClientScript: true,
			}),
			pages(),
		],
		// Configure CSS handling for development
		css: {
			devSourcemap: true,
		},
		// Ensure public directory is watched
		server: {
			watch: {
				ignored: ["!**/public/**"],
			},
		},
	};
});
