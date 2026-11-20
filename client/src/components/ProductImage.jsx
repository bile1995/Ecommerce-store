import { useState } from 'react';

const ProductImage = ({ src, alt, className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    setImageError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  // Placeholder SVG for missing images
  const placeholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%239ca3af'%3E${encodeURIComponent(alt || 'Product Image')}%3C/text%3E%3C/svg%3E`;

  return (
    <div className={`relative ${className}`}>
      {loading && !imageError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg"></div>
      )}
      <img
        src={imageError ? placeholderSvg : src}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      />
    </div>
  );
};

export default ProductImage;

