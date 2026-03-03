export const tokens = {
  colors: {
    bg: '#FFFBF7',
    primary: '#6750A4',
    surface: '#FFFFFF',
    surfaceTint: '#FEF7FF',
    borderSoft: '#EAE6FF',
    inputBorder: '#79747E',
    inputBg: '#ECE6F0',
    text: '#1A1A1A',
    textSecondary: '#49454F',
    textMuted: '#6B6B6B',
    textOnPrimary: '#FFFFFF',
    placeholder: '#1D1B20',
    error: '#B3261E',
    toast: '#322F35',
    menuBg: '#F3EDF7',
    secondaryLight: '#DED2F9',
  },
  radii: {
    card: 16,
    pill: 999,
    button: 28,
    input: 12,
  },
  spacing: {
    screenX: 20,
    screenTop: 60,
    cardPad: 16,
    sectionGap: 24,
    fieldGap: 16,
  },
} as const;

// Re-export as speciesTokens for backward compatibility
export const speciesTokens = tokens;
