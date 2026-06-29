/// <reference types="vite/client" />

declare module '*?url' {
  const url: string
  export default url
}

interface ImportMetaEnv {
  readonly VITE_DATASET_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
