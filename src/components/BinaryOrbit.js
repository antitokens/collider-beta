import React, { useRef, useEffect } from "react";

const BinaryOrbit = ({
  size,
  orbitRadius,
  particleRadius,
  padding,
  invert,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Adjust the effective size to account for padding
    const effectiveSize = size - 2 * padding;
    const centerX = padding + effectiveSize / 2;
    const centerY = padding + effectiveSize / 2;

    let angle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw central orbit circle (optional)
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.closePath();

      // Calculate particle positions
      const direction = invert ? -1 : 1; // Invert direction if `invert` is true
      const x1 = centerX + orbitRadius * Math.cos(angle * direction);
      const y1 = centerY + orbitRadius * Math.sin(angle * direction);
      const x2 = centerX - orbitRadius * Math.cos(angle * direction);
      const y2 = centerY - orbitRadius * Math.sin(angle * direction);

      // Draw first particle
      ctx.beginPath();
      ctx.arc(x1, y1, particleRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#D13800"; // Orange
      ctx.fill();
      ctx.closePath();

      // Draw second particle
      ctx.beginPath();
      ctx.arc(x2, y2, particleRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#00CC8E"; // Green
      ctx.fill();
      ctx.closePath();

      // Increment the angle for animation
      angle += 0.05;

      // Loop animation
      requestAnimationFrame(draw);
    };

    // Start animation
    draw();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(draw);
    };
  }, [size, orbitRadius, particleRadius, padding, invert]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        display: "block",
        background: "transparent",
        padding: `${padding}px`,
        boxSizing: "content-box", // Ensures padding is outside the canvas
      }}
    />
  );
};

export default BinaryOrbit;
