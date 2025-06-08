
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

  return (
    <div className="text-center space-y-6 p-8">
      <h3 className="text-xl font-bold text-islamic-gold-600">
        اختيار من سيبدأ المناظرة
      </h3>
      
      {!isAnimating && !showResult && (
        <div className="space-y-4">
          <p className="text-muted-foreground">اضغط لاختيار من سيبدأ بشكل عشوائي</p>
          <Button 
            onClick={startAnimation}
            className="bg-islamic-gradient text-white px-6 py-3"
          >
            🏮 إطلاق الفوانيس
          </Button>
        </div>
      )}

      {isAnimating && (
        <div className="space-y-6">
          <p className="text-islamic-gold-600 font-medium">الفوانيس تطير في السماء...</p>
          <div className="flex justify-center space-x-reverse space-x-8">
            <div className="lantern-container animate-bounce">
              <div className="lantern bg-yellow-400 text-white p-4 rounded-lg shadow-lg transform rotate-3">
                🏮<br />
                <span className="text-sm font-bold">{player1Name}</span>
              </div>
            </div>
            <div className="lantern-container animate-bounce" style={{ animationDelay: '0.5s' }}>
              <div className="lantern bg-red-400 text-white p-4 rounded-lg shadow-lg transform -rotate-3">
                🏮<br />
                <span className="text-sm font-bold">{player2Name}</span>
              </div>
            </div>
          </div>
          <div className="animate-pulse text-islamic-blue-600">
            ✨ جاري الاختيار... ✨
          </div>
        </div>
      )}

      {showResult && selectedPlayer && (
        <div className="space-y-4 animate-fade-in">
          <div className="text-6xl animate-bounce">🏮</div>
          <div className="bg-islamic-gold-50 border-2 border-islamic-gold-300 rounded-lg p-6">
            <h4 className="text-lg font-bold text-islamic-gold-600 mb-2">
              تم الاختيار!
            </h4>
            <p className="text-xl font-bold text-islamic-blue-600">
              {selectedPlayer} سيبدأ المناظرة
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            سيبدأ الجولة الأولى خلال ثوانٍ...
          </div>
        </div>
      )}
    </div>
  );
};

export default LanternAnimation;
