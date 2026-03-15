import { useState } from 'react';
import { Globe } from 'lucide-react';

interface FaviconProps {
  src?: string | null;
  size?: number;
}

export function Favicon({ src, size = 16 }: FaviconProps) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <Globe
        width={size}
        height={size}
        className="shrink-0 text-gray-500"
        aria-hidden="true"
      />
    );
  }

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className="shrink-0 rounded-sm object-contain"
      onError={() => setErrored(true)}
    />
  );
}
