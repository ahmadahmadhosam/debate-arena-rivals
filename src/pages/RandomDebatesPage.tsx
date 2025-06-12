import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ChevronDown, ChevronUp, Clock, Users, Shuffle, Camera, Mic } from 'lucide-react';
import { supabaseDebateManager, Debate } from '@/services/supabaseDebateManager';
import { useToast } from '@/hooks/use-toast';

const RandomDebatesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [debates, setDebates] = useState<Debate[]>([]);
  const [expandedDebate, setExpandedDebate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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
      const randomDebates = await supabaseDebateManager.getRandomDebates();
      setDebates(randomDebates);
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
      fetchDebates(); // تحديث القائمة
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400 font-semibold text-outlined">جاري تحميل المناظرات العشوائية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-orange-900 dark:to-red-900 relative overflow-hidden">
      {/* عناصر الخلفية الزخرفية */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-96 h-96 bg-orange-300 dark:bg-orange-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-96 h-96 bg-red-300 dark:bg-red-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* الرأس */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-reverse space-x-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="lg"
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-orange-300 dark:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900 text-outlined"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-orange-800 dark:text-orange-200 flex items-center text-outlined">
                <Shuffle className="h-8 w-8 ml-3" />
                المناظرات العشوائية
              </h1>
              <p className="text-orange-600 dark:text-orange-400 text-outlined">
                انضم إلى مناظرة عشوائية مع منافس مختلف المذهب
              </p>
            </div>
          </div>
        </div>

        {/* قائمة المناظرات */}
        <div className="space-y-4">
          {debates.length === 0 ? (
            <Card className="shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-orange-200 dark:border-orange-700">
              <CardContent className="text-center py-12">
                <Shuffle className="h-16 w-16 text-orange-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-orange-700 dark:text-orange-300 mb-2 text-outlined">
                  لا توجد مناظرات عشوائية متاحة حالياً
                </h3>
                <p className="text-orange-600 dark:text-orange-400 text-outlined">
                  كن أول من ينشئ مناظرة عشوائية جديدة
                </p>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="mt-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-outlined"
                >
                  إنشاء مناظرة عشوائية
                </Button>
              </CardContent>
            </Card>
          ) : (
            debates.map((debate) => (
              <Card
                key={debate.id}
                className="shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-orange-200 dark:border-orange-700 transform hover:scale-102 transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-reverse space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                        <Shuffle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-orange-700 dark:text-orange-300 text-outlined">
                          مناظرة عشوائية - {debate.creator_religion}
                        </CardTitle>
                        <p className="text-sm text-orange-600 dark:text-orange-400 text-outlined">
                          الكود: {debate.code}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Button
                        onClick={() => joinDebate(debate)}
                        disabled={user?.religion === debate.creator_religion}
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-2 text-outlined"
                      >
                        انضم
                      </Button>
                      
                      <Button
                        onClick={() => setExpandedDebate(expandedDebate === debate.id ? null : debate.id)}
                        variant="outline"
                        size="sm"
                        className="border-2 border-orange-300 dark:border-orange-600 text-outlined"
                      >
                        {expandedDebate === debate.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedDebate === debate.id && (
                  <CardContent className="border-t border-orange-200 dark:border-orange-700 pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                        <Users className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 text-outlined">
                          عدد الجولات
                        </p>
                        <p className="text-lg font-bold text-orange-800 dark:text-orange-200 text-outlined">
                          {debate.settings.roundCount}
                        </p>
                      </div>
                      
                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                        <Clock className="h-6 w-6 text-red-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300 text-outlined">
                          مدة الجولة
                        </p>
                        <p className="text-lg font-bold text-red-800 dark:text-red-200 text-outlined">
                          {formatTime(debate.settings.roundTime)}
                        </p>
                      </div>
                      
                      <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/30 rounded-lg">
                        <Clock className="h-6 w-6 text-pink-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-pink-700 dark:text-pink-300 text-outlined">
                          وقت التحضير
                        </p>
                        <p className="text-lg font-bold text-pink-800 dark:text-pink-200 text-outlined">
                          {formatTime(debate.settings.preparationTime)}
                        </p>
                      </div>
                      
                      <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                        <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 text-outlined">
                          وقت الختام
                        </p>
                        <p className="text-lg font-bold text-yellow-800 dark:text-yellow-200 text-outlined">
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
                      <p className="text-sm text-orange-600 dark:text-orange-400 text-outlined">
                        تم الإنشاء: {formatCreatedAt(debate.created_at)}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RandomDebatesPage;