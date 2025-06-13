import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Users, 
  MessageCircle, 
  UserCheck, 
  Gamepad2, 
  LogOut,
  Plus,
  Globe,
  Shuffle,
  Lock,
  User
} from 'lucide-react';
import { supabaseDebateManager } from '@/services/supabaseDebateManager';
import { useToast } from '@/hooks/use-toast';
import SettingsModal from '@/components/SettingsModal';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('app_user');
      navigate('/');
      return;
    }
    
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('app_user');
    toast({
      title: "تم تسجيل الخروج",
      description: "وداعاً، نتطلع لرؤيتك مرة أخرى",
      className: "bg-sky-500 text-white border-sky-600"
    });
    navigate('/');
  };

  const joinDebate = async () => {
    if (!joinCode.trim() || !user) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كود المناظرة",
        variant: "destructive"
      });
      return;
    }

    const debate = await supabaseDebateManager.joinDebate(
      joinCode,
      user.id,
      user.religion
    );

    if (debate) {
      toast({
        title: "تم الانضمام للمناظرة",
        description: "جاري تحميل المناظرة..."
      });
      navigate(`/debate/${joinCode}`);
    } else {
      toast({
        title: "خطأ",
        description: "كود المناظرة غير صحيح أو غير متاح",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-blue-600 font-semibold text-outlined">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-200 relative overflow-hidden">
      {/* عناصر الخلفية الزخرفية */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-96 h-96 bg-sky-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* الرأس */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-reverse space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-sky-800 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">🕌</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-800 drop-shadow-sm text-outlined">
                أهلاً {user?.username || 'بك'}
              </h1>
              <p className="text-blue-700 drop-shadow-sm text-outlined">
                المذهب: {user?.religion}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-reverse space-x-4">
            <Button
              onClick={() => navigate('/debates')}
              variant="outline"
              size="lg"
              className="bg-white/80 backdrop-blur-sm border-2 border-blue-300 hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 text-blue-700 text-outlined"
            >
              <Globe className="h-5 w-5 ml-2" />
              <span className="drop-shadow-sm">قائمة المناظرات</span>
            </Button>
            
            <Button
              onClick={() => navigate('/profile')}
              variant="outline"
              size="lg"
              className="bg-white/80 backdrop-blur-sm border-2 border-blue-300 hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 text-blue-700 text-outlined"
            >
              <User className="h-5 w-5 ml-2" />
              <span className="drop-shadow-sm">الملف الشخصي</span>
            </Button>
            
            <Button
              onClick={() => setIsSettingsOpen(true)}
              variant="outline"
              size="lg"
              className="bg-white/80 backdrop-blur-sm border-2 border-blue-300 hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 text-blue-700 text-outlined"
            >
              <Settings className="h-5 w-5 ml-2" />
              <span className="drop-shadow-sm">الإعدادات</span>
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              size="lg"
              className="bg-red-50/80 backdrop-blur-sm border-2 border-red-300 hover:bg-red-100 transform hover:scale-105 transition-all duration-200 text-red-700 text-outlined"
            >
              <LogOut className="h-5 w-5 ml-2" />
              <span className="drop-shadow-sm">خروج</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* الإجراءات الرئيسية */}
          <div className="space-y-6">
            {/* إنشاء المناظرات */}
            <Card className="shadow-2xl bg-white/90 backdrop-blur-sm border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-700 flex items-center drop-shadow-sm text-outlined">
                  <Plus className="h-6 w-6 ml-3" />
                  إنشاء مناظرة جديدة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => navigate('/create-debate')}
                  className="w-full bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white font-bold py-4 transform hover:scale-105 transition-all duration-200 shadow-lg text-outlined"
                >
                  <Plus className="h-5 w-5 ml-2" />
                  إنشاء مناظرة مخصصة
                </Button>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={() => navigate('/random-debates')}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 transform hover:scale-105 transition-all duration-200 shadow-lg text-outlined"
                  >
                    <Shuffle className="h-5 w-5 ml-2" />
                    عشوائية سريعة
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/debates')}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 transform hover:scale-105 transition-all duration-200 shadow-lg text-outlined"
                  >
                    <Globe className="h-5 w-5 ml-2" />
                    تصفح المناظرات
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* الانضمام للمناظرة */}
            <Card className="shadow-2xl bg-white/90 backdrop-blur-sm border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-700 flex items-center drop-shadow-sm text-outlined">
                  <UserCheck className="h-6 w-6 ml-3" />
                  الانضمام لمناظرة خاصة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="join-code" className="text-blue-700 font-semibold drop-shadow-sm text-outlined">
                    كود المناظرة
                  </Label>
                  <Input
                    id="join-code"
                    placeholder="أدخل كود المناظرة"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="border-2 border-blue-300 focus:border-blue-500 text-center font-mono text-lg text-blue-700 text-outlined"
                    onKeyPress={(e) => e.key === 'Enter' && joinDebate()}
                  />
                </div>
                <Button
                  onClick={joinDebate}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold py-3 transform hover:scale-105 transition-all duration-200 shadow-lg text-outlined"
                >
                  <MessageCircle className="h-5 w-5 ml-2" />
                  انضم للمناظرة
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* معلومات سريعة */}
          <Card className="shadow-2xl bg-white/90 backdrop-blur-sm border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700 drop-shadow-sm text-outlined">
                مرحباً بك في منصة المناظرات الإسلامية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-700 mb-2 text-outlined">🎯 هدف المنصة</h3>
                  <p className="text-blue-600 text-sm text-outlined">
                    منصة للحوار البناء والمناظرات الهادفة بين المذاهب الإسلامية
                  </p>
                </div>
                
                <div className="bg-sky-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-sky-700 mb-2 text-outlined">⚡ ميزات سريعة</h3>
                  <ul className="text-sky-600 text-sm space-y-1 text-outlined">
                    <li>• مناظرات مؤقتة ومنظمة</li>
                    <li>• تحكم تلقائي بالميكروفون</li>
                    <li>• مناظرات خاصة وعشوائية</li>
                    <li>• واجهة سهلة الاستخدام</li>
                  </ul>
                </div>
                
                <div className="bg-cyan-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-cyan-700 mb-2 text-outlined">📋 آداب المناظرة</h3>
                  <ul className="text-cyan-600 text-sm space-y-1 text-outlined">
                    <li>• احترام الرأي الآخر</li>
                    <li>• الالتزام بالأدلة الشرعية</li>
                    <li>• تجنب الإساءة الشخصية</li>
                    <li>• الهدف هو الوصول للحق</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default DashboardPage;