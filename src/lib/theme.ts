export const theme = {
  colors: {
    sage50: "#f0f4f0",
    sage100: "#dce6dc",
    sage200: "#b8cdb8",
    sage500: "#527a52",
    sage600: "#3d5e3d",
    sage700: "#2e472e",
    amber: "#d97706",
    terracotta: "#c2410c",
    cream: "#fefcf3",
    warmWhite: "#faf8f5",
    stone900: "#292524",
    stone500: "#78716c",
  },
  freshness: {
    fresh: { bg: "#f0f4f0", text: "#3d5e3d", border: "#b8cdb8" },
    warning: { bg: "#fef9ee", text: "#92400e", border: "#fcd34d" },
    urgent: { bg: "#fff5f0", text: "#9a3412", border: "#fdba74" },
    expired: { bg: "#f5f0e8", text: "#78716c", border: "#d6cdc0" },
  },
  // Recharts-friendly palette
  charts: {
    consumed: "#527a52",
    wasted: "#c2410c",
    saved: "#d97706",
    categories: ["#527a52", "#d97706", "#c2410c", "#78716c", "#b8cdb8", "#fcd34d"],
  },
} as const;
