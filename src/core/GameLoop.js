export class GameLoop {
    constructor(callbacks) {
        this.callbacks = {
            fixedUpdate: callbacks.fixedUpdate || (() => { }),
            update: callbacks.update || (() => { }),
            render: callbacks.render || (() => { })
        };

        this.isRunning = false;

        // Timing variables
        this.lastTime = performance.now();
        this.accumulator = 0;
        this.fixedTimeStep = 1 / 30; // 30Hz - Reduced from 60Hz to prevent heat and lag
        this.maxAccumulator = 0.25;  // To avoid spiral of death (clamp to 250ms max)

        this.animationFrameId = null;
        this.loopMethod = this.loop.bind(this);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.accumulator = 0;
        this.animationFrameId = requestAnimationFrame(this.loopMethod);
    }

    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    loop(currentTime) {
        if (!this.isRunning) return;

        // Calculate delta time in seconds
        let dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Prevent spiral of death by clamping dt
        if (dt > this.maxAccumulator) {
            dt = this.maxAccumulator;
        }

        this.accumulator += dt;

        // Fixed timestep for physics and logic that requires deterministic updates
        while (this.accumulator >= this.fixedTimeStep) {
            this.callbacks.fixedUpdate(this.fixedTimeStep);
            this.accumulator -= this.fixedTimeStep;
        }

        // Variable timestep for things that can interpolate or don't need fixed tick
        // We pass the remaining time as alpha (0 to 1) for interpolation if needed
        const alpha = this.accumulator / this.fixedTimeStep;
        this.callbacks.update(dt, alpha);

        // Render pass
        this.callbacks.render(dt, alpha);

        this.animationFrameId = requestAnimationFrame(this.loopMethod);
    }
}
