import { useEffect, useRef, useState } from "react";

export const ParticleCollision = ({
  width = 800,
  height = 600,
  speed = 1,
  maxLoops = 1,
  inverse = false,
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
        new Particle(-1200, 0, 0, inverse ? "#4682B4" : "#D13800", 2.5, {
          x: 6,
          y: 0,
          z: 0,
        }),
        new Particle(1200, 0, 0, inverse ? "#E8E8E8" : "#00CC8E", 2.5, {
          x: -6,
          y: 0,
          z: 0,
        }),
      ];
      explosionParticles = [];
      hasCollided = false;
    };

    const createExplosion = () => {
      const numParticles = 50;
      const colors = [
        inverse ? "#D13800" : "#FFFFFF",
        inverse ? "#00CC8E" : "#E8E8E8",
        inverse ? "#D13800" : "#B0C4DE",
        inverse ? "#00CC8E" : "#87CEEB",
        inverse ? "#D13800" : "#4682B4",
        inverse ? "#00CC8E" : "#D3D3D3",
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

export const Stars = ({ length = 16 }) => {
  function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

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
