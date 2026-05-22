export type DebugSettings = {
  paused: boolean;
  spinSpeed: number;
  triangleScale: number;
};

export function createDefaultDebugSettings(): DebugSettings {
  return {
    paused: false,
    spinSpeed: 1,
    triangleScale: 1,
  };
}
