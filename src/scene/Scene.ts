import type { Entity } from "./Entity";

export class Scene {
  private readonly entities = new Set<Entity>();

  add(entity: Entity): Entity {
    this.entities.add(entity);
    return entity;
  }

  findEntities(...componentTypes: string[]): Entity[] {
    return Array.from(this.entities).filter((entity) =>
      componentTypes.every((componentType) => entity.has(componentType)),
    );
  }
}
