/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;\n  readonly VITE_HERO_VIDEO_SRC?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
