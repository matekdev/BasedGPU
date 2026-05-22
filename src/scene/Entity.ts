import type { Component } from "../components/Component";

export class Entity {
  private readonly components = new Map<string, Component>();

  constructor(readonly name: string) {}

  add<TComponent extends Component>(component: TComponent): TComponent {
    this.components.set(component.type, component);
    return component;
  }

  get<TComponent extends Component>(type: string): TComponent | undefined {
    return this.components.get(type) as TComponent | undefined;
  }

  has(type: string): boolean {
    return this.components.has(type);
  }
}
