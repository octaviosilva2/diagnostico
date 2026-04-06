import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        foreground: "#ffffff",
        secondary: "#a0a0b0",
        primary: "#6366f1",
        card: "#13131a",
        border: "#2a2a3a",
      },
      fontSize: {
        'title': '36px',
        'question': '22px',
        'option': '18px',
        'placeholder': '15px',
      },
      spacing: {
        'spacer': '2rem',
      }
    },
  },
  plugins: [],
};
export default config;
