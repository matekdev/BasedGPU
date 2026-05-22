import type { Scene } from "../scene/Scene";
import { CameraComponent } from "../components/CameraComponent";
import { TransformComponent } from "../components/TransformComponent";
import { radiansToDegrees } from "../math/angles";

const maxPitch = 90 - 0.01 * radiansToDegrees;

export class CameraController {
  private readonly pressedKeys = new Set<string>();
  private readonly velocity = new Float32Array(3);
  private isNavigating = false;
  private hasTargetRotation = false;
  private pendingLookPitch = 0;
  private pendingLookYaw = 0;
  private targetPitch = 0;
  private targetYaw = 0;
  private lookSmoothing = 24;
  private movementSmoothing = 12;
  private moveSpeed = 3;
  private mouseSensitivity = 0.002 * radiansToDegrees;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly scene: Scene,
  ) {
    canvas.addEventListener("contextmenu", this.preventContextMenu);
    canvas.addEventListener("mousedown", this.handleMouseDown);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    window.addEventListener("mouseup", this.handleMouseUp);
    window.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("pointerlockchange", this.handlePointerLockChange);
  }

  update(deltaSeconds: number): void {
    const cameraEntity = this.scene.findEntities(
      CameraComponent,
      TransformComponent,
    )[0];

    if (!cameraEntity) {
      return;
    }

    const transform = cameraEntity.require(TransformComponent);
    this.updateLook(transform, deltaSeconds);
    this.updateMovement(transform, deltaSeconds);
  }

  private updateMovement(
    transform: TransformComponent,
    deltaSeconds: number,
  ): void {
    const forward = transform.getForwardDirection();
    const right = transform.getRightDirection();
    const targetVelocity = new Float32Array(3);

    if (!this.isNavigating) {
      lerpVelocity(
        this.velocity,
        targetVelocity,
        1 - Math.exp(-this.movementSmoothing * deltaSeconds),
      );
      move(transform.position, this.velocity, deltaSeconds);
      return;
    }

    if (this.pressedKeys.has("KeyW")) {
      addDirection(targetVelocity, forward, 1);
    }

    if (this.pressedKeys.has("KeyS")) {
      addDirection(targetVelocity, forward, -1);
    }

    if (this.pressedKeys.has("KeyD")) {
      addDirection(targetVelocity, right, 1);
    }

    if (this.pressedKeys.has("KeyA")) {
      addDirection(targetVelocity, right, -1);
    }

    if (this.pressedKeys.has("Space")) {
      targetVelocity[1] += 1;
    }

    if (
      this.pressedKeys.has("ControlLeft") ||
      this.pressedKeys.has("ControlRight")
    ) {
      targetVelocity[1] -= 1;
    }

    normalize(targetVelocity);
    scale(targetVelocity, this.getMoveSpeed());
    lerpVelocity(
      this.velocity,
      targetVelocity,
      1 - Math.exp(-this.movementSmoothing * deltaSeconds),
    );
    move(transform.position, this.velocity, deltaSeconds);
  }

  private updateLook(
    transform: TransformComponent,
    deltaSeconds: number,
  ): void {
    if (!this.hasTargetRotation) {
      this.targetPitch = transform.rotation[0];
      this.targetYaw = transform.rotation[1];
      this.hasTargetRotation = true;
    }

    this.targetYaw += this.pendingLookYaw;
    this.targetPitch += this.pendingLookPitch;
    this.targetPitch = clamp(this.targetPitch, -maxPitch, maxPitch);
    this.pendingLookYaw = 0;
    this.pendingLookPitch = 0;

    const amount = 1 - Math.exp(-this.lookSmoothing * deltaSeconds);
    transform.rotation[1] = lerp(transform.rotation[1], this.targetYaw, amount);
    transform.rotation[0] = lerp(
      transform.rotation[0],
      this.targetPitch,
      amount,
    );
  }

  private readonly handleMouseDown = (event: MouseEvent): void => {
    if (event.button !== 2) {
      return;
    }

    event.preventDefault();
    this.isNavigating = true;
    this.canvas.requestPointerLock();
  };

  private readonly handleMouseUp = (event: MouseEvent): void => {
    if (event.button !== 2) {
      return;
    }

    this.isNavigating = false;
    this.pressedKeys.clear();

    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock();
    }
  };

  private readonly preventContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
  };

  private readonly handlePointerLockChange = (): void => {
    if (document.pointerLockElement === this.canvas) {
      return;
    }

    this.isNavigating = false;
    this.pressedKeys.clear();
  };

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.isNavigating) {
      return;
    }

    this.pressedKeys.add(event.code);
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    this.pressedKeys.delete(event.code);
  };

  private readonly handleMouseMove = (event: MouseEvent): void => {
    if (document.pointerLockElement !== this.canvas) {
      return;
    }

    this.pendingLookYaw += event.movementX * this.mouseSensitivity;
    this.pendingLookPitch -= event.movementY * this.mouseSensitivity;
  };

  private getMoveSpeed(): number {
    if (
      this.pressedKeys.has("ShiftLeft") ||
      this.pressedKeys.has("ShiftRight")
    ) {
      return this.moveSpeed * 3;
    }

    return this.moveSpeed;
  }
}

function move(
  position: Float32Array,
  velocity: Float32Array,
  deltaSeconds: number,
): void {
  position[0] += velocity[0] * deltaSeconds;
  position[1] += velocity[1] * deltaSeconds;
  position[2] += velocity[2] * deltaSeconds;
}

function addDirection(
  target: Float32Array,
  direction: Float32Array,
  amount: number,
): void {
  target[0] += direction[0] * amount;
  target[1] += direction[1] * amount;
  target[2] += direction[2] * amount;
}

function normalize(vector: Float32Array): void {
  const length = Math.hypot(vector[0], vector[1], vector[2]);

  if (length === 0) {
    return;
  }

  vector[0] /= length;
  vector[1] /= length;
  vector[2] /= length;
}

function scale(vector: Float32Array, amount: number): void {
  vector[0] *= amount;
  vector[1] *= amount;
  vector[2] *= amount;
}

function lerpVelocity(
  velocity: Float32Array,
  targetVelocity: Float32Array,
  amount: number,
): void {
  velocity[0] += (targetVelocity[0] - velocity[0]) * amount;
  velocity[1] += (targetVelocity[1] - velocity[1]) * amount;
  velocity[2] += (targetVelocity[2] - velocity[2]) * amount;
}

function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}
