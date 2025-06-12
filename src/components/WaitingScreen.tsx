import React, { useState, useEffect } from 'react';
import { Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WaitingScreenProps {
  message: string;
  debateCode?: string;
  isPrivateDebate?: boolean;
}

const WaitingScreen: React.FC<WaitingScreenProps> = ({ message, debateCode, isPrivateDebate }) => {
  const tips = [
    "المناظرة الناجحة تبدأ بفهمك لرأي الآخر",
    "سُبْحَانَ اللَّهِ ، الْحَمْدُ لِلَّهِ",
    "لَا إِلَـٰهَ إِلَّا اللَّـهُ",
    "اَللَّـهُ أَكْبَرُ"
  ];

  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [copied, setCopied] = useState(false);

  // تأثير الكتابة المتقطعة
  useEffect(() => {
    const currentTip = tips[currentTipIndex];
    let charIndex = 0;
    setDisplayedText('');
    setIsTyping(true);

    const typingInterval = setInterval(() => {
      if (charIndex < currentTip.length) {
        setDisplayedText(currentTip.substring(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [currentTipIndex]);

  // تغيير النصيحة كل 5 ثواني
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = async () => {
    if (debateCode) {
      try {
        await navigator.clipboard.writeText(debateCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('فشل في نسخ الكود:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 flex items-center justify-center relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* كود المناظرة للمناظرات الخاصة */}
      {isPrivateDebate && debateCode && (
        <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
          <div className="flex items-center space-x-reverse space-x-3">
            <span className="text-white font-bold text-lg font-mono tracking-wider border border-white/50 rounded px-3 py-1 text-outlined">
              {debateCode}
            </span>
            <Button
              onClick={copyToClipboard}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-300" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-white/80 text-xs mt-1 border border-white/30 rounded px-2 py-1 inline-block text-outlined">
            كود المناظرة
          </p>
        </div>
      )}

      <div className="text-center space-y-8 p-8 max-w-2xl mx-auto relative z-10">
        {/* دائرة التحميل */}
        <div className="flex justify-center">
          <Loader2 className="h-20 w-20 text-white animate-spin" />
        </div>
        
        {/* رسالة الانتظار */}
        <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 border-2 border-white/30 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg border border-white/40 rounded-lg px-4 py-2 inline-block text-outlined">
            {message}
          </h2>
        </div>
        
        {/* نصيحة اليوم مع التأثيرات البصرية المحسنة */}
        <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 border-2 border-white/40 shadow-2xl relative overflow-hidden">
          {/* تأثير الضوء المتحرك */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-x-12 animate-pulse"></div>
          
          <h3 className="text-xl font-bold text-white/95 mb-6 relative z-10 border border-white/50 rounded-lg px-4 py-2 inline-block text-outlined">
            نصيحة اليوم:
          </h3>
          
          <div className="relative z-10 min-h-[60px] flex items-center justify-center">
            <p className="text-white text-xl font-medium leading-relaxed text-center relative border border-white/50 rounded-lg px-4 py-3">
              <span 
                className="bg-gradient-to-r from-yellow-200 via-white to-sky-200 bg-clip-text text-transparent animate-pulse text-outlined"
                style={{
                  textShadow: '0 0 20px rgba(255,255,255,0.5)',
                  filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
                }}
              >
                "{displayedText}"
              </span>
              {isTyping && (
                <span className="animate-pulse text-white ml-1 text-outlined">|</span>
              )}
            </p>
          </div>
        </div>
        
        {/* مؤشر النصائح المحسن */}
        <div className="flex justify-center space-x-reverse space-x-3">
          {tips.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-500 border ${
                index === currentTipIndex 
                  ? 'bg-white shadow-lg scale-125 border-white' 
                  : 'bg-white/50 hover:bg-white/70 border-white/50'
              }`}
            />
          ))}
        </div>

        {/* تأثير الجسيمات المتحركة */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-white/30 rounded-full animate-ping border border-white/40`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WaitingScreen;