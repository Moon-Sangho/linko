import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export interface FaviconProps {
  src?: string | null;
  size?: number;
}

function isSafeUrl(url: string): boolean {
  return url.startsWith('https://') || url.startsWith('http://');
}

export function Favicon({ src, size = 16 }: FaviconProps) {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src]);

  const safeSrc = src && isSafeUrl(src) ? src : null;

  if (!safeSrc || errored) {
    return (
      <Globe width={size} height={size} className="shrink-0 text-gray-500" aria-hidden="true" />
    );
  }

  return (
    <img
      src={safeSrc}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className="shrink-0 rounded-sm object-contain"
      onError={() => setErrored(true)}
    />
  );
}
