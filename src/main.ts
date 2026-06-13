import "./styles.css";
import { loadGltfEntities } from "./assets/GltfLoader";
import { engineConsole } from "./runtime/EngineConsole";
import { Application } from "./runtime/Application";
import { Scene } from "./scene/Scene";

const appElement = document.querySelector<HTMLDivElement>("#app");

if (!appElement) {
  throw new Error("App root not found.");
}

const canvasElement = document.createElement("canvas");
canvasElement.className = "viewport";
appElement.append(canvasElement);

async function bootstrap(): Promise<void> {
  const scene = new Scene();
  const application = new Application(canvasElement, scene);

  try {
    const entities = await loadGltfEntities("/assets/models/box.glb");

    for (const entity of entities) {
      scene.add(entity);
    }
  } catch (error) {
    engineConsole.error("Failed to load glTF scene", "main", error);
  }

  await application.start();
}

void bootstrap();
