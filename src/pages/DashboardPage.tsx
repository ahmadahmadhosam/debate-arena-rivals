
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Shuffle, Users, Code, BarChart, Settings, LogOut } from 'lucide-react';
import { debateManager } from '@/services/debateManager';

interface User {
  username: string;
  religion: string;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [privateCode, setPrivateCode] = useState('');
  const [preparationTime, setPreparationTime] = useState('1');
  const [roundTime, setRoundTime] = useState('5');
  const [roundCount, setRoundCount] = useState('5');
  const [finalTime, setFinalTime] = useState('5');
  const [autoMic, setAutoMic] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleJoinPrivateDebate = () => {
    if (!privateCode.trim()) {
      alert('يرجى إدخال كود المناظرة');
      return;
    }

    const debate = debateManager.getDebate(privateCode.trim().toUpperCase());
    
    if (!debate) {
      alert('كود المناظرة غير صحيح');
      setPrivateCode('');
      return;
    }

    if (debate.opponent) {
      alert('هذه المناظرة ممتلئة بالفعل');
      setPrivateCode('');
      return;
    }

    if (debate.creator === user?.username) {
      alert('لا يمكنك الدخول لمناظرة أنشأتها أنت');
      setPrivateCode('');
      return;
    }

    if (debate.creatorReligion === user?.religion) {
      alert('لا يمكنك مناظرة شخص من نفس المذهب');
      setPrivateCode('');
      return;
    }

    const joinResult = debateManager.joinPrivateDebate(
      privateCode.trim().toUpperCase(),
      user?.username || '',
      user?.religion || ''
    );

    if (joinResult) {
      console.log('تم الانضمام بنجاح للمناظرة:', privateCode);
      localStorage.removeItem('fromRandomQueue');
      navigate(`/debate/${privateCode.trim().toUpperCase()}`);
    } else {
      alert('فشل في الانضمام للمناظرة');
      setPrivateCode('');
    }
  };

  const handleCreatePrivateDebate = () => {
    if (!preparationTime || !roundTime || !roundCount || !finalTime) {
      alert('يرجى ملء جميع الحقول');
      return;
    }

    const settings = {
      preparationTime: Number(preparationTime),
      roundTime: Number(roundTime),
      roundCount: Number(roundCount),
      finalTime: Number(finalTime),
      autoMic: autoMic
    };

    const code = debateManager.createPrivateDebate(
      user?.username || '',
      user?.religion || '',
      settings
    );

    if (code) {
      console.log('انتقال إلى المناظرة بالكود:', code);
      localStorage.removeItem('fromRandomQueue');
      navigate(`/debate/${code}`);
    } else {
      alert('فشل في إنشاء المناظرة');
    }
  };

