import React from 'react';

interface CrinkleCoinBadgeProps {
  amount?: number | string;
  size?: 'sm' | 'md' | 'lg';
  showSymbol?: boolean;
  className?: string;
}

/**
 * Custom SVG embossed gold coin badge featuring a star-and-fold crest for CrinkleCoins (CC).
 */
export const CrinkleCoinIcon: React.FC<{ sizePx?: number }> = ({ sizePx = 22 }) => (
  <svg
    width={sizePx}
    height={sizePx}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0 drop-shadow-sm"
    aria-hidden="true"
  >
    {/* Outer Cocoa Ink Coin Rim */}
    <circle cx="18" cy="18" r="16" fill="#F59E0B" stroke="#3D2C2E" strokeWidth="2.8" />
    {/* Inner Embossed Gold Ring */}
    <circle cx="18" cy="18" r="12.5" fill="#FBBF24" stroke="#B45309" strokeWidth="1.6" />
    {/* Top Specular Highlight Arc */}
    <path
      d="M9.5 11.5C11.5 8.8 14.5 7.5 18 7.5"
      stroke="#FEF3C7"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Folded Linen Ribbon Base */}
    <path
      d="M11 23.5C13 21.5 23 21.5 25 23.5C23.5 25.5 12.5 25.5 11 23.5Z"
      fill="#FEF3C7"
      stroke="#3D2C2E"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Embossed Center Star Crest */}
    <polygon
      points="18,9.2 20.1,13.6 24.8,14.2 21.3,17.4 22.2,22 18,19.7 13.8,22 14.7,17.4 11.2,14.2 15.9,13.6"
      fill="#FEF08A"
      stroke="#3D2C2E"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>
);

export const CrinkleCoinBadge: React.FC<CrinkleCoinBadgeProps> = ({
  amount,
  size = 'md',
  showSymbol = true,
  className = '',
}) => {
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 26 : 22;
  const textClass =
    size === 'sm'
      ? 'text-xs font-extrabold'
      : size === 'lg'
      ? 'text-base sm:text-lg font-black'
      : 'text-sm font-extrabold';

  const formatted =
    typeof amount === 'number' ? amount.toLocaleString('en-US') : amount;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[#3D2C2E] border-2 border-[#3D2C2E] shadow-[0_2px_0_#3D2C2E] ${className}`}
    >
      <CrinkleCoinIcon sizePx={iconSize} />
      {formatted !== undefined && (
        <span className={`${textClass} tracking-tight`}>
          {formatted}
          {showSymbol ? ' CC' : ''}
        </span>
      )}
    </span>
  );
};
