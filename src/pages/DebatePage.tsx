
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Users, MessageSquare, Settings, SkipForward, Clock, RefreshCw } from 'lucide-react';
import DebateTimer from '@/components/DebateTimer';
import MediaControls from '@/components/MediaControls';
import { debateManager } from '@/services/debateManager';

interface User {
  username: string;
  religion: string;
}

interface Comment {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
}

type DebatePhase = 'waiting' | 'preparation' | 'debate' | 'final' | 'ended';

const DebatePage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<User | null>(null);
  const [opponent, setOpponent] = useState<User | null>(null);
  const [currentPhase, setCurrentPhase] = useState<DebatePhase>('waiting');
  const [currentRound, setCurrentRound] = useState(1);
  const [activePlayer, setActivePlayer] = useState<'user' | 'opponent' | 'both' | 'none'>('none');
  const [isFromRandomQueue, setIsFromRandomQueue] = useState(false);
  const [debateSession, setDebateSession] = useState<any>(null);
  const [waitingMessage, setWaitingMessage] = useState('انتظار دخول المناظر...');
  
  // التعليقات المباشرة
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    // جلب بيانات المستخدم
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/');
      return;
    }

    const fromRandom = localStorage.getItem('fromRandomQueue') === 'true';
    setIsFromRandomQueue(fromRandom);

    if (code && code !== 'random') {
      handlePrivateDebate(code, fromRandom);
    } else {
      handleRandomDebate();
    }

    // التحقق من دخول مناظر جديد كل 3 ثوانٍ
    const checkInterval = setInterval(() => {
      if (code && code !== 'random' && currentPhase === 'waiting') {
        checkForOpponent(code);
      }
    }, 3000);

    return () => clearInterval(checkInterval);
  }, [code, navigate, currentPhase]);

  const handlePrivateDebate = (debateCode: string, fromRandom: boolean) => {
    const debate = debateManager.getDebate(debateCode);
    
    if (!debate) {
      alert('كود المناظرة غير صحيح أو المناظرة غير موجودة');
      navigate('/dashboard');
      return;
    }

    if (fromRandom) {
      alert('لا يمكنك دخول مناظرة خاصة من الطابور العشوائي');
      navigate('/dashboard');
      return;
    }

    setDebateSession(debate);
    debateManager.setCurrentSession(debate);

    // التحقق من وجود مناظر
    if (debate.opponent) {
      const userData = localStorage.getItem('user');
      if (userData) {
        const userObj = JSON.parse(userData);
        
        if (debate.creator === userObj.username) {
          // المستخدم الحالي هو المنشئ
          setOpponent({
            username: debate.opponent,
            religion: debate.opponentReligion || 'غير محدد'
          });
        } else {
          // المستخدم الحالي هو المناظر
          setOpponent({
            username: debate.creator,
            religion: debate.creatorReligion
          });
        }
        
        setCurrentPhase('preparation');
      }
    } else {
      setWaitingMessage(`في انتظار مناظر من المذهب ${debate.creatorReligion === 'سني' ? 'الشيعي' : 'السني'}`);
    }
  };

  const handleRandomDebate = () => {
    const settings = localStorage.getItem('currentDebate');
    if (settings) {
      const debateData = JSON.parse(settings);
      setDebateSession(debateData);
      setWaitingMessage('البحث عن مناظر من المذهب المختلف...');
      
      // محاكاة البحث العشوائي (يمكن تطويرها لاحقاً)
      setTimeout(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
          const userObj = JSON.parse(userData);
          const mockOpponent = {
            username: 'مناظر_عشوائي',
            religion: userObj.religion === 'سني' ? 'شيعي' : 'سني'
          };
          setOpponent(mockOpponent);
          setCurrentPhase('preparation');
        }
      }, 5000);
    }
  };

  const checkForOpponent = (debateCode: string) => {
    const debate = debateManager.getDebate(debateCode);
    if (debate && debate.opponent && !opponent) {
      const userData = localStorage.getItem('user');
      if (userData) {
        const userObj = JSON.parse(userData);
        
        if (debate.creator === userObj.username) {
          setOpponent({
            username: debate.opponent,
            religion: debate.opponentReligion || 'غير محدد'
          });
        } else {
          setOpponent({
            username: debate.creator,
            religion: debate.creatorReligion
          });
        }
        
        setCurrentPhase('preparation');
        setWaitingMessage('');
      }
    }
  };

  const handlePhaseTransition = () => {
    switch (currentPhase) {
      case 'preparation':
        setCurrentPhase('debate');
        const randomStart = Math.random() > 0.5 ? 'user' : 'opponent';
        setActivePlayer(randomStart);
        console.log(`تم اختيار ${randomStart === 'user' ? 'المستخدم' : 'المناظر'} لبدء المناظرة`);
        break;
      case 'debate':
        if (currentRound < (debateSession?.settings?.roundCount || debateSession?.roundCount || 5)) {
          setCurrentRound(prev => prev + 1);
          setActivePlayer(activePlayer === 'user' ? 'opponent' : 'user');
        } else {
          setCurrentPhase('final');
          setActivePlayer('both');
        }
        break;
      case 'final':
        setCurrentPhase('ended');
        setActivePlayer('none');
        break;
    }
  };

  const handleSkipRound = () => {
    if (activePlayer === 'user' && currentPhase === 'debate') {
      handlePhaseTransition();
    }
  };

  const addComment = () => {
    if (newComment.trim() && user) {
      const comment: Comment = {
        id: Date.now().toString(),
        username: user.username,
        message: newComment.trim(),
        timestamp: new Date()
      };
      setComments(prev => [...prev, comment]);
      setNewComment('');
    }
  };

  const getCurrentTimer = () => {
    const settings = debateSession?.settings || debateSession;
    
    switch (currentPhase) {
      case 'preparation':
        return {
          time: (settings?.preparationTime || 1) * 60,
          label: 'وقت التحضير',
          variant: 'warning' as const
        };
      case 'debate':
        return {
          time: (settings?.roundTime || 5) * 60,
          label: `الجولة ${currentRound} من ${settings?.roundCount || 5}`,
          variant: activePlayer === 'user' ? 'primary' as const : 'danger' as const
        };
      case 'final':
        return {
          time: (settings?.finalTime || 5) * 60,
          label: 'النقاش النهائي',
          variant: 'warning' as const
        };
      default:
        return null;
    }
  };

  const refreshOpponentSearch = () => {
    if (code && code !== 'random') {
      checkForOpponent(code);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-islamic-gold-50 to-islamic-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-gold-600 mx-auto"></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-lg font-bold">
                مناظرة {debateSession?.isPrivate !== false ? 'خاصة' : 'عشوائية'}
              </h1>
              {debateSession?.code && debateSession.code !== 'RANDOM' && (
                <p className="text-sm text-muted-foreground">
                  الكود: {debateSession.code}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-reverse space-x-2">
            <Badge variant="secondary">
              {user.religion}
            </Badge>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* منطقة المناظرة الرئيسية */}
          <div className="lg:col-span-3 space-y-6">
            {/* حالة المناظرة */}
            <Card className="islamic-card">
              <CardHeader>
                <CardTitle className="text-center">
                  {currentPhase === 'waiting' && 'انتظار دخول المناظر'}
                  {currentPhase === 'preparation' && 'فترة التحضير'}
                  {currentPhase === 'debate' && `الجولة ${currentRound}`}
                  {currentPhase === 'final' && 'النقاش النهائي'}
                  {currentPhase === 'ended' && 'انتهت المناظرة'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentPhase === 'waiting' ? (
                  <div className="text-center space-y-4">
                    <div className="animate-pulse">
                      <Users className="h-16 w-16 mx-auto text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">{waitingMessage}</p>
                    
                    {debateSession?.code && debateSession.code !== 'RANDOM' && (
                      <>
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-sm mb-2">شارك هذا الكود مع المناظر:</p>
                          <p className="text-2xl font-mono font-bold text-islamic-gold-600 mb-2">
                            {debateSession.code}
                          </p>
                          <Button 
                            onClick={refreshOpponentSearch}
                            variant="outline" 
                            size="sm"
                            className="flex items-center space-x-reverse space-x-2"
                          >
                            <RefreshCw className="h-4 w-4" />
                            <span>تحديث</span>
                          </Button>
                        </div>
                      </>
                    )}
                    
                    {(!debateSession?.code || debateSession.code === 'RANDOM') && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <Clock className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                        <p className="text-sm text-blue-700">
                          البحث عن مناظر من المذهب المختلف...
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* المؤقت */}
                    {getCurrentTimer() && (
                      <div className="flex justify-center">
                        <DebateTimer
                          initialTime={getCurrentTimer()!.time}
                          isActive={currentPhase !== 'ended'}
                          onTimeUp={handlePhaseTransition}
                          label={getCurrentTimer()!.label}
                          variant={getCurrentTimer()!.variant}
                        />
                      </div>
                    )}

                    {/* زر إنهاء الجولة */}
                    {currentPhase === 'debate' && activePlayer === 'user' && (
                      <div className="flex justify-center">
                        <Button
                          onClick={handleSkipRound}
                          variant="outline"
                          className="flex items-center space-x-reverse space-x-2"
                        >
                          <SkipForward className="h-4 w-4" />
                          <span>إنهاء جولتي</span>
                        </Button>
                      </div>
                    )}

                    {/* معلومات المناظرين */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg border-2 transition-colors ${
                        activePlayer === 'user' ? 'border-green-400 bg-green-50' : 'border-gray-200'
                      }`}>
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 bg-islamic-gradient rounded-full mx-auto flex items-center justify-center">
                            <span className="text-white font-bold">أنت</span>
                          </div>
                          <h3 className="font-medium">{user.username}</h3>
                          <Badge variant="secondary">{user.religion}</Badge>
                          {activePlayer === 'user' && currentPhase === 'debate' && (
                            <p className="text-xs text-green-600 font-medium">دورك للحديث</p>
                          )}
                        </div>
                      </div>

                      <div className={`p-4 rounded-lg border-2 transition-colors ${
                        activePlayer === 'opponent' ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      }`}>
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 bg-islamic-blue-500 rounded-full mx-auto flex items-center justify-center">
                            <span className="text-white font-bold">خصم</span>
                          </div>
                          <h3 className="font-medium">
                            {opponent ? opponent.username : 'في الانتظار...'}
                          </h3>
                          {opponent && (
                            <Badge variant="secondary">{opponent.religion}</Badge>
                          )}
                          {activePlayer === 'opponent' && currentPhase === 'debate' && (
                            <p className="text-xs text-red-600 font-medium">دور المناظر</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* أدوات التحكم في الميديا */}
                    <MediaControls
                      isMyTurn={activePlayer === 'user' || activePlayer === 'both'}
                      autoMicControl={currentPhase === 'debate'}
                      currentPhase={currentPhase}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* منطقة التعليقات المباشرة */}
          <div className="space-y-4">
            <Card className="islamic-card h-96">
              <CardHeader>
                <CardTitle className="flex items-center space-x-reverse space-x-2 text-sm">
                  <MessageSquare className="h-4 w-4" />
                  <span>التعليقات المباشرة</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-muted/50 p-2 rounded text-xs">
                      <div className="font-medium text-islamic-gold-600">
                        {comment.username}
                      </div>
                      <div>{comment.message}</div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-center text-muted-foreground text-xs">
                      لا توجد تعليقات بعد
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-reverse space-x-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="اكتب تعليقاً..."
                    className="text-xs"
                    onKeyPress={(e) => e.key === 'Enter' && addComment()}
                  />
                  <Button onClick={addComment} size="sm">
                    إرسال
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* معلومات المناظرة */}
            <Card className="islamic-card">
              <CardHeader>
                <CardTitle className="text-sm">معلومات المناظرة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>وقت التحضير:</span>
                  <span>{debateSettings.preparationTime} دقيقة</span>
                </div>
                <div className="flex justify-between">
                  <span>وقت الجولة:</span>
                  <span>{debateSettings.roundTime} دقيقة</span>
                </div>
                <div className="flex justify-between">
                  <span>عدد الجولات:</span>
                  <span>{debateSettings.roundCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>وقت النهاية:</span>
                  <span>{debateSettings.finalTime} دقيقة</span>
                </div>
                <div className="flex justify-between">
                  <span>النوع:</span>
                  <span>{debateSettings.isPrivate ? 'خاصة' : 'عشوائية'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebatePage;
