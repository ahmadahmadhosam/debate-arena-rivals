
import React, { useState, useEffect } from 'react';
import { Clock, Pause, Play } from 'lucide-react';

interface ClockTimerProps {
  initialTime: number;
  isActive: boolean;
  onTimeUp: () => void;
  label: string;
  variant?: 'primary' | 'warning' | 'danger';
}

const ClockTimer: React.FC<ClockTimerProps> = ({
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
        return 'border-yellow-400 text-yellow-600 bg-yellow-50';
      case 'danger':
        return 'border-red-400 text-red-600 bg-red-50';
      default:
        return 'border-islamic-gold-400 text-islamic-gold-600 bg-islamic-gold-50';
    }
  };

  // حساب زاوية عقارب الساعة
  const minuteAngle = ((initialTime - timeLeft) / initialTime) * 360;
  const secondAngle = ((timeLeft % 60) / 60) * 360;

  return (
    <div className="text-center space-y-4">
      <div className={`relative w-32 h-32 mx-auto rounded-full border-4 ${getVariantStyles()} flex items-center justify-center`}>
        {/* وجه الساعة */}
        <div className="absolute inset-2 rounded-full border border-current opacity-20"></div>
        
        {/* الأرقام */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-bold">12</div>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-bold">3</div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-bold">6</div>
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs font-bold">9</div>

        {/* عقرب الدقائق */}
        <div 
          className="absolute w-0.5 h-8 bg-current origin-bottom"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
            transformOrigin: 'bottom center'
          }}
        ></div>

        {/* عقرب الثواني */}
        <div 
          className="absolute w-0.5 h-6 bg-red-500 origin-bottom"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`,
            transformOrigin: 'bottom center'
          }}
        ></div>

        {/* نقطة المركز */}
        <div className="absolute w-2 h-2 bg-current rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>

        {/* الوقت الرقمي */}
        <div className="absolute bottom-6 text-lg font-bold">
          {formatTime(timeLeft)}
        </div>

        {isActive && !isPaused && (
          <div className="absolute inset-0 border-2 border-current rounded-full animate-pulse"></div>
        )}
      </div>

      <div className="space-y-2">
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

export default ClockTimer;
