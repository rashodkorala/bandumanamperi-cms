// Demo storage utilities using localStorage

const DEMO_PREFIX = "cms_demo_"

export const demoStorage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === "undefined") return defaultValue
    try {
      const item = localStorage.getItem(`${DEMO_PREFIX}${key}`)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(`${DEMO_PREFIX}${key}`, JSON.stringify(value))
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  },

  remove: (key: string): void => {
    if (typeof window === "undefined") return
    localStorage.removeItem(`${DEMO_PREFIX}${key}`)
  },

  clear: (): void => {
    if (typeof window === "undefined") return
    Object.keys(localStorage)
      .filter((key) => key.startsWith(DEMO_PREFIX))
      .forEach((key) => localStorage.removeItem(key))
  },
}

