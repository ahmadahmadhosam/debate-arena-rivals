
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ChevronDown, ChevronUp, Clock, Users, Shuffle } from 'lucide-react';
import { supabaseDebateManager, Debate } from '@/services/supabaseDebateManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const RandomDebatesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [debates, setDebates] = useState<Debate[]>([]);
  const [expandedDebate, setExpandedDebate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchDebates();
    
    // Refresh debates every 5 seconds
    const interval = setInterval(fetchDebates, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/');
      return;
    }
    
    setUser(session.user);
    await fetchUserProfile(session.user.id);
  };

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
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
    if (!user || !profile) return;

    if (debate.creator_religion === profile.religion) {
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
      profile.religion
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
      fetchDebates(); // Refresh the list
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
          <p className="text-orange-600 dark:text-orange-400 font-semibold">جاري تحميل المناظرات العشوائية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-orange-900 dark:to-red-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-96 h-96 bg-orange-300 dark:bg-orange-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-96 h-96 bg-red-300 dark:bg-red-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-reverse space-x-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="lg"
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-orange-300 dark:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-orange-800 dark:text-orange-200 flex items-center" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                <Shuffle className="h-8 w-8 ml-3" />
                المناظرات العشوائية
              </h1>
              <p className="text-orange-600 dark:text-orange-400" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                انضم إلى مناظرة عشوائية مع منافس مختلف المذهب
              </p>
            </div>
          </div>
        </div>

        {/* Debates List */}
        <div className="space-y-4">
          {debates.length === 0 ? (
            <Card className="shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-orange-200 dark:border-orange-700">
              <CardContent className="text-center py-12">
                <Shuffle className="h-16 w-16 text-orange-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-orange-700 dark:text-orange-300 mb-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                  لا توجد مناظرات عشوائية متاحة حالياً
                </h3>
                <p className="text-orange-600 dark:text-orange-400" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                  كن أول من ينشئ مناظرة عشوائية جديدة
                </p>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="mt-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
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
                        <CardTitle className="text-orange-700 dark:text-orange-300" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                          مناظرة عشوائية - {debate.creator_religion}
                        </CardTitle>
                        <p className="text-sm text-orange-600 dark:text-orange-400" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                          الكود: {debate.code}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Button
                        onClick={() => joinDebate(debate)}
                        disabled={profile?.religion === debate.creator_religion}
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-2"
                      >
                        انضم
                      </Button>
                      
                      <Button
                        onClick={() => setExpandedDebate(expandedDebate === debate.id ? null : debate.id)}
                        variant="outline"
                        size="sm"
                        className="border-2 border-orange-300 dark:border-orange-600"
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                        <Users className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-orange-700 dark:text-orange-300" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                          عدد الجولات
                        </p>
                        <p className="text-lg font-bold text-orange-800 dark:text-orange-200" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                          {debate.settings.roundCount}
                        </p>
                      </div>
                      
                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                        <Clock className="h-6 w-6 text-red-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                          مدة الجولة
                        </p>
                        <p className="text-lg font-bold text-red-800 dark:text-red-200" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                          {formatTime(debate.settings.roundTime)}
                        </p>
                      </div>
                      
                      <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/30 rounded-lg">
                        <Clock className="h-6 w-6 text-pink-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-pink-700 dark:text-pink-300" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                          وقت التحضير
                        </p>
                        <p className="text-lg font-bold text-pink-800 dark:text-pink-200" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                          {formatTime(debate.settings.preparationTime)}
                        </p>
                      </div>
                      
                      <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                        <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                          وقت الختام
                        </p>
                        <p className="text-lg font-bold text-yellow-800 dark:text-yellow-200" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                          {formatTime(debate.settings.finalTime)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <p className="text-sm text-orange-600 dark:text-orange-400" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
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
