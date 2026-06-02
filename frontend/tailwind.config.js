/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mundial: {
          navy: "#0B1B3A",
          blue: "#0057B8",
          sky: "#00A3E0",
          green: "#00843D",
          lime: "#00B140",
          red: "#E03C31",
          gold: "#F8C537",
          cream: "#FFF7E6",
          light: "#F5F8FC",
          card: "#FFFFFF",
          text: "#14213D",
          muted: "#667085",
          line: "#D8E2F0",
          greenSoft: "#E7F7EF",
          blueSoft: "#EAF3FF",
          redSoft: "#FDEDEC",
          goldSoft: "#FFF4CC",
          dark: "#07152F",
          grass: "#006B35",
          redLight: "#F0564A",
          greenLight: "#08A956",
        },
      },
      boxShadow: {
        mundial: "0 24px 70px rgba(11, 27, 58, 0.14)",
        mundialDark: "0 26px 70px rgba(7, 21, 47, 0.32)",
        mundialRed: "0 18px 44px rgba(224, 60, 49, 0.24)",
        mundialGreen: "0 18px 44px rgba(0, 132, 61, 0.24)",
        mundialGold: "0 18px 44px rgba(248, 197, 55, 0.26)",
      },
      backgroundImage: {
        "mundial-hero": "radial-gradient(circle at 18% 18%, rgba(0,163,224,0.24), transparent 28%), radial-gradient(circle at 86% 18%, rgba(248,197,55,0.30), transparent 24%), radial-gradient(circle at 82% 82%, rgba(0,132,61,0.25), transparent 28%), linear-gradient(135deg, #F5F8FC 0%, #FFFFFF 42%, #EAF3FF 100%)",
        "mundial-stadium": "radial-gradient(circle at 20% 0%, rgba(0,163,224,0.35), transparent 28%), radial-gradient(circle at 90% 12%, rgba(224,60,49,0.28), transparent 23%), linear-gradient(135deg, #0B1B3A 0%, #0057B8 56%, #00843D 100%)",
        "mundial-sidebar": "radial-gradient(circle at 18% 8%, rgba(0,163,224,0.25), transparent 24%), radial-gradient(circle at 95% 18%, rgba(248,197,55,0.16), transparent 24%), linear-gradient(180deg, #0B1B3A 0%, #07152F 100%)",
        "mundial-stripe": "linear-gradient(90deg, #00843D 0 25%, #FFFFFF 25% 36%, #F8C537 36% 64%, #FFFFFF 64% 75%, #E03C31 75% 100%)",
        "mundial-field": "linear-gradient(135deg, rgba(0,132,61,0.95), rgba(0,107,53,0.95)), repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 76px)",
      },
    },
  },
  plugins: [],
}
