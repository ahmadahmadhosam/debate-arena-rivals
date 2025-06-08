import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Shuffle, BarChart } from 'lucide-react';
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
      autoMic: autoMic // إضافة خيار الميكروفون التلقائي
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

  const debateStats = debateManager.getDebateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-gold-50 to-islamic-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-bold">لوحة التحكم</h1>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/profile')}>
              {user?.username} ({user?.religion})
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/public-debates')}>
              مناظرات عامة
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* بطاقة المناظرات الخاصة */}
          <Card className="islamic-card">
            <CardHeader>
              <CardTitle className="text-center text-islamic-gold-600">
                المناظرات الخاصة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* قسم الدخول بالكود */}
              <div className="space-y-4">
                <h3 className="font-medium text-islamic-blue-600">الدخول بالكود</h3>
                <div className="flex space-x-reverse space-x-2">
                  <Input
                    type="text"
                    placeholder="أدخل كود المناظرة"
                    value={privateCode}
                    onChange={(e) => setPrivateCode(e.target.value.toUpperCase())}
                    className="flex-1"
                    maxLength={6}
                  />
                  <Button 
                    onClick={handleJoinPrivateDebate}
                    className="bg-islamic-blue-500 hover:bg-islamic-blue-600"
                  >
                    دخول
                  </Button>
                </div>
              </div>

              <Separator />

              {/* قسم إنشاء مناظرة خاصة */}
              <div className="space-y-4">
                <h3 className="font-medium text-islamic-gold-600">إنشاء مناظرة خاصة</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prep-time">وقت التحضير (دقيقة)</Label>
                    <Select value={preparationTime} onValueChange={setPreparationTime}>
                      <SelectTrigger>
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

                  <div>
                    <Label htmlFor="round-time">وقت الجولة (دقيقة)</Label>
                    <Select value={roundTime} onValueChange={setRoundTime}>
                      <SelectTrigger>
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

                  <div>
                    <Label htmlFor="round-count">عدد الجولات</Label>
                    <Select value={roundCount} onValueChange={setRoundCount}>
                      <SelectTrigger>
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

                  <div>
                    <Label htmlFor="final-time">وقت النهاية (دقيقة)</Label>
                    <Select value={finalTime} onValueChange={setFinalTime}>
                      <SelectTrigger>
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

                {/* خيار الميكروفون التلقائي */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-mic">تشغيل الميكروفون تلقائياً</Label>
                  <Switch
                    id="auto-mic"
                    checked={autoMic}
                    onCheckedChange={setAutoMic}
                  />
                </div>

                <Button 
                  onClick={handleCreatePrivateDebate}
                  className="w-full bg-islamic-gradient hover:opacity-90"
                >
                  إنشاء مناظرة خاصة
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* بطاقة المناظرات العشوائية */}
          <Card className="islamic-card">
            <CardHeader>
              <CardTitle className="text-center text-islamic-blue-600">
                المناظرات العشوائية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-islamic-blue-100 rounded-full mx-auto flex items-center justify-center">
                  <Shuffle className="h-10 w-10 text-islamic-blue-600" />
                </div>
                <p className="text-muted-foreground">
                  ابدأ مناظرة مع مناظر عشوائي من المذهب المختلف
                </p>
                <Button 
                  onClick={handleStartRandomDebate}
                  className="w-full bg-islamic-blue-500 hover:bg-islamic-blue-600"
                  size="lg"
                >
                  بدء مناظرة عشوائية
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* إحصائيات للمطورين */}
        <div className="mt-8 p-4 bg-muted rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 flex items-center space-x-reverse space-x-2">
            <BarChart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span>إحصائيات المناظرات</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{debateStats?.totalDebates}</div>
              <div className="text-sm text-gray-500">إجمالي المناظرات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{debateStats?.activeDebates}</div>
              <div className="text-sm text-gray-500">المناظرات النشطة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{debateStats?.waitingDebates}</div>
              <div className="text-sm text-gray-500">المناظرات في الانتظار</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{debateStats?.totalUsedCodes}</div>
              <div className="text-sm text-gray-500">إجمالي الأكواد المستخدمة</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
