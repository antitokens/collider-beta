import { useEffect, useRef, useState } from "react";

export const ParticleCollision = ({
  width = 800,
  height = 600,
  speed = 1,
  maxLoops = 1,
  onComplete = () => {},
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const loopCount = useRef(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });

    // 3D perspective settings
    const perspective = 400;
    const cameraHeight = 200;
    const cameraDistance = 500;

    class Particle {
      constructor(x, y, z, color, radius, velocity) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.color = color;
        this.radius = radius;
        this.velocity = velocity;
        this.alpha = 1;
        this.trail = [];
        this.maxTrailLength = radius === 2.5 ? 60 : 20; // Longer trails for smaller particles
      }

      project() {
        // Add safety check for perspective calculation
        const totalZ = perspective + this.z + cameraDistance;
        const scale = totalZ <= 0 ? 0.1 : perspective / totalZ;

        const x2d = this.x * scale + canvas.width / 2;
        const y2d = (this.y - cameraHeight) * scale + canvas.height / 2;
        return {
          x: isFinite(x2d) ? x2d : canvas.width / 2,
          y: isFinite(y2d) ? y2d : canvas.height / 2,
          scale: isFinite(scale) ? scale : 0.1,
        };
      }

      // Replace the draw method with:
      draw(ctx) {
        const proj = this.project();

        if (this.radius <= 4) {
          // For small explosion particles
          // Draw longer trail with safety checks
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          this.trail.forEach((pos, index) => {
            if (isFinite(pos.x) && isFinite(pos.y)) {
              if (index === 0) {
                ctx.moveTo(pos.x, pos.y);
              } else {
                ctx.lineTo(pos.x, pos.y);
              }
            }
          });
          ctx.stroke();
          ctx.globalAlpha = 1;

          // Draw small point
          ctx.beginPath();
          ctx.fillStyle = this.color;
          ctx.arc(
            proj.x,
            proj.y,
            Math.max(0.1, this.radius * proj.scale),
            0,
            Math.PI * 2
          );
          ctx.fill();
        } else {
          // For large incoming particles
          // Draw shorter trail
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          this.trail.forEach((pos, index) => {
            if (isFinite(pos.x) && isFinite(pos.y)) {
              ctx.globalAlpha = 1;
              if (index === 0) {
                ctx.moveTo(pos.x, pos.y);
              } else {
                ctx.lineTo(pos.x, pos.y);
              }
            }
          });
          ctx.stroke();
          ctx.globalAlpha = 1;

          // Safe radius calculations
          const haloRadius = Math.max(0.1, this.radius * 2 * proj.scale);
          const particleRadius = Math.max(0.1, this.radius * proj.scale);

          // Draw larger halo
          try {
            const gradient = ctx.createRadialGradient(
              proj.x,
              proj.y,
              0,
              proj.x,
              proj.y,
              haloRadius
            );
            gradient.addColorStop(0, `${this.color}`);
            gradient.addColorStop(0.5, `${this.color}88`);
            gradient.addColorStop(1, `${this.color}00`);

            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(proj.x, proj.y, haloRadius, 0, Math.PI * 2);
            ctx.fill();
          } catch (e) {
            ctx.beginPath();
            ctx.fillStyle = this.color + "44";
            ctx.arc(proj.x, proj.y, haloRadius, 0, Math.PI * 2);
            ctx.fill();
          }

          // Draw particle
          ctx.beginPath();
          ctx.fillStyle = this.color;
          ctx.arc(proj.x, proj.y, particleRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      update() {
        const proj = this.project();
        if (isFinite(proj.x) && isFinite(proj.y)) {
          this.trail.unshift({ x: proj.x, y: proj.y });
          if (this.trail.length > 20) {
            this.trail.pop();
          }
        }

        this.x += this.velocity.x * (speed * 2);
        this.y += this.velocity.y * (speed * 2);
        this.z += this.velocity.z * (speed * 2);
        this.alpha *= 0.99;
      }
    }

    let particles = [];
    let explosionParticles = [];
    let hasCollided = false;

    const resetAnimation = () => {
      particles = [
        new Particle(-900, 0, 0, "#D13800", 2.5, { x: 6, y: 0, z: 0 }),
        new Particle(900, 0, 0, "#00CC8E", 2.5, { x: -6, y: 0, z: 0 }),
      ];
      explosionParticles = [];
      hasCollided = false;
    };

    const createExplosion = () => {
      const numParticles = 50;
      const colors = [
        "#FFFFFF",
        "#E8E8E8",
        "#B0C4DE",
        "#87CEEB",
        "#4682B4",
        "#D3D3D3",
      ];

      for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        const size = 2; // Smaller explosion particles

        explosionParticles.push(
          new Particle(
            0,
            0,
            0,
            colors[Math.floor(Math.random() * colors.length)],
            size,
            {
              x: Math.cos(angle) * speed,
              y: Math.sin(angle) * speed,
              z: (Math.random() - 0.5) * speed,
            }
          )
        );
      }

      particles = [];
    };

    const animate = () => {
      if (!isRunning) return;

      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw(ctx);
      });

      if (
        !hasCollided &&
        particles.length === 2 &&
        Math.abs(particles[0].x - particles[1].x) < 30 &&
        Math.abs(particles[0].y - particles[1].y) < 30
      ) {
        hasCollided = true;
        createExplosion();
      }

      explosionParticles = explosionParticles.filter(
        (particle) => particle.alpha > 0.1
      );
      explosionParticles.forEach((particle) => {
        particle.update();
        particle.draw(ctx);
      });

      if (explosionParticles.length === 0 && hasCollided) {
        loopCount.current++;

        if (loopCount.current >= maxLoops) {
          setIsRunning(false);
          onComplete();
          return;
        }

        resetAnimation();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resetAnimation();
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [speed, maxLoops, isRunning, onComplete]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
};

export const ParticleInversion = ({
  width = 800,
  height = 600,
  speed = 1,
  maxLoops = 1,
  onComplete = () => {},
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const loopCount = useRef(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });

    // 3D perspective settings
    const perspective = 400;
    const cameraHeight = 200;
    const cameraDistance = 500;

    // Match the end distance from forward animation (600)
    const SPAWN_RADIUS = 300;
    const PARTICLE_SEPARATION = 1500;

    class Particle {
      constructor(x, y, z, color, radius, velocity) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.color = color;
        this.radius = radius;
        this.velocity = velocity;
        this.alpha = 1;
        this.trail = [];
        this.maxTrailLength = radius === 2.5 ? 60 : 20;
      }

      project() {
        const scale = perspective / (perspective + this.z + cameraDistance);
        const x2d = this.x * scale + canvas.width / 2;
        const y2d = (this.y - cameraHeight) * scale + canvas.height / 2;
        return { x: x2d, y: y2d, scale };
      }

      draw(ctx) {
        const proj = this.project();

        // Draw trail
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        this.trail.forEach((pos, index) => {
          if (index === 0) {
            ctx.moveTo(pos.x, pos.y);
          } else {
            ctx.lineTo(pos.x, pos.y);
          }
        });
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Draw halo
        const gradient = ctx.createRadialGradient(
          proj.x,
          proj.y,
          0,
          proj.x,
          proj.y,
          this.radius * 2 * proj.scale
        );
        gradient.addColorStop(0, `${this.color}`);
        gradient.addColorStop(0.5, `${this.color}88`);
        gradient.addColorStop(1, `${this.color}00`);

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(proj.x, proj.y, this.radius * 2 * proj.scale, 0, Math.PI * 2);
        ctx.fill();

        // Draw particle
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(proj.x, proj.y, this.radius * proj.scale, 0, Math.PI * 2);
        ctx.fill();
      }

      update() {
        const proj = this.project();
        this.trail.unshift({ x: proj.x, y: proj.y });
        if (this.trail.length > this.maxTrailLength) {
          this.trail.pop();
        }

        this.x += this.velocity.x * (speed * 2);
        this.y += this.velocity.y * (speed * 2);
        this.z += this.velocity.z * (speed * 2);
        this.alpha *= 0.99;
      }

      distanceTo(other) {
        return Math.sqrt(
          Math.pow(this.x - other.x, 2) +
            Math.pow(this.y - other.y, 2) +
            Math.pow(this.z - other.z, 2)
        );
      }
    }

    let particles = [];
    let mainParticles = [];
    let hasCollided = false;
    let collisionPoint = { x: 0, y: 0, z: 0 };

    const createRandomParticles = () => {
      particles = [];
      hasCollided = false;
      const numParticles = 25;

      // Calculate spawn sphere based on PARTICLE_SEPARATION
      const radius = PARTICLE_SEPARATION / 2;

      for (let i = 0; i < numParticles; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        // Calculate velocity vector to center
        const totalDistance = Math.sqrt(x * x + y * y + z * z);
        const speed = 3;
        const vx = (-x / totalDistance) * speed;
        const vy = (-y / totalDistance) * speed;
        const vz = (-z / totalDistance) * speed;

        particles.push(
          new Particle(
            x,
            y,
            z,
            ["#FFFFFF", "#E8E8E8", "#B0C4DE", "#87CEEB", "#4682B4", "#D3D3D3"][
              Math.floor(Math.random() * 6)
            ],
            2,
            { x: vx, y: vy, z: vz }
          )
        );
      }
    };

    const createMainParticles = () => {
      mainParticles = [
        new Particle(
          collisionPoint.x,
          collisionPoint.y,
          collisionPoint.z,
          "#D13800",
          2.5,
          { x: PARTICLE_SEPARATION / 600, y: 0, z: 0 }
        ),
        new Particle(
          collisionPoint.x,
          collisionPoint.y,
          collisionPoint.z,
          "#00CC8E",
          2.5,
          { x: -PARTICLE_SEPARATION / 600, y: 0, z: 0 }
        ),
      ];
    };

    const checkCollisions = () => {
      if (hasCollided) return;

      // Find average position of all particles
      let avgX = 0,
        avgY = 0,
        avgZ = 0;
      let particlesNearCenter = 0;

      particles.forEach((particle) => {
        const distanceFromCenter = Math.sqrt(
          particle.x * particle.x +
            particle.y * particle.y +
            particle.z * particle.z
        );

        if (distanceFromCenter < 30) {
          avgX += particle.x;
          avgY += particle.y;
          avgZ += particle.z;
          particlesNearCenter++;
        }
      });

      if (particlesNearCenter > particles.length * 0.7) {
        hasCollided = true;
        collisionPoint = {
          x: avgX / particlesNearCenter,
          y: avgY / particlesNearCenter,
          z: avgZ / particlesNearCenter,
        };
        createMainParticles();
        particles = [];
      }
    };

    const animate = () => {
      if (!isRunning) return;

      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle) => {
        particle.update();
        particle.draw(ctx);
      });

      mainParticles.forEach((particle) => {
        particle.update();
        particle.draw(ctx);
      });

      checkCollisions();

      // Check if main particles have moved far enough apart
      if (hasCollided && mainParticles.length > 0) {
        if (
          Math.abs(mainParticles[0].x - mainParticles[1].x) >
          PARTICLE_SEPARATION
        ) {
          loopCount.current++;

          if (loopCount.current >= maxLoops) {
            setIsRunning(false);
            onComplete();
            return;
          }

          mainParticles = [];
          createRandomParticles();
        }
      }

      // Start with random particles if none exist
      if (particles.length === 0 && mainParticles.length === 0) {
        createRandomParticles();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    createRandomParticles();
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [speed, maxLoops, onComplete, isRunning]);

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-black">
      <Stars />
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
};

export const Stars = ({ length = 16 }) => {
  const seed = 42; // Fixed seed value
  return (
    <div className="fixed inset-0 pointer-events-none">
      {Array.from({ length: length }).map((_, idx) => {
        const randomTop = seededRandom(seed + idx) * 100;
        const randomLeft = seededRandom(seed * idx) * 100;
        const floatDuration = 8 + (idx % 6);
        return (
          <div
            key={idx}
            className={`star ${idx % 2 === 0 ? "star-red" : "star-green"}`}
            style={{
              top: `${randomTop}%`,
              left: `${randomLeft}%`,
              animation: `float ${floatDuration}s ease-in-out infinite`,
            }}
          ></div>
        );
      })}
    </div>
  );
};

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
