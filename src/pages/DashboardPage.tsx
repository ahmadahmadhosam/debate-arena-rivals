import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Timer, Users, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { debateManager } from '@/services/debateManager';

interface User {
  username: string;
  religion: string;
  isAuthenticated: boolean;
}

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [debateCode, setDebateCode] = useState('');
  const [preparationTime, setPreparationTime] = useState('1');
  const [roundTime, setRoundTime] = useState('5');
  const [roundCount, setRoundCount] = useState('5');
  const [finalTime, setFinalTime] = useState('5');
  const [isDark, setIsDark] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState('');
  const [isCreatingDebate, setIsCreatingDebate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/');
    }

    // تنظيف المناظرات القديمة
    debateManager.cleanupOldDebates();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('fromRandomQueue');
    localStorage.removeItem('currentDebate');
    debateManager.clearCurrentSession();
    navigate('/');
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const startPrivateDebate = async () => {
    if (isCreatingDebate) return;
    
    setError('');
    setIsCreatingDebate(true);
    
    try {
      const settings = {
        preparationTime: parseInt(preparationTime),
        roundTime: parseInt(roundTime),
        roundCount: parseInt(roundCount),
        finalTime: parseInt(finalTime)
      };

      const code = debateManager.createPrivateDebate(
        user?.username || 'مجهول',
        user?.religion || 'غير محدد',
        settings
      );

      if (!code) {
        setError('حدث خطأ في إنشاء المناظرة. حاول مرة أخرى.');
        return;
      }

      localStorage.removeItem('fromRandomQueue');
      console.log(`انتقال إلى المناظرة بالكود: ${code}`);
      navigate(`/debate/${code}`);
    } catch (error) {
      console.error('خطأ في إنشاء المناظرة:', error);
      setError('حدث خطأ في إنشاء المناظرة. حاول مرة أخرى.');
    } finally {
      setIsCreatingDebate(false);
    }
  };

  const joinPrivateDebate = () => {
    setError('');
    
    if (!debateCode.trim()) {
      setError('يرجى إدخال كود المناظرة');
      return;
    }
    
    if (localStorage.getItem('fromRandomQueue') === 'true') {
      setError('لا يمكنك دخول مناظرة خاصة بعد دخول الطابور العشوائي');
      return;
    }

    const normalizedCode = debateCode.toUpperCase().trim();
    const debate = debateManager.getDebate(normalizedCode);
    
    if (!debate) {
      setError('كود المناظرة غير صحيح أو المناظرة غير موجودة');
      return;
    }

    if (debate.opponent) {
      setError('المناظرة مكتملة بالفعل');
      return;
    }

    if (debate.creator === user?.username) {
      setError('لا يمكنك الدخول لمناظرتك الخاصة');
      return;
    }

    if (debate.creatorReligion === user?.religion) {
      setError('لا يمكن للأشخاص من نفس المذهب دخول مناظرة واحدة');
      return;
    }

    const joinedDebate = debateManager.joinPrivateDebate(
      normalizedCode,
      user?.username || 'مجهول',
      user?.religion || 'غير محدد'
    );

    if (!joinedDebate) {
      setError('فشل في الانضمام للمناظرة');
      return;
    }

    localStorage.removeItem('fromRandomQueue');
    navigate(`/debate/${normalizedCode}`);
  };

  const startRandomDebate = () => {
    const debateSettings = {
      code: 'RANDOM',
      preparationTime: parseInt(preparationTime),
      roundTime: parseInt(roundTime),
      roundCount: parseInt(roundCount),
      finalTime: parseInt(finalTime),
      isPrivate: false,
      creator: user?.username || 'مجهول',
      creatorReligion: user?.religion || 'غير محدد'
    };
    
    localStorage.setItem('fromRandomQueue', 'true');
    localStorage.setItem('currentDebate', JSON.stringify(debateSettings));
    navigate('/debate/random');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-islamic-gold-50 to-islamic-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-gold-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-gold-50 to-islamic-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* الشريط العلوي */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-reverse space-x-4">
            <div className="w-10 h-10 bg-islamic-gradient rounded-full flex items-center justify-center">
              <span className="text-white font-bold">🕌</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-islamic-gold-800 dark:text-islamic-gold-200">
                أرينا المناظرة
              </h1>
              <p className="text-sm text-muted-foreground">
                أهلاً {user.username}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-reverse space-x-2">
            <Badge variant="secondary" className="bg-islamic-gold-100 text-islamic-gold-800">
              {user.religion}
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>الإعدادات</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="w-full justify-start"
                  >
                    العودة لصفحة تسجيل الدخول
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={logout}
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 ml-2" />
                    تسجيل خروج
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* رسائل الخطأ */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* إعدادات المناظرة */}
        <Card className="islamic-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-reverse space-x-2">
              <Timer className="h-5 w-5" />
              <span>إعدادات المناظرة</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">وقت التحضير (دقيقة):</label>
              <Select value={preparationTime} onValueChange={setPreparationTime}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 60 }, (_, i) => i + 1).map((time) => (
                    <SelectItem key={time} value={time.toString()}>
                      {time} دقيقة
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">وقت كل جولة (دقيقة):</label>
              <Select value={roundTime} onValueChange={setRoundTime}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 60 }, (_, i) => i + 1).map((time) => (
                    <SelectItem key={time} value={time.toString()}>
                      {time} دقيقة
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">عدد الجولات:</label>
              <Select value={roundCount} onValueChange={setRoundCount}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((count) => (
                    <SelectItem key={count} value={count.toString()}>
                      {count} جولات
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">وقت النقاش النهائي (دقيقة):</label>
              <Select value={finalTime} onValueChange={setFinalTime}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 60 }, (_, i) => i + 1).map((time) => (
                    <SelectItem key={time} value={time.toString()}>
                      {time} دقيقة
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* خيارات المناظرة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* المناظرة الخاصة */}
          <Card className="islamic-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-reverse space-x-2">
                <Users className="h-5 w-5" />
                <span>مناظرة خاصة</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                أنشئ مناظرة خاصة وشارك الكود مع المناظر
              </p>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">كود المناظرة للدخول:</label>
                <Input
                  value={debateCode}
                  onChange={(e) => setDebateCode(e.target.value.toUpperCase())}
                  placeholder="أدخل الكود"
                  className="text-center text-lg font-mono"
                  maxLength={6}
                />
              </div>

              <div className="space-y-2">
                <Button
                  onClick={startPrivateDebate}
                  className="w-full islamic-button"
                  disabled={isCreatingDebate}
                >
                  {isCreatingDebate ? 'جاري الإنشاء...' : 'إنشاء مناظرة خاصة'}
                </Button>
                <Button
                  onClick={joinPrivateDebate}
                  variant="outline"
                  className="w-full"
                  disabled={!debateCode.trim()}
                >
                  دخول المناظرة بالكود
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* المناظرة العشوائية */}
          <Card className="islamic-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-reverse space-x-2">
                <Clock className="h-5 w-5" />
                <span>مناظرة عشوائية</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                انضم لمناظرة عشوائية مع مناظر من المذهب المختلف
              </p>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>وقت التحضير:</span>
                    <span className="font-medium">{preparationTime} دقيقة</span>
                  </div>
                  <div className="flex justify-between">
                    <span>وقت الجولة:</span>
                    <span className="font-medium">{roundTime} دقيقة</span>
                  </div>
                  <div className="flex justify-between">
                    <span>عدد الجولات:</span>
                    <span className="font-medium">{roundCount} جولات</span>
                  </div>
                  <div className="flex justify-between">
                    <span>وقت النهاية:</span>
                    <span className="font-medium">{finalTime} دقيقة</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={startRandomDebate}
                className="w-full islamic-button"
              >
                بدء مناظرة عشوائية
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* معلومات إضافية */}
        <Card className="islamic-card">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-islamic-gold-800 dark:text-islamic-gold-200">
                قواعد المناظرة
              </h3>
              <p className="text-sm text-muted-foreground">
                • يجب إنشاء حساب مسجل قبل تسجيل الدخول
              </p>
              <p className="text-sm text-muted-foreground">
                • لا يمكن للأشخاص من نفس المذهب دخول مناظرة واحدة
              </p>
              <p className="text-sm text-muted-foreground">
                • لا يمكن دخول مناظرة خاصة بعد دخول الطابور العشوائي
              </p>
              <p className="text-sm text-muted-foreground">
                • المناظرات الخاصة تحتاج لمناظر حقيقي للبدء
              </p>
              <p className="text-sm text-muted-foreground">
                • يمكن إنهاء الجولة مبكراً فقط للشخص الذي عليه الدور
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
