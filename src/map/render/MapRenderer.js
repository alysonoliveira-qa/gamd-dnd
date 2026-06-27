import { Application, Container, Graphics } from "pixi.js";
import { colorFor } from "./theme.js";

export class MapRenderer {
  constructor() {
    this.app = null;
    this._destroyed = false;
    this.world = null;
    this.tileSize = 22;
    this._drag = null;
  }

  async init(hostEl) {
    const app = new Application();
    this.app = app;
    await app.init({
      background: "#0d0b10",
      resizeTo: hostEl,
      antialias: true,
    });
    // If destroy() ran while init() was awaiting, tear down and bail.
    if (this._destroyed) {
      app.destroy(true, { children: true });
      if (this.app === app) this.app = null;
      return;
    }
    hostEl.appendChild(app.canvas);
    this.world = new Container();
    app.stage.addChild(this.world);
    this._setupInteraction(hostEl);
  }

  render(model) {
    if (!this.world) return;
    this.world.removeChildren();
    if (!model) return;

    const ts = this.tileSize;

    const terrain = new Graphics();
    for (let y = 0; y < model.h; y++) {
      for (let x = 0; x < model.w; x++) {
        const t = model.tiles[y * model.w + x];
        terrain.rect(x * ts, y * ts, ts, ts).fill(colorFor(t));
      }
    }

    const grid = new Graphics();
    for (let x = 0; x <= model.w; x++) {
      grid.moveTo(x * ts, 0).lineTo(x * ts, model.h * ts);
    }
    for (let y = 0; y <= model.h; y++) {
      grid.moveTo(0, y * ts).lineTo(model.w * ts, y * ts);
    }
    grid.stroke({ width: 1, color: 0x000000, alpha: 0.25 });

    this.world.addChild(terrain);
    this.world.addChild(grid);
    this._center(model);
  }

  _center(model) {
    const ts = this.tileSize;
    const sw = this.app.screen.width;
    const sh = this.app.screen.height;
    this.world.x = (sw - model.w * ts) / 2;
    this.world.y = (sh - model.h * ts) / 2;
  }

  _setupInteraction(hostEl) {
    // Pan via arraste
    hostEl.addEventListener("pointerdown", (e) => {
      this._drag = { x: e.clientX, y: e.clientY, wx: this.world.x, wy: this.world.y };
    });
    this._onPointerUp = () => {
      this._drag = null;
    };
    this._onPointerMove = (e) => {
      if (!this._drag || !this.world) return;
      this.world.x = this._drag.wx + (e.clientX - this._drag.x);
      this.world.y = this._drag.wy + (e.clientY - this._drag.y);
    };
    window.addEventListener("pointerup", this._onPointerUp);
    window.addEventListener("pointermove", this._onPointerMove);
    // Zoom via roda
    hostEl.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        const next = Math.min(3, Math.max(0.3, this.world.scale.x * factor));
        this.world.scale.set(next);
      },
      { passive: false }
    );
  }

  destroy() {
    this._destroyed = true;
    if (this._onPointerUp) window.removeEventListener("pointerup", this._onPointerUp);
    if (this._onPointerMove) window.removeEventListener("pointermove", this._onPointerMove);
    this._drag = null;
    // Only destroy a fully-initialized app (world is set only after init completes).
    if (this.world) {
      this.app.destroy(true, { children: true });
    }
    this.app = null;
    this.world = null;
  }
}
