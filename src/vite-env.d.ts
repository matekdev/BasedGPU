/// <reference types="vite/client" />

declare module "*.svelte" {
  import type { Component } from "svelte";

  const component: Component;
  export default component;

  export const badgeVariants: unknown;
  export const buttonVariants: unknown;
  export type BadgeVariant = unknown;
  export type ButtonProps = unknown;
  export type ButtonSize = unknown;
  export type ButtonVariant = unknown;
}
