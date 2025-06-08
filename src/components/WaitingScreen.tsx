
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface WaitingScreenProps {
  message: string;
}

const WaitingScreen: React.FC<WaitingScreenProps> = ({ message }) => {
  const tips = [
    "المناظرة الناجحة تبدأ بفهمك لرأي الآخر",
    "سُبْحَانَ اللَّهِ ، الْحَمْدُ لِلَّهِ",
    "لَا إِلَـٰهَ إِلَّا اللَّـهُ",
    "اَللَّـهُ أَكْبَرُ"
  ];

  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
      <div className="text-center space-y-8 p-8 bg-white/10 backdrop-blur-sm rounded-3xl max-w-md mx-auto">
        {/* دائرة التحميل */}
        <div className="flex justify-center">
          <Loader2 className="h-16 w-16 text-white animate-spin" />
        </div>
        
        {/* رسالة الانتظار */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {message}
          </h2>
        </div>
        
        {/* نصيحة اليوم */}
        <div className="bg-white/20 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white/90 mb-3">
            نصيحة اليوم:
          </h3>
          <p className="text-white text-lg font-medium leading-relaxed transition-all duration-500">
            "{tips[currentTipIndex]}"
          </p>
        </div>
        
        {/* مؤشر النصائح */}
        <div className="flex justify-center space-x-2">
          {tips.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentTipIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WaitingScreen;
