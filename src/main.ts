import "./styles.css";
import { MeshComponent } from "./components/MeshComponent";
import { TransformComponent } from "./components/TransformComponent";
import { Application } from "./runtime/Application";
import { Entity } from "./scene/Entity";
import { Scene } from "./scene/Scene";

const appElement = document.querySelector<HTMLDivElement>("#app");

if (!appElement) {
  throw new Error("App root not found.");
}

const canvasElement = document.createElement("canvas");
canvasElement.className = "viewport";
appElement.append(canvasElement);

const scene = new Scene();
const triangle = new Entity("Triangle");

triangle.add(new TransformComponent());
triangle.add(MeshComponent.triangle());
scene.add(triangle);

const application = new Application(canvasElement, scene);
void application.start();
