declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_GOOGLE_CALENDAR_API_KEY: string;
      VITE_GOOGLE_COMMON_CALENDAR_ID: string;
      VITE_GOOGLE_DEADLINES_CALENDAR_ID: string;
    }
  }
}

export {}