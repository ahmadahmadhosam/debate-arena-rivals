
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Users, MessageSquare, Settings } from 'lucide-react';
import DebateTimer from '@/components/DebateTimer';
import MediaControls from '@/components/MediaControls';

interface DebateSettings {
  code: string;
  roundTime: number;
  roundCount: number;
  isPrivate: boolean;
  creator: string;
  creatorReligion: string;
}

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

const DebatePage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<User | null>(null);
  const [debateSettings, setDebateSettings] = useState<DebateSettings | null>(null);
  const [opponent, setOpponent] = useState<User | null>(null);
  const [currentPhase, setCurrentPhase] = useState<'waiting' | 'preparation' | 'debate' | 'final' | 'ended'>('waiting');
  const [currentRound, setCurrentRound] = useState(1);
  const [activePlayer, setActivePlayer] = useState<'user' | 'opponent' | 'both' | 'none'>('none');
  const [preparationTime, setPreparationTime] = useState(60); // 60 ثانية للتحضير
  const [finalDiscussionTime, setFinalDiscussionTime] = useState(300); // 5 دقائق للنقاش النهائي
  
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

    // جلب إعدادات المناظرة
    const settings = localStorage.getItem('currentDebate');
    if (settings) {
      setDebateSettings(JSON.parse(settings));
    }

    // محاكاة دخول المناظر (في التطبيق الحقيقي سيكون عبر WebSocket)
    const timer = setTimeout(() => {
      if (code !== 'random') {
        // محاكاة دخول مناظر في الغرفة الخاصة
        const mockOpponent = {
          username: 'المناظر_المجهول',
          religion: JSON.parse(userData || '{}').religion === 'سني' ? 'شيعي' : 'سني'
        };
        setOpponent(mockOpponent);
        setCurrentPhase('preparation');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [code, navigate]);

  const handlePhaseTransition = () => {
    switch (currentPhase) {
      case 'preparation':
        setCurrentPhase('debate');
        // اختيار عشوائي لمن يبدأ
        setActivePlayer(Math.random() > 0.5 ? 'user' : 'opponent');
        break;
      case 'debate':
        if (currentRound < (debateSettings?.roundCount || 5)) {
          setCurrentRound(prev => prev + 1);
          // تبديل الأدوار
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
    switch (currentPhase) {
      case 'preparation':
        return {
          time: preparationTime,
          label: 'وقت التحضير',
          variant: 'warning' as const
        };
      case 'debate':
        return {
          time: (debateSettings?.roundTime || 5) * 60,
          label: `الجولة ${currentRound} من ${debateSettings?.roundCount || 5}`,
          variant: activePlayer === 'user' ? 'primary' as const : 'danger' as const
        };
      case 'final':
        return {
          time: finalDiscussionTime,
          label: 'النقاش النهائي',
          variant: 'warning' as const
        };
      default:
        return null;
    }
  };

  if (!user || !debateSettings) {
    return <div>جاري التحميل...</div>;
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
                مناظرة {debateSettings.isPrivate ? 'خاصة' : 'عشوائية'}
              </h1>
              {debateSettings.isPrivate && (
                <p className="text-sm text-muted-foreground">
                  الكود: {debateSettings.code}
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
                    <p className="text-muted-foreground">
                      {opponent ? 'جاري الاتصال...' : 'لم يدخل أحد بعد'}
                    </p>
                    {debateSettings.isPrivate && (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm">شارك هذا الكود مع المناظر:</p>
                        <p className="text-2xl font-mono font-bold text-islamic-gold-600">
                          {debateSettings.code}
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
                            {opponent ? opponent.username : 'لم يدخل بعد'}
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
                    {currentPhase !== 'waiting' && (
                      <MediaControls
                        isMyTurn={activePlayer === 'user' || activePlayer === 'both'}
                        autoMicControl={currentPhase === 'debate'}
                      />
                    )}
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
                  <span>وقت الجولة:</span>
                  <span>{debateSettings.roundTime} دقيقة</span>
                </div>
                <div className="flex justify-between">
                  <span>عدد الجولات:</span>
                  <span>{debateSettings.roundCount}</span>
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
