import React, { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';
import { getDivisionBanner } from '../data/mediaAssets';

interface ServiceCardImageProps {
  divisionSlug: string;
  customImageUrl?: string | null;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
}

/**
 * Displays a service's own image when set, falling back cleanly to the division banner.
 * Uses a 16:9 container with object-contain so typography inside approved division artwork
 * is never cropped on mobile or desktop viewports.
 */
export const ServiceCardImage: React.FC<ServiceCardImageProps> = ({
  divisionSlug,
  customImageUrl,
  alt,
  className = '',
  loading = 'lazy'
}) => {
  const banner = getDivisionBanner(divisionSlug);
  const preferredSrc = (customImageUrl || '').trim() || banner?.src || '';
  const [imgSrc, setImgSrc] = useState<string>(preferredSrc);
  const [failed, setFailed] = useState<boolean>(!preferredSrc);

  useEffect(() => {
    const nextSrc = (customImageUrl || '').trim() || banner?.src || '';
    setImgSrc(nextSrc);
    setFailed(!nextSrc);
  }, [customImageUrl, banner?.src]);

  const handleError = () => {
    if (banner?.src && imgSrc !== banner.src) {
      setImgSrc(banner.src);
    } else {
      setFailed(true);
    }
  };

  return (
    <div
      className={`w-full aspect-video bg-[#FFFEFB] overflow-hidden flex items-center justify-center ${className}`}
    >
      {!failed && imgSrc ? (
        <img
          src={imgSrc}
          alt={alt}
          width={banner?.width || 1672}
          height={banner?.height || 941}
          loading={loading}
          referrerPolicy="no-referrer"
          onError={handleError}
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#0B1426] text-white/80">
          <Layers className="w-7 h-7 text-[#C49A36] mb-2" />
          <span className="text-xs font-semibold text-white">{alt}</span>
        </div>
      )}
    </div>
  );
};
