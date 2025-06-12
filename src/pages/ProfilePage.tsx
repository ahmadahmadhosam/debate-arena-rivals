import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Users, Trophy, Clock, Globe, Lock, MoreVertical, Camera, Mic } from 'lucide-react';
import { supabaseDebateManager, Debate } from '@/services/supabaseDebateManager';
import { useToast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [userDebates, setUserDebates] = useState<Debate[]>([]);
  const [stats, setStats] = useState({
    totalDebates: 0,
    completedDebates: 0,
    publicDebates: 0,
    privateDebates: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, [navigate]);

  const checkAuth = async () => {
    const appUser = localStorage.getItem('app_user');
    if (!appUser) {
      navigate('/');
      return;
    }
    
    try {
      const userData = JSON.parse(appUser);
      setUser(userData);
      await loadUserDebates(userData.id);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/');
    }
  };

  const loadUserDebates = async (userId: string) => {
    try {
      const debates = await supabaseDebateManager.getUserDebates(userId);
      setUserDebates(debates);

      setStats({
        totalDebates: debates.length,
        completedDebates: debates.filter(d => d.opponent_id).length,
        publicDebates: debates.filter(d => d.is_public).length,
        privateDebates: debates.filter(d => !d.is_public).length
      });
    } catch (error) {
      console.error('Error loading user debates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const publishDebate = async (debateId: string, isPublic: boolean) => {
    try {
      const success = await supabaseDebateManager.publishDebate(debateId, isPublic);
      if (success) {
        toast({
          title: "تم تحديث المناظرة",
          description: isPublic ? "تم نشر المناظرة" : "تم جعل المناظرة خاصة"
        });
        await loadUserDebates(user.id);
      } else {
        toast({
          title: "خطأ",
          description: "فشل في تحديث المناظرة",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error publishing debate:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث المناظرة",
        variant: "destructive"
      });
    }
  };

  const formatTime = (minutes: number) => {
    return `${minutes} دقيقة`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-islamic-gold-50 to-islamic-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
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
              className="p-2 text-outlined"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-islamic-gold-800 dark:text-islamic-gold-200 text-outlined">
                الملف الشخصي
              </h1>
              <p className="text-sm text-muted-foreground text-outlined">
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
            <CardTitle className="flex items-center space-x-reverse space-x-2 text-outlined">
              <Users className="h-5 w-5" />
              <span>معلومات الحساب</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-outlined">اسم المستخدم:</span>
              <span className="font-medium text-outlined">{user?.username}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-outlined">المذهب:</span>
              <Badge variant="secondary" className="bg-islamic-gold-100 text-islamic-gold-800 text-outlined">
                {user?.religion}
              </Badge>
            </div>
            <Separator />
            
            {/* إحصائيات المناظرات */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 text-outlined">{stats.totalDebates}</div>
                <div className="text-xs text-muted-foreground text-outlined">إجمالي المناظرات</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600 text-outlined">{stats.completedDebates}</div>
                <div className="text-xs text-muted-foreground text-outlined">مناظرات مكتملة</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 text-outlined">{stats.publicDebates}</div>
                <div className="text-xs text-muted-foreground text-outlined">مناظرات عامة</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 text-outlined">{stats.privateDebates}</div>
                <div className="text-xs text-muted-foreground text-outlined">مناظرات خاصة</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* المناظرات المحفوظة */}
        <Card className="islamic-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-reverse space-x-2 text-outlined">
              <Trophy className="h-5 w-5" />
              <span>مناظراتي المحفوظة</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userDebates.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-outlined">لم تقم بحفظ أي مناظرات بعد</p>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="mt-4 text-outlined"
                  variant="outline"
                >
                  ابدأ مناظرة جديدة
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userDebates.map((debate) => (
                  <div key={debate.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-reverse space-x-2">
                        <Badge variant="outline" className="font-mono text-outlined">
                          {debate.code}
                        </Badge>
                        {debate.opponent_id ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-outlined">
                            مكتملة
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-outlined">في الانتظار</Badge>
                        )}
                        {debate.is_public ? (
                          <Badge variant="default" className="bg-blue-100 text-blue-800 text-outlined">
                            <Globe className="h-3 w-3 ml-1" />
                            عامة
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 text-outlined">
                            <Lock className="h-3 w-3 ml-1" />
                            خاصة
                          </Badge>
                        )}
                        {debate.is_random && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-outlined">
                            عشوائية
                          </Badge>
                        )}
                      </div>
                      
                      {/* قائمة خيارات النشر */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-outlined">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => publishDebate(debate.id, true)}
                            className="flex items-center space-x-reverse space-x-2 text-outlined"
                          >
                            <Globe className="h-4 w-4" />
                            <span>نشر كمناظرة عامة</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => publishDebate(debate.id, false)}
                            className="flex items-center space-x-reverse space-x-2 text-outlined"
                          >
                            <Lock className="h-4 w-4" />
                            <span>جعل المناظرة خاصة</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground text-outlined">المنشئ: </span>
                        <span className="font-medium text-outlined">
                          {debate.creator_id === user.id ? 'أنت' : 'مناظر آخر'} ({debate.creator_religion})
                        </span>
                      </div>
                      {debate.opponent_id ? (
                        <div>
                          <span className="text-muted-foreground text-outlined">المناظر: </span>
                          <span className="font-medium text-outlined">
                            {debate.opponent_id === user.id ? 'أنت' : 'مناظر آخر'} ({debate.opponent_religion})
                          </span>
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-outlined">في انتظار مناظر...</div>
                      )}
                    </div>

                    {/* تفاصيل المناظرة */}
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div className="flex items-center space-x-reverse space-x-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-outlined">التحضير: {formatTime(debate.settings.preparationTime)}</span>
                        </div>
                        <div className="flex items-center space-x-reverse space-x-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-outlined">الجولة: {formatTime(debate.settings.roundTime)}</span>
                        </div>
                        <div className="text-outlined">
                          <span>الجولات: {debate.settings.roundCount}</span>
                        </div>
                        <div className="text-outlined">
                          <span>النهاية: {formatTime(debate.settings.finalTime)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {debate.settings.autoMic && (
                          <div className="flex items-center text-green-600">
                            <Mic className="h-3 w-3 ml-1" />
                            <span className="text-xs text-outlined">ميكروفون تلقائي</span>
                          </div>
                        )}
                        {debate.settings.cameraOptional && (
                          <div className="flex items-center text-blue-600">
                            <Camera className="h-3 w-3 ml-1" />
                            <span className="text-xs text-outlined">كاميرا اختيارية</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground text-outlined">
                      تاريخ الإنشاء: {formatDate(debate.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;