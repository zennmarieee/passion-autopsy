import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f2ede3",
        ink: "#1c1a17",
        manila: "#e8ddc4",
        stamp: "#8a1f1f",
        seal: "#2f4a3c",
      },
      fontFamily: {
        mono: ["'Courier New'", "Courier", "monospace"],
        serif: ["Georgia", "'Times New Roman'", "serif"],
      },
      backgroundImage: {
        noise:
          "radial-gradient(circle at 20% 20%, rgba(0,0,0,0.02) 0%, transparent 40%), radial-gradient(circle at 80% 60%, rgba(0,0,0,0.02) 0%, transparent 40%)",
      },
    },
  },
  plugins: [],
};
export default config;
