import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import fs from "fs";
import path from "path";
import child_process from "child_process";
import { env } from "process";

// ----------------------------
// HTTPS CERT (ASP.NET DEV ONLY)
// ----------------------------
const baseFolder =
  env.APPDATA !== undefined && env.APPDATA !== ""
    ? `env.APPDATA/ASP.NET/https`
    : `env.HOME/.aspnet/https`;

const certificateName = "Taskmaster.Server";
const certFilePath = path.join(baseFolder, `certificateName.pem`);
const keyFilePath = path.join(baseFolder, `certificateName.key`);

if (!fs.existsSync(baseFolder)) {
  fs.mkdirSync(baseFolder, { recursive: true });
}

if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
  const result = child_process.spawnSync(
    "dotnet",
    [
      "dev-certs",
      "https",
      "--export-path",
      certFilePath,
      "--format",
      "Pem",
      "--no-password",
    ],
    { stdio: "inherit" }
  );

  if (result.status !== 0) {
    throw new Error("Could not create development certificate.");
  }
}

// ----------------------------
// BACKEND TARGET
// ----------------------------
const target = env.ASPNETCORE_HTTPS_PORT
  ? `https://localhost:env.ASPNETCORE_HTTPS_PORT`
  : env.ASPNETCORE_URLS
  ? env.ASPNETCORE_URLS.split(";")[0]
  : "http://localhost:5137";

// ----------------------------
// VITE CONFIG
// ----------------------------
function normalizeBasePath(value) {
  if (!value) return "/";
  const withLeadingSlash = value.startsWith("/") ? value : `/value`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `withLeadingSlash/`;
}

export default defineConfig({
  plugins: [react(), tailwindcss()],

  base: normalizeBasePath(env.VITE_BASE_PATH),

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  server: {
    // Keep this default in sync with SpaProxyServerUrl in the server project.
    port: parseInt(env.DEV_SERVER_PORT || "53968"),

    proxy: {
      // All API calls go through ASP.NET backend
      "/api": {
        target,
        secure: false,
        changeOrigin: true,
      },
    },
  },
});
