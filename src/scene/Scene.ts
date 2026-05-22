import type { Entity } from "./Entity";
import type { System } from "../systems/System";

export class Scene {
  private readonly entities = new Set<Entity>();
  private readonly systems: System[] = [];

  add(entity: Entity): Entity {
    this.entities.add(entity);
    return entity;
  }

  addSystem(system: System): System {
    this.systems.push(system);
    return system;
  }

  update(deltaTime: number): void {
    for (const system of this.systems) {
      system.update(this, deltaTime);
    }
  }

  findEntities(...componentTypes: string[]): Entity[] {
    return Array.from(this.entities).filter((entity) =>
      componentTypes.every((componentType) => entity.has(componentType)),
    );
  }
}
