// ═══════════════════════════════════════════════════════════════
// LOGGER PËR SEED SCRIPTS
// Të gjitha log-et kalojnë nga këtu për konsistencë
// ═══════════════════════════════════════════════════════════════

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

export const log = {
  header(title: string) {
    console.log('')
    console.log(COLORS.cyan + '═'.repeat(58) + COLORS.reset)
    console.log(COLORS.cyan + `  ${title}` + COLORS.reset)
    console.log(COLORS.cyan + '═'.repeat(58) + COLORS.reset)
    console.log('')
  },

  section(title: string) {
    console.log('')
    console.log(COLORS.blue + '─'.repeat(58) + COLORS.reset)
    console.log(COLORS.blue + `  ${title}` + COLORS.reset)
    console.log(COLORS.blue + '─'.repeat(58) + COLORS.reset)
  },

  success(message: string) {
    console.log(`${COLORS.green}✅ ${message}${COLORS.reset}`)
  },

  warn(message: string) {
    console.log(`${COLORS.yellow}⚠️  ${message}${COLORS.reset}`)
  },

  error(message: string) {
    console.log(`${COLORS.red}❌ ${message}${COLORS.reset}`)
  },

  info(message: string) {
    console.log(`${COLORS.cyan}ℹ️  ${message}${COLORS.reset}`)
  },

  item(message: string) {
    console.log(`   ${message}`)
  },

  done(durationMs: number) {
    const seconds = (durationMs / 1000).toFixed(2)
    console.log('')
    console.log(COLORS.green + '═'.repeat(58) + COLORS.reset)
    console.log(COLORS.green + `  ✅ PËRFUNDOI NË ${seconds}s` + COLORS.reset)
    console.log(COLORS.green + '═'.repeat(58) + COLORS.reset)
    console.log('')
  },
}