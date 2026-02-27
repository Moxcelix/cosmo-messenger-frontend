// components/SpacePattern.tsx
import React from 'react';

interface SpacePatternProps {
  opacity?: number;
  patternId?: string;
  size?: number;
  animate?: boolean;
  color?: string;
}

// Базовый интерфейс для трансформации
interface TransformProps {
  rotation?: number;
  offsetX?: number;
  offsetY?: number;
}

interface PlanetProps extends TransformProps {
  cx: number;
  cy: number;
  r: number;
  color: string;
  strokeWidth?: number;
  hasRing?: boolean;
  ringRotation?: number;
}

// Компонент Планеты
const Planet: React.FC<PlanetProps> = ({ 
  cx, 
  cy, 
  r, 
  color, 
  strokeWidth = 1.5,
  hasRing = false, 
  ringRotation = 15,
  rotation = 0,
  offsetX = 0,
  offsetY = 0,
}) => {
  const finalCx = cx + offsetX;
  const finalCy = cy + offsetY;
  const ringOpacity = 0.5;
  
  return (
    <g transform={`rotate(${rotation} ${finalCx} ${finalCy})`}>
      {/* Кольцо (ПЕРЕД планетой) */}
      {hasRing && (
        <ellipse 
          cx={finalCx} 
          cy={finalCy} 
          rx={r * 2} 
          ry={r * 0.5} 
          fill="none" 
          stroke={color} 
          strokeWidth={strokeWidth * 0.7}
          strokeOpacity={ringOpacity}
          transform={`rotate(${ringRotation} ${finalCx} ${finalCy})`}
        />
      )}
      
      {/* Планета (контур) */}
      <circle 
        cx={finalCx} 
        cy={finalCy} 
        r={r} 
        fill="none" 
        stroke={color} 
        strokeWidth={strokeWidth}
        strokeOpacity={0.9}
      />
      
      {/* Кольцо (ЗА планетой) */}
      {hasRing && (
        <ellipse 
          cx={finalCx} 
          cy={finalCy} 
          rx={r * 2} 
          ry={r * 0.5} 
          fill="none" 
          stroke={color} 
          strokeWidth={strokeWidth * 0.7}
          strokeOpacity={ringOpacity * 0.6}
          transform={`rotate(${ringRotation} ${finalCx} ${finalCy})`}
          style={{ 
            clipPath: `inset(50% 0 0 0)`,
            transformOrigin: `${finalCx}px ${finalCy}px`
          }}
        />
      )}
    </g>
  );
};

// Компонент обычной звезды (точка)
interface StarProps extends TransformProps {
  cx: number;
  cy: number;
  size?: number;
  opacity?: number;
}

const Star: React.FC<StarProps> = ({ 
  cx, 
  cy, 
  size = 1.5, 
  opacity = 0.8,
  rotation = 0,
  offsetX = 0,
  offsetY = 0
}) => {
  const finalCx = cx + offsetX;
  const finalCy = cy + offsetY;
  
  return (
    <g transform={`rotate(${rotation} ${finalCx} ${finalCy})`}>
      <circle cx={finalCx} cy={finalCy} r={size} fill="white" fillOpacity={opacity} />
    </g>
  );
};

// Компонент Блестки (4-конечная звезда)
interface SparkleProps extends TransformProps {
  cx: number;
  cy: number;
  size?: number;
  rotation?: number;
  opacity?: number;
  animate?: boolean;
}

const Sparkle: React.FC<SparkleProps> = ({ 
  cx, 
  cy, 
  size = 6, 
  rotation = 0,
  opacity = 0.7,
  animate = false,
  offsetX = 0,
  offsetY = 0
}) => {
  const finalCx = cx + offsetX;
  const finalCy = cy + offsetY;
  const totalRotation = rotation;
  
  const pathData = `
    M ${finalCx} ${finalCy - size} 
    Q ${finalCx + size * 0.3} ${finalCy} ${finalCx} ${finalCy + size} 
    Q ${finalCx - size * 0.3} ${finalCy} ${finalCx} ${finalCy - size}
    M ${finalCx - size} ${finalCy} 
    Q ${finalCx} ${finalCy - size * 0.3} ${finalCx + size} ${finalCy} 
    Q ${finalCx} ${finalCy + size * 0.3} ${finalCx - size} ${finalCy}
  `;

  return (
    <path
      d={pathData}
      fill="white"
      fillOpacity={opacity}
      transform={`rotate(${totalRotation} ${finalCx} ${finalCy})`}
      style={animate ? {
        animation: 'twinkle 3s infinite ease-in-out',
        transformBox: 'fill-box',
        transformOrigin: 'center'
      } : {}}
    />
  );
};

