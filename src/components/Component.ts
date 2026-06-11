export interface Component {
  readonly componentType: string;
}

export type ComponentType<TComponent extends Component = Component> = {
  readonly componentType: string;
  readonly prototype: TComponent;
};
