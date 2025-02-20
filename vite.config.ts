import MillionLint from "@million/lint";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import vercel from "vite-plugin-vercel";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		MillionLint.vite({
			enabled: true,
		}),
		react(),
		vercel(),
	],
	define: {
		// Add process.env for Excalidraw
		"process.env": {
			NODE_ENV: JSON.stringify(process.env.NODE_ENV),
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
