import { CameraComponent } from "../components/CameraComponent";
import type { ComponentType } from "../components/Component";
import { TransformComponent } from "../components/TransformComponent";
import { Entity } from "./Entity";

export class Scene {
  private readonly entities = new Set<Entity>();

  constructor() {
    this.addDefaultCamera();
  }

  add(entity: Entity): Entity {
    this.entities.add(entity);
    return entity;
  }

  findEntities(...componentTypes: ComponentType[]): Entity[] {
    return Array.from(this.entities).filter((entity) =>
      componentTypes.every((componentType) => entity.has(componentType)),
    );
  }

  getEntities(): Entity[] {
    return Array.from(this.entities);
  }

  private addDefaultCamera(): void {
    const camera = new Entity("Camera");
    const transform = camera.add(new TransformComponent());
    transform.position[2] = 2;
    camera.add(new CameraComponent());
    this.add(camera);
  }
}
