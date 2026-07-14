import './LoadingSkeleton.css';

const LoadingSkeleton = ({ variant = 'text', width, height, count = 1 }) => {
  const elements = Array.from({ length: count });

  const getStyle = () => {
    const style = {};
    if (width) style.width = width;
    if (height) style.height = height;
    return style;
  };

  return (
    <>
      {elements.map((_, index) => (
        <div
          key={index}
          className={`skeleton ${
            variant === 'circle'
              ? 'skeleton-circle'
              : variant === 'title'
              ? 'skeleton-title'
              : 'skeleton-text'
          }`}
          style={getStyle()}
        />
      ))}
    </>
  );
};

export default LoadingSkeleton;
