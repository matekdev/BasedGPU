import type { Component, ComponentType } from "../components/Component";

export class Entity {
  private readonly components = new Map<string, Component>();

  constructor(readonly name: string) {}

  add<TComponent extends Component>(component: TComponent): TComponent {
    this.components.set(component.componentType, component);
    return component;
  }

  get<TComponent extends Component>(
    componentType: ComponentType<TComponent>,
  ): TComponent | undefined {
    return this.components.get(componentType.componentType) as
      | TComponent
      | undefined;
  }

  require<TComponent extends Component>(
    componentType: ComponentType<TComponent>,
  ): TComponent {
    const component = this.get(componentType);

    if (component) {
      return component;
    }

    throw new Error(
      `${this.name} is missing ${componentType.componentType} component.`,
    );
  }

  has(componentType: ComponentType): boolean {
    return this.components.has(componentType.componentType);
  }

  remove<TComponent extends Component>(
    componentType: ComponentType<TComponent>,
  ): TComponent | undefined {
    const component = this.get(componentType);

    if (!component) {
      return undefined;
    }

    this.components.delete(componentType.componentType);
    return component;
  }

  getAll(): Component[] {
    return Array.from(this.components.values());
  }
}
