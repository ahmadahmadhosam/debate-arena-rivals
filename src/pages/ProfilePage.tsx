
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Users, Trophy, Clock, Eye, EyeOff } from 'lucide-react';
import { debateManager } from '@/services/debateManager';

interface User {
  username: string;
  religion: string;
  isAuthenticated: boolean;
}

interface PublishedDebate {
  code: string;
  title: string;
  creator: string;
  creatorReligion: string;
  opponent?: string;
  opponentReligion?: string;
  isPublic: boolean;
  publishedAt: Date;
  settings: {
    preparationTime: number;
    roundTime: number;
    roundCount: number;
    finalTime: number;
  };
}

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [publishedDebates, setPublishedDebates] = useState<PublishedDebate[]>([]);
  const [stats, setStats] = useState({
    totalDebates: 0,
    completedDebates: 0,
    publishedDebates: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadUserData(JSON.parse(userData));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const loadUserData = (userData: User) => {
    // تحميل المناظرات المنشورة
    const debates = getPublishedDebates();
    const userDebates = debates.filter(d => 
      d.creator === userData.username || d.opponent === userData.username
    );
    setPublishedDebates(userDebates);

    // حساب الإحصائيات
    setStats({
      totalDebates: userDebates.length,
      completedDebates: userDebates.filter(d => d.opponent).length,
      publishedDebates: userDebates.filter(d => d.isPublic).length
    });
  };

  const getPublishedDebates = (): PublishedDebate[] => {
    const debates = localStorage.getItem('publishedDebates');
    return debates ? JSON.parse(debates) : [];
  };

  const savePublishedDebates = (debates: PublishedDebate[]) => {
    localStorage.setItem('publishedDebates', JSON.stringify(debates));
  };

  const toggleDebateVisibility = (code: string) => {
    const debates = getPublishedDebates();
    const debateIndex = debates.findIndex(d => d.code === code);
    
    if (debateIndex !== -1) {
      debates[debateIndex].isPublic = !debates[debateIndex].isPublic;
      savePublishedDebates(debates);
      loadUserData(user!);
    }
  };

  const publishCurrentDebate = () => {
    // هذه الوظيفة ستتم إضافتها لاحقاً في صفحة المناظرة
    console.log('نشر المناظرة الحالية');
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
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-islamic-gold-800 dark:text-islamic-gold-200">
                الملف الشخصي
              </h1>
              <p className="text-sm text-muted-foreground">
                إدارة حسابك ومناظراتك
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* معلومات المستخدم */}
        <Card className="islamic-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-reverse space-x-2">
              <Users className="h-5 w-5" />
              <span>معلومات الحساب</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">اسم المستخدم:</span>
              <span className="font-medium">{user.username}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">المذهب:</span>
              <Badge variant="secondary" className="bg-islamic-gold-100 text-islamic-gold-800">
                {user.religion}
              </Badge>
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-islamic-gold-600">{stats.totalDebates}</div>
                <div className="text-xs text-muted-foreground">إجمالي المناظرات</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.completedDebates}</div>
                <div className="text-xs text-muted-foreground">مناظرات مكتملة</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.publishedDebates}</div>
                <div className="text-xs text-muted-foreground">مناظرات عامة</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* المناظرات المنشورة */}
        <Card className="islamic-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-reverse space-x-2">
              <Trophy className="h-5 w-5" />
              <span>مناظراتي</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {publishedDebates.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لم تقم بنشر أي مناظرات بعد</p>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="mt-4"
                  variant="outline"
                >
                  ابدأ مناظرة جديدة
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {publishedDebates.map((debate) => (
                  <div key={debate.code} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-reverse space-x-2">
                        <Badge variant="outline" className="font-mono">
                          {debate.code}
                        </Badge>
                        {debate.opponent && (
                          <Badge variant="secondary">مكتملة</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-reverse space-x-2">
                        <Switch
                          checked={debate.isPublic}
                          onCheckedChange={() => toggleDebateVisibility(debate.code)}
                        />
                        {debate.isPublic ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">المنشئ: </span>
                        <span className="font-medium">{debate.creator} ({debate.creatorReligion})</span>
                      </div>
                      {debate.opponent && (
                        <div>
                          <span className="text-muted-foreground">المناظر: </span>
                          <span className="font-medium">{debate.opponent} ({debate.opponentReligion})</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-reverse space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-reverse space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{debate.settings.roundTime} دقيقة/جولة</span>
                      </div>
                      <div>
                        <span>{debate.settings.roundCount} جولات</span>
                      </div>
                      <div>
                        <span>{debate.isPublic ? 'عامة' : 'خاصة'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* معلومات إضافية */}
        <Card className="islamic-card">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-islamic-gold-800 dark:text-islamic-gold-200">
                إدارة المناظرات
              </h3>
              <p className="text-sm text-muted-foreground">
                • يمكنك جعل مناظراتك عامة ليراها الآخرون
              </p>
              <p className="text-sm text-muted-foreground">
                • المناظرات العامة تظهر في صفحة المناظرات العامة
              </p>
              <p className="text-sm text-muted-foreground">
                • يمكنك التحكم في خصوصية كل مناظرة على حدة
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
