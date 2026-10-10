import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#14110f", paper: "#f6f2ea", accent: "#d9461f", line: "#dcd5c6" },
    },
  },
  plugins: [],
};
export default config;