// ✅ ОТДЕЛЬНАЯ ФУНКЦИЯ для создания пути пятиконечной звезды
const createFivePointStarPath = (
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  rotation: number = 0
): string => {
  const points = [];
  const totalPoints = 10; // 5 внешних + 5 внутренних точек
  
  for (let i = 0; i < totalPoints; i++) {
    // Чередование внешнего и внутреннего радиуса
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    // Угол с поправкой на вращение (-90° чтобы звезда смотрела вверх)
    const angle = (i * Math.PI) / 5 - Math.PI / 2 + (rotation * Math.PI / 180);
    
    points.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius
    });
  }
  
  // Создаем путь, соединяя все точки
  const pathData = points.map((p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
  ).join(' ') + ' Z';
  
  return pathData;
};

// Компонент пятиконечной звезды для созвездий
interface ConstellationStarProps {
  cx: number;
  cy: number;
  size?: number;
  color: string;
  rotation?: number;
  opacity?: number;
}

const ConstellationStar: React.FC<ConstellationStarProps> = ({ 
  cx, 
  cy, 
  size = 4,
  color,
  rotation = 0,
  opacity = 0.8
}) => {
  const outerRadius = size;
  const innerRadius = size * 0.4; // Внутренний радиус 40% от внешнего
  
  const pathData = createFivePointStarPath(cx, cy, outerRadius, innerRadius, rotation);
  
  return (
    <path
      d={pathData}
      fill={color}
      fillOpacity={opacity}
    />
  );
};

// Компонент Созвездия
interface ConstellationProps extends TransformProps {
  stars: { x: number; y: number }[];
  color: string;
  starSize?: number;
}

