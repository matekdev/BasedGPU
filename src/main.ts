import { mount } from "svelte";
import App from "./App.svelte";

const appElement = document.querySelector<HTMLDivElement>("#app");

if (!appElement) {
  throw new Error("App root not found.");
}

mount(App, {
  target: appElement,
});