  const handleStartRandomDebate = () => {
    const settings = {
      preparationTime: 1,
      roundTime: 5,
      roundCount: 5,
      finalTime: 5,
      autoMic: true
    };

    localStorage.setItem('currentDebate', JSON.stringify(settings));
    localStorage.setItem('fromRandomQueue', 'true');
    navigate('/debate/random');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-gold-50 to-islamic-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* الشريط العلوي المحسن */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-reverse space-x-4">
            <div className="w-10 h-10 bg-islamic-gradient rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">م</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-islamic-gold-800 dark:text-islamic-gold-200">
                منصة المناظرات الإسلامية
              </h1>
              <p className="text-sm text-muted-foreground">
                مرحباً {user?.username} ({user?.religion})
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-reverse space-x-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
              <Users className="h-4 w-4 ml-2" />
              الملف الشخصي
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/public-debates')}>
              <BarChart className="h-4 w-4 ml-2" />
              مناظرات عامة
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 ml-2" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* بطاقة الدخول بالكود */}
          <Card className="islamic-card shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-islamic-blue-50 dark:bg-islamic-blue-900/20">
              <CardTitle className="text-center text-islamic-blue-600 flex items-center justify-center space-x-reverse space-x-2">
                <Code className="h-6 w-6" />
                <span>الدخول بالكود</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-islamic-blue-100 rounded-full mx-auto flex items-center justify-center">
                  <Code className="h-8 w-8 text-islamic-blue-600" />
                </div>
                <p className="text-muted-foreground text-sm">
                  ادخل كود المناظرة للانضمام إلى مناظرة خاصة
                </p>
                <div className="space-y-3">
                  <Input
                    type="text"
                    placeholder="أدخل كود المناظرة (6 أحرف)"
                    value={privateCode}
                    onChange={(e) => setPrivateCode(e.target.value.toUpperCase())}
                    className="text-center text-lg font-mono tracking-widest"
                    maxLength={6}
                  />
                  <Button 
                    onClick={handleJoinPrivateDebate}
                    className="w-full bg-islamic-blue-500 hover:bg-islamic-blue-600 text-white"
                    size="lg"
                  >
                    دخول المناظرة
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* بطاقة إنشاء مناظرة خاصة */}
          <Card className="islamic-card shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-islamic-gold-50 dark:bg-islamic-gold-900/20">
              <CardTitle className="text-center text-islamic-gold-600 flex items-center justify-center space-x-reverse space-x-2">
                <Users className="h-6 w-6" />
                <span>إنشاء مناظرة خاصة</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prep-time" className="text-sm font-medium">وقت التحضير</Label>
                  <Select value={preparationTime} onValueChange={setPreparationTime}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="اختر الوقت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 دقيقة</SelectItem>
                      <SelectItem value="2">2 دقيقة</SelectItem>
                      <SelectItem value="3">3 دقيقة</SelectItem>
                      <SelectItem value="5">5 دقيقة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="round-time" className="text-sm font-medium">وقت الجولة</Label>
                  <Select value={roundTime} onValueChange={setRoundTime}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="اختر الوقت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 دقيقة</SelectItem>
                      <SelectItem value="5">5 دقيقة</SelectItem>
                      <SelectItem value="7">7 دقيقة</SelectItem>
                      <SelectItem value="10">10 دقيقة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="round-count" className="text-sm font-medium">عدد الجولات</Label>
                  <Select value={roundCount} onValueChange={setRoundCount}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="اختر العدد" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">جولة واحدة</SelectItem>
                      <SelectItem value="3">3 جولات</SelectItem>
                      <SelectItem value="5">5 جولات</SelectItem>
                      <SelectItem value="7">7 جولات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="final-time" className="text-sm font-medium">وقت النهاية</Label>
                  <Select value={finalTime} onValueChange={setFinalTime}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="اختر الوقت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 دقيقة</SelectItem>
                      <SelectItem value="5">5 دقيقة</SelectItem>
                      <SelectItem value="7">7 دقيقة</SelectItem>
                      <SelectItem value="10">10 دقيقة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-mic" className="text-sm font-medium">تشغيل الميكروفون تلقائياً</Label>
                  <Switch
                    id="auto-mic"
                    checked={autoMic}
                    onCheckedChange={setAutoMic}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  سيتم تشغيل الميكروفون تلقائياً في بداية كل جولة
                </p>
              </div>

              <Button 
                onClick={handleCreatePrivateDebate}
                className="w-full bg-islamic-gradient hover:opacity-90 text-white"
                size="lg"
              >
                إنشاء مناظرة خاصة
              </Button>
            </CardContent>
          </Card>

          {/* بطاقة المناظرات العشوائية */}
          <Card className="islamic-card shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-green-50 dark:bg-green-900/20">
              <CardTitle className="text-center text-green-600 flex items-center justify-center space-x-reverse space-x-2">
                <Shuffle className="h-6 w-6" />
                <span>المناظرات العشوائية</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                  <Shuffle className="h-10 w-10 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">مناظرة سريعة</h3>
                  <p className="text-muted-foreground text-sm">
                    ابدأ مناظرة فورية مع مناظر عشوائي من المذهب المختلف
                  </p>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>وقت التحضير:</span>
                    <span className="font-medium">1 دقيقة</span>
                  </div>
                  <div className="flex justify-between">
                    <span>وقت الجولة:</span>
                    <span className="font-medium">5 دقائق</span>
                  </div>
                  <div className="flex justify-between">
                    <span>عدد الجولات:</span>
                    <span className="font-medium">5 جولات</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الميكروفون:</span>
                    <span className="font-medium">تلقائي</span>
                  </div>
                </div>

                <Button 
                  onClick={handleStartRandomDebate}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  size="lg"
                >
                  <Shuffle className="h-5 w-5 ml-2" />
                  بدء مناظرة عشوائية
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
