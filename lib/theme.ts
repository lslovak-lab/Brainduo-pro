export const Colors = {
  ivory:       '#EEF0DE',
  ivoryTint:   '#F6F7E9',
  ivoryDeep:   '#E2E6CB',
  sage:        '#B7CB84',
  sageSoft:    '#D2DDA9',
  sageDeep:    '#8FA764',
  sage1:       '#D9E3B4',
  sage2:       '#9DB66B',
  orange:      '#F58A3A',
  orangeSoft:  '#FFB17A',
  orangeDeep:  '#D86F1F',
  yellow:      '#EFC84A',
  yellowSoft:  '#F6DD80',
  charcoal:    '#4A4A4A',
  charcoal2:   '#6E6E6E',
  charcoal3:   '#9A9A9A',
  ink:         '#000000',
  paper:       '#FFFFFF',
  paperSoft:   '#FBFBF6',
  onDark:      '#F7F8EE',
} as const;

export const Gradients = {
  sage:    ['#D9E3B4', '#B7CB84', '#9DB66B'] as const,
  ink:     ['#1B1B1B', '#000000'] as const,
  orange:  ['#FFB17A', '#F58A3A'] as const,
  yellow:  ['#F6DD80', '#EFC84A'] as const,
  avatar:  ['#D9E3B4', '#B7CB84', '#8FA764'] as const,
  skill:   ['#F58A3A', '#EFC84A'] as const,
} as const;

export const Shadows = {
  soft: {
    shadowColor: '#232814',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  card: {
    shadowColor: '#232814',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
  tabBar: {
    shadowColor: '#232814',
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.36,
    shadowRadius: 20,
    elevation: 12,
  },
  orange: {
    shadowColor: '#F58A3A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
  },
} as const;

export const Typography = {
  display: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.34,
  },
  h1: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 24,
    lineHeight: 29,
    letterSpacing: -0.29,
  },
  h2: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.16,
  },
  h3: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18,
    lineHeight: 23,
  },
  body: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    lineHeight: 23,
    color: Colors.charcoal,
  },
  bodySm: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: Colors.charcoal2,
  },
  caption: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 12,
    lineHeight: 17,
    color: Colors.charcoal2,
    letterSpacing: 0.48,
  },
  eyebrow: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
    color: Colors.charcoal3,
  },
  label: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.44,
    color: Colors.charcoal3,
  },
  button: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
    lineHeight: 20,
  },
} as const;

export const Radius = {
  xs:   6,
  sm:   10,
  md:   16,
  lg:   22,
  xl:   28,
  xxl:  36,
  pill: 999,
} as const;
