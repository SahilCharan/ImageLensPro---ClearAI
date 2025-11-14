import { useState } from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = 'h-12' }: LogoProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    // Fallback to text logo if image fails to load
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
          <span className="text-2xl font-bold text-primary-foreground">C</span>
        </div>
        <span className="text-2xl font-bold text-primary">ClearAI</span>
      </div>
    );
  }

  return (
    <img
      src="/images/clearai-logo.png"
      alt="ClearAI - AI Business Solutions"
      className={className}
      onError={() => setImageError(true)}
      loading="eager"
    />
  );
}
