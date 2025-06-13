import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Mic, 
  Camera, 
  Globe,
  Lock,
  Settings,
  User,
  Shuffle
} from 'lucide-react';
import { supabaseDebateManager, Debate } from '@/services/supabaseDebateManager';
import { useToast } from '@/hooks/use-toast';
import SettingsModal from '@/components/SettingsModal';

const MainDebateList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [publicDebates, setPublicDebates] = useState<Debate[]>([]);
  const [randomDebates, setRandomDebates] = useState<Debate[]>([]);
  const [expandedDebate, setExpandedDebate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchDebates();
    
    // تحديث المناظرات كل 5 ثواني
    const interval = setInterval(fetchDebates, 5000);
    return () => clearInterval(interval);
  }, []);

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
      navigate('/');
    }
  };

  const fetchDebates = async () => {
    try {
      const [publicData, randomData] = await Promise.all([
        supabaseDebateManager.getPublicDebates(),
        supabaseDebateManager.getRandomDebates()
      ]);
      
      setPublicDebates(publicData);
      setRandomDebates(randomData);
    } catch (error) {
      console.error('Error fetching debates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinDebate = async (debate: Debate) => {
    if (!user) return;

    if (debate.creator_religion === user.religion) {
      toast({
        title: "خطأ",
        description: "لا يمكنك الانضمام لمناظرة من نفس المذهب",
        variant: "destructive"
      });
      return;
    }

    const result = await supabaseDebateManager.joinDebate(
      debate.code,
      user.id,
      user.religion
    );

    if (result) {
      toast({
        title: "تم الانضمام للمناظرة",
        description: "جاري تحميل المناظرة..."
      });
      navigate(`/debate/${debate.code}`);
    } else {
      toast({
        title: "خطأ",
        description: "فشل الانضمام للمناظرة",
        variant: "destructive"
      });
      fetchDebates();
    }
  };

  const formatTime = (minutes: number) => {
    return `${minutes} دقيقة`;
  };

  const formatCreatedAt = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ar-SA', {
      timeZone: 'Asia/Riyadh',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const DebateCard = ({ debate, type }: { debate: Debate; type: 'public' | 'random' }) => {
    const isExpanded = expandedDebate === debate.id;
    
    return (
      <Card className="shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700 transform hover:scale-102 transition-all duration-300">
        <CardHeader 
          className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/30 dark:to-sky-900/30 border-b border-blue-200 dark:border-blue-700 cursor-pointer"
          onClick={() => setExpandedDebate(isExpanded ? null : debate.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-600 rounded-full flex items-center justify-center">
                {type === 'random' ? (
                  <Shuffle className="h-6 w-6 text-white" />
                ) : (
                  <Globe className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <CardTitle className="text-blue-700 dark:text-blue-300 text-outlined">
                  {type === 'random' ? 'مناظرة عشوائية' : 'مناظرة عامة'} - {debate.creator_religion}
                </CardTitle>
                <p className="text-sm text-blue-600 dark:text-blue-400 text-outlined">
                  الكود: {debate.code}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-reverse space-x-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  joinDebate(debate);
                }}
                disabled={user?.religion === debate.creator_religion}
                className="bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white px-6 py-2 text-outlined"
              >
                انضم
              </Button>
              
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-blue-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-blue-600" />
              )}
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="border-t border-blue-200 dark:border-blue-700 pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 text-outlined">
                  عدد الجولات
                </p>
                <p className="text-lg font-bold text-blue-800 dark:text-blue-200 text-outlined">
                  {debate.settings.roundCount}
                </p>
              </div>
              
              <div className="text-center p-3 bg-sky-50 dark:bg-sky-900/30 rounded-lg">
                <Clock className="h-6 w-6 text-sky-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-sky-700 dark:text-sky-300 text-outlined">
                  مدة الجولة
                </p>
                <p className="text-lg font-bold text-sky-800 dark:text-sky-200 text-outlined">
                  {formatTime(debate.settings.roundTime)}
                </p>
              </div>
              
              <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg">
                <Clock className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300 text-outlined">
                  وقت البداية
                </p>
                <p className="text-lg font-bold text-cyan-800 dark:text-cyan-200 text-outlined">
                  {formatTime(debate.settings.preparationTime)}
                </p>
              </div>
              
              <div className="text-center p-3 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
                <Clock className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-teal-700 dark:text-teal-300 text-outlined">
                  وقت النهاية
                </p>
                <p className="text-lg font-bold text-teal-800 dark:text-teal-200 text-outlined">
                  {formatTime(debate.settings.finalTime)}
                </p>
              </div>
            </div>

            {/* الميزات الإضافية */}
            <div className="flex flex-wrap gap-2 mb-4">
              {debate.settings.autoMic && (
                <div className="flex items-center bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                  <Mic className="h-4 w-4 text-green-600 ml-1" />
                  <span className="text-sm text-green-700 dark:text-green-300 text-outlined">ميكروفون تلقائي</span>
                </div>
              )}
              {debate.settings.cameraOptional && (
                <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  <Camera className="h-4 w-4 text-blue-600 ml-1" />
                  <span className="text-sm text-blue-700 dark:text-blue-300 text-outlined">كاميرا اختيارية</span>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-blue-600 dark:text-blue-400 text-outlined">
                تم الإنشاء: {formatCreatedAt(debate.created_at)}
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 dark:from-gray-900 dark:via-blue-900 dark:to-sky-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-blue-600 dark:text-blue-400 font-semibold text-outlined">جاري تحميل المناظرات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 dark:from-gray-900 dark:via-blue-900 dark:to-sky-900 relative overflow-hidden">
      {/* عناصر الخلفية الزخرفية */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-96 h-96 bg-blue-300 dark:bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-96 h-96 bg-sky-300 dark:bg-sky-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* الرأس */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-reverse space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-sky-800 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">🕌</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-200 flex items-center text-outlined">
                <Globe className="h-8 w-8 ml-3" />
                قائمة المناظرات
              </h1>
              <p className="text-blue-600 dark:text-blue-400 text-outlined">
                مرحباً {user?.username} - {user?.religion}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-reverse space-x-4">
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-outlined"
            >
              <Plus className="h-5 w-5 ml-2" />
              إنشاء مناظرة
            </Button>
            
            <Button
              onClick={() => navigate('/profile')}
              variant="outline"
              className="border-2 border-blue-300 dark:border-blue-600 text-outlined"
            >
              <User className="h-5 w-5 ml-2" />
              الملف الشخصي
            </Button>
            
            <Button
              onClick={() => setIsSettingsOpen(true)}
              variant="outline"
              className="border-2 border-blue-300 dark:border-blue-600 text-outlined"
            >
              <Settings className="h-5 w-5 ml-2" />
              الإعدادات
            </Button>
          </div>
        </div>

        {/* التبويبات */}
        <Tabs defaultValue="random" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <TabsTrigger value="random" className="text-outlined">
              <Shuffle className="h-5 w-5 ml-2" />
              المناظرات العشوائية
            </TabsTrigger>
            <TabsTrigger value="public" className="text-outlined">
              <Globe className="h-5 w-5 ml-2" />
              المناظرات العامة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="random" className="space-y-4">
            {randomDebates.length === 0 ? (
              <Card className="shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700">
                <CardContent className="text-center py-12">
                  <Shuffle className="h-16 w-16 text-blue-400 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2 text-outlined">
                    لا توجد مناظرات عشوائية متاحة حالياً
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 text-outlined">
                    كن أول من ينشئ مناظرة عشوائية جديدة
                  </p>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="mt-4 bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white text-outlined"
                  >
                    إنشاء مناظرة عشوائية
                  </Button>
                </CardContent>
              </Card>
            ) : (
              randomDebates.map((debate) => (
                <DebateCard key={debate.id} debate={debate} type="random" />
              ))
            )}
          </TabsContent>

          <TabsContent value="public" className="space-y-4">
            {publicDebates.length === 0 ? (
              <Card className="shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700">
                <CardContent className="text-center py-12">
                  <Globe className="h-16 w-16 text-blue-400 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2 text-outlined">
                    لا توجد مناظرات عامة متاحة حالياً
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 text-outlined">
                    المناظرات العامة ستظهر هنا عند نشرها
                  </p>
                </CardContent>
              </Card>
            ) : (
              publicDebates.map((debate) => (
                <DebateCard key={debate.id} debate={debate} type="public" />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default MainDebateList;