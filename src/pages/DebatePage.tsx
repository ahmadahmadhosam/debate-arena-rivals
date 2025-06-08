import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import LanternAnimation from '@/components/LanternAnimation';
import ClockTimer from '@/components/ClockTimer';

interface User {
  username: string;
  religion: string;
}

interface DebateSession {
  code: string;
  creator: string;
  creatorReligion: string;
  opponent?: string;
  opponentReligion?: string;
  settings: {
    preparationTime: number;
    roundTime: number;
    roundCount: number;
    finalTime: number;
    autoMic?: boolean;
  };
  isActive: boolean;
  createdAt: Date;
}

const DebatePage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [debateData, setDebateData] = useState<DebateSession | null>(null);
  const [debateSettings, setDebateSettings] = useState<any>(null);
  const [debateTitle, setDebateTitle] = useState<string>('المناظرة');
  const [currentPhase, setCurrentPhase] = useState<
    'waiting' | 'preparation' | 'round' | 'final' | 'selectStart'
  >('waiting');
  const [player1, setPlayer1] = useState<string>('');
  const [player2, setPlayer2] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState<boolean>(true);
  const [isRandomDebate, setIsRandomDebate] = useState<boolean>(false);
  const [isMicOn, setIsMicOn] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    } else {
      navigate('/');
      return;
    }

    const isFromRandomQueue = localStorage.getItem('fromRandomQueue') === 'true';
    
    if (code === 'random' || isFromRandomQueue) {
      setIsRandomDebate(true);
      setDebateTitle('مناظرة عشوائية');
      
      const currentDebateSettings = localStorage.getItem('currentDebate');
      if (currentDebateSettings) {
        const settings = JSON.parse(currentDebateSettings);
        setDebateSettings(settings);
        setCurrentPhase('waiting');
        setIsWaitingForOpponent(true);
      }
    } else {
      setDebateTitle('مناظرة خاصة');
      loadPrivateDebate();
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [code, navigate]);

  const loadPrivateDebate = () => {
    if (!code || code === 'random') return;
    
    const debate = debateManager.getDebate(code);
    if (!debate) {
      alert('المناظرة غير موجودة');
      navigate('/dashboard');
      return;
    }

    setDebateData(debate);
    setDebateSettings(debate.settings);
    
    if (debate.opponent && debate.isActive) {
      setCurrentPhase('preparation');
      setPlayer1(debate.creator);
      setPlayer2(debate.opponent);
      setIsWaitingForOpponent(false);
    } else {
      setCurrentPhase('waiting');
      setIsWaitingForOpponent(true);
    }
  };

  const handlePlayerSelected = (playerName: string) => {
    setSelectedPlayer(playerName);
    setCurrentPhase('preparation');
  };

  const startRound = () => {
    setCurrentPhase('round');
  };

  const endRound = () => {
    if (currentRound < debateSettings.roundCount) {
      setCurrentRound(currentRound + 1);
      setCurrentPhase('preparation');
    } else {
      setCurrentPhase('final');
    }
  };

  const toggleMic = async () => {
    try {
      if (!mediaStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
      }

      const audioTracks = mediaStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks.forEach(track => track.enabled = !isMicOn);
        setIsMicOn(!isMicOn);
      } else {
        console.error('No audio tracks available.');
      }
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const getWaitingMessage = () => {
    if (!currentUser) return 'انتظار...';
    
    const opponentReligion = currentUser.religion === 'سني' ? 'شيعي' : 'سني';
    return `انتظار مناظر ${opponentReligion}`;
  };

  const renderContent = () => {
    if (currentPhase === 'waiting') {
      return (
        <div className="text-center space-y-6 p-8">
          <div className="w-24 h-24 bg-islamic-gold-100 rounded-full mx-auto flex items-center justify-center animate-pulse">
            <Users className="h-12 w-12 text-islamic-gold-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-islamic-gold-600 mb-2">
              {getWaitingMessage()}
            </h2>
            {debateData && (
              <div className="bg-islamic-gold-50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-muted-foreground mb-2">
                  كود المناظرة: <span className="font-mono font-bold">{debateData.code}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  شارك هذا الكود مع الآخرين للانضمام
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (currentPhase === 'selectStart') {
      return (
        <LanternAnimation
          player1Name={player1}
          player2Name={player2}
          onPlayerSelected={handlePlayerSelected}
        />
      );
    }

    if (currentPhase === 'preparation') {
      return (
        <div className="text-center space-y-6 p-8">
          <h3 className="text-xl font-bold text-islamic-gold-600">
            الجولة {currentRound} - فترة التحضير
          </h3>
          <p className="text-muted-foreground">
            {selectedPlayer} يبدأ الجولة
          </p>
          <ClockTimer
            initialTime={debateSettings.preparationTime * 60}
            isActive={true}
            onTimeUp={startRound}
            label="وقت التحضير"
          />
        </div>
      );
    }

    if (currentPhase === 'round') {
      return (
        <div className="text-center space-y-6 p-8">
          <h3 className="text-xl font-bold text-islamic-blue-600">
            الجولة {currentRound} - المناظرة جارية
          </h3>
          <ClockTimer
            initialTime={debateSettings.roundTime * 60}
            isActive={true}
            onTimeUp={endRound}
            label="وقت الجولة"
            variant="warning"
          />
          <div className="flex justify-center space-x-4">
            <Button
              onClick={toggleMic}
              variant="outline"
            >
              {isMicOn ? (
                <>
                  <Mic className="h-4 w-4 ml-2" />
                  إيقاف الميكروفون
                </>
              ) : (
                <>
                  <MicOff className="h-4 w-4 ml-2" />
                  تشغيل الميكروفون
                </>
              )}
            </Button>
            <Button
              onClick={toggleMute}
              variant="outline"
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-4 w-4 ml-2" />
                  إلغاء الكتم
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 ml-2" />
                  كتم الصوت
                </>
              )}
            </Button>
          </div>
        </div>
      );
    }

    if (currentPhase === 'final') {
      return (
        <div className="text-center space-y-6 p-8">
          <h3 className="text-xl font-bold text-red-600">
            المناظرة انتهت - وقت النهاية
          </h3>
          <ClockTimer
            initialTime={debateSettings.finalTime * 60}
            isActive={true}
            onTimeUp={() => alert('انتهى الوقت!')}
            label="وقت النهاية"
            variant="danger"
          />
        </div>
      );
    }

    return <div className="text-center">Loading...</div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-gold-50 to-islamic-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* الشريط العلوي */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-reverse space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-islamic-gold-800 dark:text-islamic-gold-200">
                {debateTitle}
              </h1>
              {debateData && (
                <p className="text-sm text-muted-foreground">
                  كود المناظرة: {debateData.code}
                </p>
              )}
            </div>
          </div>
          
          {/* إعدادات المناظرة */}
          <div className="flex items-center space-x-reverse space-x-4 text-sm">
            {debateSettings && (
              <>
                <span>التحضير: {debateSettings.preparationTime} دقيقة</span>
                <span>الجولة: {debateSettings.roundTime} دقيقة</span>
                <span>الجولات: {debateSettings.roundCount}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="max-w-6xl mx-auto p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default DebatePage;
