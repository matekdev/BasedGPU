export interface Component {
  readonly componentType: string;
}

export type ComponentInspectorAxis = {
  label: string;
  getValue: () => number;
  setValue: (value: number) => void;
};

export type ComponentInspectorField = {
  type: "vector3";
  label: string;
  axes: [ComponentInspectorAxis, ComponentInspectorAxis, ComponentInspectorAxis];
  step?: number;
};

export interface InspectableComponent extends Component {
  getInspectorFields(): ComponentInspectorField[];
}

export type ComponentType<TComponent extends Component = Component> = {
  readonly componentType: string;
  readonly prototype: TComponent;
};

export function isInspectableComponent(
  component: Component,
): component is InspectableComponent {
  return "getInspectorFields" in component;
}
