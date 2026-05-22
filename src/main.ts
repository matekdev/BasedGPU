import "./styles.css";
import { Application } from "./runtime/Application";
import { Entity } from "./scene/Entity";
import { Scene } from "./scene/Scene";
import { MeshComponent } from "./components/MeshComponent";
import { TransformComponent } from "./components/TransformComponent";

const appElement = document.querySelector<HTMLDivElement>("#app");

if (!appElement) {
  throw new Error("App root not found.");
}

const canvas = document.createElement("canvas");
canvas.className = "viewport";
appElement.append(canvas);

const scene = new Scene();

const triangle = new Entity("Triangle");
triangle.add(new TransformComponent());
triangle.add(MeshComponent.triangle());
scene.add(triangle);

const application = new Application(canvas, scene);
application.start();
