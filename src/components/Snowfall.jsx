import { useEffect, useState } from 'react';
import './Snowfall.css';

const Snowfall = () => {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    // Generate snowflakes with random properties
    const flakes = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100, // Random horizontal position (%)
      animationDuration: 5 + Math.random() * 10, // 5-15 seconds
      animationDelay: Math.random() * 5, // 0-5 seconds delay
      size: 0.5 + Math.random() * 1, // 0.5-1.5rem
      opacity: 0.3 + Math.random() * 0.7, // 0.3-1.0
      drift: -20 + Math.random() * 40, // -20 to 20px horizontal drift
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="snowfall-container">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${flake.animationDelay}s`,
            fontSize: `${flake.size}rem`,
            opacity: flake.opacity,
            '--drift': `${flake.drift}px`,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
};

export default Snowfall;