const Constellation: React.FC<ConstellationProps> = ({ 
  stars, 
  color,
  starSize = 4,
  rotation = 0,
  offsetX = 0,
  offsetY = 0
}) => {
  // Применяем трансформацию к каждой звезде
  const transformedStars = stars.map(star => {
    const rad = rotation * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    // Вращение вокруг центра созвездия
    const centerX = stars.reduce((sum, s) => sum + s.x, 0) / stars.length;
    const centerY = stars.reduce((sum, s) => sum + s.y, 0) / stars.length;
    
    const dx = star.x - centerX;
    const dy = star.y - centerY;
    
    return {
      x: centerX + dx * cos - dy * sin + offsetX,
      y: centerY + dx * sin + dy * cos + offsetY
    };
  });
  
  const linePath = transformedStars.map((star, i) => 
    i === 0 ? `M ${star.x} ${star.y}` : `L ${star.x} ${star.y}`
  ).join(' ');
  
  return (
    <g>
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={0.5}
        strokeOpacity={0.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {transformedStars.map((star, i) => (
        <ConstellationStar
          key={i}
          cx={star.x}
          cy={star.y}
          size={starSize}
          color={color}
          rotation={rotation}
        />
      ))}
    </g>
  );
};

// ОТДЕЛЬНАЯ пятиконечная звезда (не в созвездии)
interface FivePointStarProps extends TransformProps {
  cx: number;
  cy: number;
  size?: number;
  color: string;
  opacity?: number;
  animate?: boolean;
}

const FivePointStar: React.FC<FivePointStarProps> = ({ 
  cx, 
  cy, 
  size = 5,
  color,
  opacity = 0.6,
  rotation = 0,
  offsetX = 0,
  offsetY = 0,
  animate = false
}) => {
  const finalCx = cx + offsetX;
  const finalCy = cy + offsetY;
  
  const outerRadius = size;
  const innerRadius = size * 0.4;
  
  const pathData = createFivePointStarPath(finalCx, finalCy, outerRadius, innerRadius, rotation);
  
  return (
    <path
      d={pathData}
      fill={color}
      fillOpacity={opacity}
      style={animate ? {
        animation: 'twinkle 4s infinite ease-in-out',
        animationDelay: `${Math.random() * 2}s`
      } : {}}
    />
  );
};

// Спиральная галактика
const SpiralGalaxy: React.FC<{ 
  cx: number; 
  cy: number; 
  size?: number; 
  color: string;
} & TransformProps> = ({ 
  cx, 
  cy, 
  size = 30,
  color,
  rotation = 0,
  offsetX = 0,
  offsetY = 0
}) => {
  const finalCx = cx + offsetX;
  const finalCy = cy + offsetY;
  const arms = 3;
  const turns = 2;
  
  return (
    <g transform={`rotate(${rotation} ${finalCx} ${finalCy})`} opacity="0.5">
      {Array.from({ length: arms }).map((_, armIndex) => {
        const angleOffset = (armIndex / arms) * Math.PI * 2;
        
        const pathData = Array.from({ length: 40 }).map((_, i) => {
          const t = i / 40;
          const angle = t * Math.PI * 2 * turns + angleOffset;
          const radius = t * size * (1 - t * 0.2);
          
          const x = finalCx + Math.cos(angle) * radius;
          const y = finalCy + Math.sin(angle) * radius;
          
          return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
        }).join(' ');
        
        return (
          <path
            key={armIndex}
            d={pathData}
            fill="none"
            stroke={color}
            strokeOpacity={0.4}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}
      
      <circle cx={finalCx} cy={finalCy} r={size * 0.2} fill={color} fillOpacity={0.5} />
    </g>
  );
};

// Эллиптическая галактика
const EllipticalGalaxy: React.FC<{ 
  cx: number; 
  cy: number; 
  size?: number; 
  color: string;
} & TransformProps> = ({ 
  cx, 
  cy, 
  size = 25,
  color,
  rotation = 0,
  offsetX = 0,
  offsetY = 0
}) => {
  const finalCx = cx + offsetX;
  const finalCy = cy + offsetY;
  
  return (
    <g transform={`rotate(${rotation} ${finalCx} ${finalCy})`} opacity="0.4">
      <ellipse
        cx={finalCx}
        cy={finalCy}
        rx={size}
        ry={size * 0.6}
        fill="none"
        stroke={color}
        strokeOpacity={0.3}
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      
      <circle cx={finalCx} cy={finalCy} r={size * 0.4} fill={color} fillOpacity={0.2} />
      
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const dist = Math.random() * size * 0.6;
        const x = finalCx + Math.cos(angle) * dist;
        const y = finalCy + Math.sin(angle) * dist * 0.6;
        
        return (
          <Star
            key={`ell-star-${i}`}
            cx={x}
            cy={y}
            size={Math.random() * 1 + 0.5}
            opacity={0.4}
          />
        );
      })}
    </g>
  );
};

const SpacePattern: React.FC<SpacePatternProps> = ({ 
  opacity = 0.3, 
  patternId = 'space-pattern-v6',
  size = 400,
  animate = false,
  color = 'rgba(255, 255, 255, 0.8)'
}) => {
  const patternStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity,
    pointerEvents: 'none',
    zIndex: 0,
  };

  const animationStyles = animate ? `
    @keyframes twinkle {
      0%, 100% { opacity: 0.3; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.1); }
    }
  ` : '';

  return (
    <>
      {animate && <style>{animationStyles}</style>}
      <svg
        style={patternStyles}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            {/* 1. Фоновые мелкие звезды (точки) */}
            {Array.from({ length: 50 }).map((_, i) => (
              <Star 
                key={`bg-star-${i}`}
                cx={Math.random() * size}
                cy={Math.random() * size}
                size={Math.random() * 0.8 + 0.3}
                opacity={Math.random() * 0.4 + 0.2}
                rotation={Math.random() * 360}
              />
            ))}
            
            {/* 2. Блестки (4-конечные) */}
            <Sparkle cx={50} cy={60} size={9} rotation={45} opacity={0.5} animate={animate} />
            <Sparkle cx={320} cy={150} size={8} rotation={10} opacity={0.4} animate={animate} />
            <Sparkle cx={180} cy={350} size={7} rotation={90} opacity={0.5} animate={animate} />
            <Sparkle cx={360} cy={380} size={8} rotation={-20} opacity={0.3} animate={animate} />
            <Sparkle cx={90} cy={280} size={9} rotation={30} opacity={0.4} animate={animate} />

            {/* 3. ОТДЕЛЬНЫЕ пятиконечные звезды (разбросанные по фону) */}
            <FivePointStar 
              cx={60} 
              cy={140} 
              size={6} 
              color={color} 
              opacity={0.5} 
              rotation={15}
              animate={animate}
            />
            <FivePointStar 
              cx={280} 
              cy={60} 
              size={5} 
              color={color} 
              opacity={0.4} 
              rotation={-25}
              animate={animate}
            />
            <FivePointStar 
              cx={150} 
              cy={280} 
              size={7} 
              color={color} 
              opacity={0.6} 
              rotation={45}
              animate={animate}
            />
            <FivePointStar 
              cx={350} 
              cy={250} 
              size={5} 
              color={color} 
              opacity={0.4} 
              rotation={-10}
              animate={animate}
            />
            <FivePointStar 
              cx={30} 
              cy={200} 
              size={6} 
              color={color} 
              opacity={0.5} 
              rotation={60}
              animate={animate}
            />
            <FivePointStar 
              cx={200} 
              cy={30} 
              size={5} 
              color={color} 
              opacity={0.4} 
              rotation={-45}
              animate={animate}
            />
            <FivePointStar 
              cx={380} 
              cy={180} 
              size={6} 
              color={color} 
              opacity={0.5} 
              rotation={30}
              animate={animate}
            />
            <FivePointStar 
              cx={120} 
              cy={380} 
              size={5} 
              color={color} 
              opacity={0.4} 
              rotation={-60}
              animate={animate}
            />

            {/* 4. Планеты с кольцами */}
            <Planet 
              cx={100} 
              cy={100} 
              r={20} 
              color={color} 
              strokeWidth={2}
              hasRing={true}
              ringRotation={20}
              rotation={5}
              offsetX={0}
              offsetY={0}
            />
            
            {/* <Planet 
              cx={300} 
              cy={200} 
              r={16} 
              color={color} 
              strokeWidth={1.8}
              hasRing={true}
              rotation={-10}
              offsetX={0}
              offsetY={0}
            />
             */}
            <Planet 
              cx={220} 
              cy={340} 
              r={14} 
              color={color} 
              strokeWidth={1.5}
              hasRing={true}
              ringRotation={-30}
              rotation={15}
              offsetX={0}
              offsetY={0}
            />

            {/* 5. Галактики */}
            <SpiralGalaxy 
              cx={80} 
              cy={320} 
              size={40} 
              color={color} 
              rotation={25}
              offsetX={0}
              offsetY={0}
            />
            <SpiralGalaxy 
              cx={340} 
              cy={80} 
              size={35} 
              color={color} 
              rotation={-15}
              offsetX={0}
              offsetY={0}
            />
            <EllipticalGalaxy 
              cx={200} 
              cy={160} 
              size={30} 
              color={color} 
              rotation={-15}
              offsetX={0}
              offsetY={0}
            />

            {/* 6. Созвездия */}
            
            {/* Созвездие 1 - Большое */}
            <Constellation
              stars={[
                { x: 40, y: 180 },
                { x: 80, y: 150 },
                { x: 130, y: 160 },
                { x: 170, y: 140 },
                { x: 200, y: 170 }
              ]}
              color={color}
              starSize={3.5}
              rotation={10}
              offsetX={0}
              offsetY={0}
            />
            
            {/* Созвездие 2 - Медведица */}
            <Constellation
              stars={[
                { x: 235, y: -200 },
                { x: 240, y: -240 },
                { x: 260, y: -280 },
                { x: 290, y: -300 },
                { x: 320, y: -290 },
                { x: 340, y: -320 },
                { x: 310, y: -340 },
                { x: 290, y: -300 },
              ]}
              color={color}
              starSize={3}
              rotation={70}
              offsetX={0}
              offsetY={550}
            />
            
            {/* Созвездие 3 - Угловое */}
            <Constellation
              stars={[
                { x: 250, y: 50 },
                { x: 270, y: 80 },
                { x: 260, y: 110 },
                { x: 230, y: 100 },
                { x: 240, y: 90 }
              ]}
              color={color}
              starSize={3}
              rotation={-20}
              offsetX={0}
              offsetY={0}
            />

            {/* 7. Дополнительные крупные звезды (точки) */}
            <Star cx={30} cy={350} size={2.5} opacity={0.8} rotation={0} />
            <Star cx={380} cy={30} size={2} opacity={0.7} rotation={45} />
            <Star cx={150} cy={50} size={1.8} opacity={0.6} rotation={90} />
            <Star cx={270} cy={120} size={2.2} opacity={0.7} rotation={-30} />
            
          </pattern>
        </defs>
        
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={`url(#${patternId})`}
        />
      </svg>
    </>
  );
};

export default SpacePattern;