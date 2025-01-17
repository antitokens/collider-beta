import React, { useEffect, useState } from "react";

const TimeCompletionPie = ({ startTime, endTime, size = 24 }) => {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const calculateCompletion = () => {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const now = new Date();

      const startUTC = Date.UTC(
        start.getUTCFullYear(),
        start.getUTCMonth(),
        start.getUTCDate(),
        start.getUTCHours(),
        start.getUTCMinutes(),
        start.getUTCSeconds()
      );

      const endUTC = Date.UTC(
        end.getUTCFullYear(),
        end.getUTCMonth(),
        end.getUTCDate(),
        end.getUTCHours(),
        end.getUTCMinutes(),
        end.getUTCSeconds()
      );

      const nowUTC = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
      );

      if (nowUTC < startUTC) return 0;
      if (nowUTC > endUTC) return 100;

      const total = endUTC - startUTC;
      const elapsed = nowUTC - startUTC;
      return Math.min(100, Math.max(0, (elapsed / total) * 100));
    };

    setPercentage(calculateCompletion());

    const interval = setInterval(() => {
      setPercentage(calculateCompletion());
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime]);

  const radius = size / 2;
  const strokeWidth = size * 0.15;
  const actualRadius = radius - strokeWidth / 2;

  const getArcPath = (percentage) => {
    // If percentage is 0, return empty path
    if (percentage === 0) return "";

    const angle = (percentage / 100) * 360;
    const angleInRadians = (angle - 90) * (Math.PI / 180);
    const x = radius + actualRadius * Math.cos(angleInRadians);
    const y = radius + actualRadius * Math.sin(angleInRadians);
    const largeArcFlag = angle > 180 ? 1 : 0;

    return `
      M ${radius},${strokeWidth / 2}
      A ${actualRadius},${actualRadius} 0 ${largeArcFlag} 1 ${x},${y}
    `;
  };

  return (
    <div className="inline-block">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={radius}
          cy={radius}
          r={actualRadius}
          fill="none"
          stroke="#374151"
          strokeWidth={strokeWidth}
        />

        {/* Only render progress arc if there's progress */}
        {percentage > 0 && (
          <path
            d={getArcPath(percentage)}
            fill="none"
            stroke={
              percentage < 50
                ? "#10B981"
                : percentage < 75
                ? "#FBBF24"
                : "#EF4444"
            }
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
};

export default TimeCompletionPie;
