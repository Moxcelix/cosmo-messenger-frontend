import React from 'react';

interface SpaceBackgroundProps {
  children: React.ReactNode;
  gradient?: string;
}

const SpaceBackground: React.FC<SpaceBackgroundProps> = ({ 
  children, 
  gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6b8cff 100%)' 
}) => {
  const styles = {
    container: {
      minHeight: '100vh',
      width: '100%',
      background: gradient,
      position: 'relative' as const,
      overflow: 'hidden' as const,
      display: 'flex',
      alignItems:'center',
      justifyContent: 'center',
    },
    content: {
      zIndex: 1,
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default SpaceBackground;