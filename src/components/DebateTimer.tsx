
import React, { useState, useEffect } from 'react';
import { Clock, Pause, Play } from 'lucide-react';

interface DebateTimerProps {
  initialTime: number; // بالثواني
  isActive: boolean;
  onTimeUp: () => void;
  label: string;
  variant?: 'primary' | 'warning' | 'danger';
}

const DebateTimer: React.FC<DebateTimerProps> = ({
  initialTime,
  isActive,
  onTimeUp,
  label,
  variant = 'primary'
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (!isActive || isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isPaused, timeLeft, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return 'border-yellow-400 text-yellow-600';
      case 'danger':
        return 'border-red-400 text-red-600';
      default:
        return 'border-islamic-gold-400 text-islamic-gold-600';
    }
  };

  const progress = (timeLeft / initialTime) * 100;

  return (
    <div className="text-center space-y-2">
      <div className="relative">
        <div className={`timer-circle ${getVariantStyles()}`}>
          <div className="text-lg font-bold">
            {formatTime(timeLeft)}
          </div>
          {isActive && !isPaused && (
            <div className="pulse-ring border-current"></div>
          )}
        </div>
        
        {/* شريط التقدم الدائري */}
        <svg className="absolute inset-0 w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeOpacity="0.1"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 36}`}
            strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
            className="transition-all duration-1000"
          />
        </svg>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium">{label}</p>
        
        {isActive && (
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="inline-flex items-center space-x-reverse space-x-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {isPaused ? (
              <>
                <Play className="h-3 w-3" />
                <span>تشغيل</span>
              </>
            ) : (
              <>
                <Pause className="h-3 w-3" />
                <span>إيقاف</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default DebateTimer;
