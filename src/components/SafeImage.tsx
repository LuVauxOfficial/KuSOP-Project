import { useState } from 'react';
import { Leaf } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function SafeImage({
  src,
  alt,
  className = '',
  fallbackTitle,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#E8F6EE] via-[#F2FBF6] to-[#D8EFE2] text-[#0D4A31] p-4 ${className}`}
      >
        <Leaf className="w-7 h-7 mb-1.5 opacity-80" aria-hidden="true" />
        {fallbackTitle && (
          <span className="text-xs font-medium text-center text-[#0D4A31]/80 line-clamp-2">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
