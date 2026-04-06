const ProgressRing = ({ progress, label, color }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle 
          cx="40" cy="40" r={radius} 
          fill="none" 
          stroke="hsl(var(--border))" 
          strokeWidth="6" 
        />
        {/* Progress bar */}
        <circle 
          cx="40" cy="40" r={radius} 
          fill="none" 
          stroke={color || 'hsl(var(--primary))'} 
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
        {/* Text inside */}
        <text 
          x="40" y="40" 
          fill="hsl(var(--foreground))" 
          fontSize="14" 
          fontWeight="bold" 
          textAnchor="middle" 
          dy="5"
          style={{ transform: 'rotate(90deg) translate(0px, -80px)', transformOrigin: 'center' }}
        >
          {progress}%
        </text>
      </svg>
      {label && <span className="text-sm font-medium text-muted-foreground">{label}</span>}
    </div>
  );
};

export default ProgressRing;
