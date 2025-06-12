import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface LanternAnimationProps {
  player1Name: string;
  player2Name: string;
  onPlayerSelected: (playerName: string) => void;
}

const LanternAnimation: React.FC<LanternAnimationProps> = ({
  player1Name,
  player2Name,
  onPlayerSelected
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const startAnimation = () => {
    setIsAnimating(true);
    setShowResult(false);
    
    // محاكاة الانتظار للرسوم المتحركة
    setTimeout(() => {
      const randomPlayer = Math.random() > 0.5 ? player1Name : player2Name;
      setSelectedPlayer(randomPlayer);
      setIsAnimating(false);
      setShowResult(true);
      
      // انتظار قليل قبل إشعار المكون الأب
      setTimeout(() => {
        onPlayerSelected(randomPlayer);
      }, 2000);
    }, 3000);
  };

  // بدء الاختيار التلقائي عند تحميل المكون
  useEffect(() => {
    const timer = setTimeout(() => {
      startAnimation();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="text-center space-y-6 p-8 relative z-10">
        <h3 className="text-3xl font-bold text-white mb-8 text-outlined">
          🏮 اختيار من سيبدأ المناظرة 🏮
        </h3>
        
        {!isAnimating && !showResult && (
          <div className="space-y-4">
            <p className="text-white text-lg text-outlined">جاري الاختيار التلقائي...</p>
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {isAnimating && (
          <div className="space-y-6">
            <p className="text-white text-xl font-medium text-outlined">الفوانيس تطير في السماء...</p>
            <div className="flex justify-center space-x-reverse space-x-8">
              <div className="lantern-container animate-bounce">
                <div className="lantern bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-6 rounded-lg shadow-2xl transform rotate-3 border-2 border-white/30">
                  <div className="text-4xl mb-2">🏮</div>
                  <span className="text-lg font-bold text-outlined">{player1Name}</span>
                </div>
              </div>
              <div className="lantern-container animate-bounce" style={{ animationDelay: '0.5s' }}>
                <div className="lantern bg-gradient-to-br from-red-400 to-pink-500 text-white p-6 rounded-lg shadow-2xl transform -rotate-3 border-2 border-white/30">
                  <div className="text-4xl mb-2">🏮</div>
                  <span className="text-lg font-bold text-outlined">{player2Name}</span>
                </div>
              </div>
            </div>
            <div className="animate-pulse text-white text-xl text-outlined">
              ✨ جاري الاختيار... ✨
            </div>
          </div>
        )}

        {showResult && selectedPlayer && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-8xl animate-bounce">🏮</div>
            <div className="bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-2xl p-8 shadow-2xl">
              <h4 className="text-2xl font-bold text-white mb-4 text-outlined">
                🎉 تم الاختيار! 🎉
              </h4>
              <p className="text-3xl font-bold text-yellow-200 text-outlined">
                {selectedPlayer}
              </p>
              <p className="text-xl text-white mt-2 text-outlined">
                سيبدأ المناظرة
              </p>
            </div>
            <div className="text-lg text-white/90 text-outlined">
              سيبدأ الجولة الأولى خلال ثوانٍ...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LanternAnimation;