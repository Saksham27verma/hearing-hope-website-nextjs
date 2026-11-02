import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/lib/{automation,generation,decisions,jobs,reports,leads,notifications,supabase}/**/*.test.ts"],
    pool: "threads",
    maxWorkers: 1,
    reporters: ["default"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
