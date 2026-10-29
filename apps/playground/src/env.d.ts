/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_XBO_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
