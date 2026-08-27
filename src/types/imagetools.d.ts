/**
 * Ambient declarations for `vite-imagetools` import specifiers.
 *
 * This file must stay free of top-level `import`/`export` statements: a module
 * would turn these into augmentations rather than global wildcard declarations.
 * Types are pulled in with inline `import(...)` type syntax instead.
 *
 * These replace the `// @ts-expect-error: img` comment that previously sat above
 * every single image import.
 */

declare module '*as=picture' {
  const picture: import('./images').PictureData
  export default picture
}

declare module '*as=srcset' {
  const srcset: string
  export default srcset
}
