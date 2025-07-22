export const SKILL_LEVELS = [
  { value: 'beginner', label: '初級' },
  { value: 'intermediate', label: '中級' },
  { value: 'advanced', label: '上級' }
] as const

export type SkillLevel = typeof SKILL_LEVELS[number]['value']