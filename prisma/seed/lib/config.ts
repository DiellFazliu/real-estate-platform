// ═══════════════════════════════════════════════════════════════
// KONFIGURIMI I PËRBASHKËT PËR TË GJITHA SEED-AT
// ═══════════════════════════════════════════════════════════════

export const SEED_CONFIG = {
  // Përdoruesit bazë (krijohen nga seed.ts)
  USERS: {
    ADMIN: 'admin@villaron.com',
    OWNER: 'owner@villaron.com',
    AGENT: 'agent@villaron.com',
    USER: 'user@villaron.com',
    SELLER: 'seller@villaron.com',
  },

  // Fjalëkalimi standard për të gjithë përdoruesit e seed-uar
  DEFAULT_PASSWORD: 'Villaron123!',

  // Numri i pronave që krijohen në seed-properties
  TOTAL_PROPERTIES: 1000,

  // Madhësia e batch-it për insertim
  BATCH_SIZE: 100,

  // Numri i agjentëve që krijohen
  TOTAL_AGENTS: 20,

  // Sezoni për të cilin gjenerohen të dhënat
  DATA_START_YEAR: 2024,
} as const