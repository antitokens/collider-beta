import { useEffect, useRef, useState } from "react";

export const ParticleCollision = ({
  width = 800,
  height = 600,
  incomingSpeed = 1,
  explosionSpeed = 1,
  maxLoops = 1,
  inverse = false,
  metadata = "{}",
  onComplete = () => {},
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const loopCount = useRef(0);
  const [isRunning, setIsRunning] = useState(true);

  // Format metadata function
  const formatMetadata = (metadataString) => {
    try {
      // Parse the JSON string
      const data = JSON.parse(metadataString);
      return Object.entries(data).map(([key, value]) => {
        // Handle different types of values
        const formattedValue =
          typeof value === "number"
            ? value.toFixed(2)
            : typeof value === "object"
            ? JSON.stringify(value)
            : String(value);
        return `${key}: ${formattedValue}`;
      });
    } catch (error) {
      console.error("Error parsing metadata:", error);
      return []; // Return empty array if parsing fails
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });

    // Function to generate random perspective settings
    const generatePerspective = () => ({
      perspective: 300 + Math.random() * 200,
      cameraHeight: 150 + Math.random() * 100,
      cameraDistance: 400 + Math.random() * 200,
    });

    let perspectiveSettings = generatePerspective();

    class Particle {
      constructor(x, y, z, color, radius, velocity, isIncoming = false) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.color = color;
        this.radius = radius;
        this.velocity = {
          x: Number(velocity.x.toFixed(8)),
          y: Number(velocity.y.toFixed(8)),
          z: Number(velocity.z.toFixed(8)),
        };
        this.alpha = 1;
        this.trail = [];
        this.isIncoming = isIncoming;
        this.maxTrailLength = isIncoming ? 10 : 60;
      }

      project() {
        const { perspective, cameraHeight, cameraDistance } =
          perspectiveSettings;
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

      draw(ctx) {
        const proj = this.project();

        if (!this.isIncoming) {
          // For explosion particles - KEEPING ORIGINAL STYLING
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
          // For large incoming particles with fuzzy trail
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          // Draw multiple layers of trails with different widths and opacities
          [1.5, 1.2, 1.0, 0.8].forEach((widthScale) => {
            this.trail.forEach((pos, index, array) => {
              if (index < array.length - 1) {
                const nextPos = array[index + 1];
                if (
                  isFinite(pos.x) &&
                  isFinite(pos.y) &&
                  isFinite(nextPos.x) &&
                  isFinite(nextPos.y)
                ) {
                  const alpha = 1 - index / array.length;
                  const baseWidth = 60 * widthScale; // Trail fuzz
                  const gradientSize = baseWidth * alpha;

                  try {
                    // Calculate direction vector for perpendicular gradient
                    const dx = nextPos.x - pos.x;
                    const dy = nextPos.y - pos.y;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    const normalX = (-dy / len) * gradientSize;
                    const normalY = (dx / len) * gradientSize;

                    const gradient = ctx.createLinearGradient(
                      pos.x - normalX,
                      pos.y - normalY,
                      pos.x + normalX,
                      pos.y + normalY
                    );

                    const alphaHex = Math.floor(alpha * 255 * (1 / widthScale))
                      .toString(16)
                      .padStart(2, "0");
                    gradient.addColorStop(0, `${this.color}00`);
                    gradient.addColorStop(0.5, `${this.color}${alphaHex}`);
                    gradient.addColorStop(1, `${this.color}00`);

                    ctx.beginPath();
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = gradientSize;
                    ctx.moveTo(pos.x, pos.y);
                    ctx.lineTo(nextPos.x, nextPos.y);
                    ctx.stroke();
                  } catch (e) {
                    const alphaHex = Math.floor(alpha * 128 * (1 / widthScale))
                      .toString(16)
                      .padStart(2, "0");
                    ctx.strokeStyle = `${this.color}${alphaHex}`;
                    ctx.lineWidth = gradientSize;
                    ctx.beginPath();
                    ctx.moveTo(pos.x, pos.y);
                    ctx.lineTo(nextPos.x, nextPos.y);
                    ctx.stroke();
                  }
                }
              }
            });
          });

          // Draw halo and particle
          const haloRadius = Math.max(0.1, 120 * proj.scale);
          const particleRadius = Math.max(0.1, 60 * proj.scale);

          try {
            // Outer halo
            const haloGradient = ctx.createRadialGradient(
              proj.x,
              proj.y,
              particleRadius,
              proj.x,
              proj.y,
              haloRadius
            );
            haloGradient.addColorStop(0, `${this.color}88`);
            haloGradient.addColorStop(0.5, `${this.color}44`);
            haloGradient.addColorStop(1, `${this.color}00`);

            ctx.beginPath();
            ctx.fillStyle = haloGradient;
            ctx.arc(proj.x, proj.y, haloRadius, 0, Math.PI * 2);
            ctx.fill();

            // Core particle with smooth edge
            const particleGradient = ctx.createRadialGradient(
              proj.x,
              proj.y,
              0,
              proj.x,
              proj.y,
              particleRadius
            );
            particleGradient.addColorStop(0, this.color);
            particleGradient.addColorStop(0.7, this.color);
            particleGradient.addColorStop(1, `${this.color}00`);

            ctx.beginPath();
            ctx.fillStyle = particleGradient;
            ctx.arc(proj.x, proj.y, particleRadius, 0, Math.PI * 2);
            ctx.fill();
          } catch (e) {
            // Fallback rendering if gradients fail
            ctx.fillStyle = `${this.color}44`;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, haloRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, particleRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      update() {
        const proj = this.project();
        if (isFinite(proj.x) && isFinite(proj.y)) {
          this.trail.unshift({ x: proj.x, y: proj.y });
          if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
          }
        }

        const speed = this.isIncoming ? incomingSpeed : explosionSpeed;
        this.x += this.velocity.x * (speed * 2);
        this.y += this.velocity.y * (speed * 2);
        this.z += this.velocity.z * (speed * 2);
        this.alpha *= 0.99;
      }

      isOutOfBounds() {
        const proj = this.project();
        const margin = 100;
        return (
          proj.x < -margin ||
          proj.x > canvas.width + margin ||
          proj.y < -margin ||
          proj.y > canvas.height + margin
        );
      }
    }

    let particles = [];
    let explosionParticles = [];
    let hasCollided = false;

    const resetAnimation = () => {
      perspectiveSettings = generatePerspective();

      // Calculate bounds to ensure collision is visible
      const centerX = width / 2;
      const centerY = height / 2;
      const minDimension = Math.min(width, height);
      const safeRadius = minDimension * 0.25; // Collision zone is central 50% of screen

      // Generate angle that ensures collision within safe zone
      const maxAngle = Math.PI / 4; // 45 degrees maximum from horizontal
      const baseAngle = (Math.random() - 0.5) * maxAngle;

      // Calculate precise start positions and velocities
      const startDistance = Math.max(width, height);
      const speed = 6;

      // Ensure perfect alignment by using exact trigonometric values
      const vx = Math.cos(baseAngle) * speed;
      const vy = Math.sin(baseAngle) * speed;
      const z = (Math.random() - 0.5) * 50; // Reduced z variation

      const velocity1 = {
        x: Number(vx.toFixed(8)),
        y: Number(vy.toFixed(8)),
        z: Number((z / 100).toFixed(8)),
      };

      const velocity2 = {
        x: Number((-vx).toFixed(8)),
        y: Number((-vy).toFixed(8)),
        z: Number((-z / 100).toFixed(8)),
      };

      const startPos1 = {
        x: -Math.cos(baseAngle) * startDistance,
        y: -Math.sin(baseAngle) * startDistance,
        z: z,
      };

      const startPos2 = {
        x: Math.cos(baseAngle) * startDistance,
        y: Math.sin(baseAngle) * startDistance,
        z: -z,
      };

      particles = [
        new Particle(
          startPos1.x,
          startPos1.y,
          startPos1.z,
          inverse ? "#60A5FA" : "#D13800",
          15,
          velocity1,
          true
        ),
        new Particle(
          startPos2.x,
          startPos2.y,
          startPos2.z,
          inverse ? "#F8FAFC" : "#00CC8E",
          15,
          velocity2,
          true
        ),
      ];
      explosionParticles = [];
      hasCollided = false;
    };

    const createExplosion = () => {
      const numParticles = 50;
      const colors = [
        inverse ? "#D13800" : "#F0F9FF", // Bright white
        inverse ? "#00CC8E" : "#E2E8F0", // Bright steel
        inverse ? "#D13800" : "#BFDBFE", // Bright blue
        inverse ? "#00CC8E" : "#93C5FD", // Brighter blue
        inverse ? "#D13800" : "#60A5FA", // Even brighter blue
        inverse ? "#00CC8E" : "#F1F5F9", // Bright gray
      ];

      for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        const size = 2;

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
            },
            false
          )
        );
      }

      particles = [];
    };

    const animate = () => {
      if (!isRunning) return;

      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and filter out-of-bounds particles
      particles = particles.filter((particle) => !particle.isOutOfBounds());
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
        (particle) => particle.alpha > 0.1 && !particle.isOutOfBounds()
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
  }, [
    incomingSpeed,
    explosionSpeed,
    maxLoops,
    isRunning,
    onComplete,
    inverse,
    width,
    height,
  ]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      {/* Metadata display */}
      <div className="absolute top-4 right-4 z-10 text-right">
        {formatMetadata(metadata).map((line, index) => (
          <div
            key={index}
            className="font-sfmono text-sm text-gray-400 bg-black bg-opacity-50 px-2 py-0.5 rounded mb-1"
          >
            {line}
          </div>
        ))}
      </div>
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
