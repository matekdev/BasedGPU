import "./styles.css";
import { Application } from "./runtime/Application";
import { Entity } from "./scene/Entity";
import { Scene } from "./scene/Scene";
import { SpinSystem } from "./systems/SpinSystem";
import { MeshComponent } from "./components/MeshComponent";
import { TransformComponent } from "./components/TransformComponent";
import { createDefaultDebugSettings } from "./debug/DebugSettings";
import { DebugPanel } from "./debug/DebugPanel";

const appElement = document.querySelector<HTMLDivElement>("#app");

if (!appElement) {
  throw new Error("App root not found.");
}

const canvas = document.createElement("canvas");
canvas.className = "viewport";
appElement.append(canvas);

const debugSettings = createDefaultDebugSettings();
const scene = new Scene();
scene.addSystem(new SpinSystem(debugSettings));

const triangle = new Entity("Triangle");
const triangleTransform = triangle.add(new TransformComponent());
triangle.add(MeshComponent.triangle());
scene.add(triangle);

new DebugPanel(debugSettings, triangleTransform);

const application = new Application(canvas, scene);
application.start();
