
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Settings, Users, MessageCircle, UserCheck, Gamepad2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseDebateManager } from '@/services/supabaseDebateManager';
import { useToast } from '@/hooks/use-toast';
import SettingsModal from '@/components/SettingsModal';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Settings for debates
  const [preparationTime, setPreparationTime] = useState(5);
  const [roundTime, setRoundTime] = useState(3);
  const [roundCount, setRoundCount] = useState(3);
  const [finalTime, setFinalTime] = useState(5);
  const [autoMic, setAutoMic] = useState(true);
  
  // Join debate
  const [joinCode, setJoinCode] = useState('');
  
  // Settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/');
      } else {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/');
      return;
    }
    
    setUser(session.user);
    await fetchUserProfile(session.user.id);
    setIsLoading(false);
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

  const createPrivateDebate = async () => {
    if (!user || !profile) return;
    
    const settings = {
      preparationTime,
      roundTime,
      roundCount,
      finalTime,
      autoMic
    };

    const code = await supabaseDebateManager.createPrivateDebate(
      user.id,
      profile.religion,
      settings
    );

    if (code) {
      toast({
        title: "تم إنشاء المناظرة",
        description: `كود المناظرة: ${code}`
      });
      navigate(`/debate/${code}`);
    } else {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء المناظرة",
        variant: "destructive"
      });
    }
  };

  const createRandomDebate = async () => {
    if (!user || !profile) return;
    
    const settings = {
      preparationTime,
      roundTime,
      roundCount,
      finalTime,
      autoMic,
      isRandom: true
    };

    const code = await supabaseDebateManager.createRandomDebate(
      user.id,
      profile.religion,
      settings
    );

    if (code) {
      toast({
        title: "تم إنشاء المناظرة العشوائية",
        description: "في انتظار منافس..."
      });
      navigate(`/debate/${code}`);
    } else {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء المناظرة العشوائية",
        variant: "destructive"
      });
    }
  };

  const joinDebate = async () => {
    if (!joinCode.trim() || !user || !profile) {
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
      profile.religion
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-blue-600 dark:text-blue-400 font-semibold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-96 h-96 bg-blue-300 dark:bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-96 h-96 bg-purple-300 dark:bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-300 dark:bg-indigo-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-reverse space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">🕌</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-200" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                أهلاً {profile?.username || 'بك'}
              </h1>
              <p className="text-blue-600 dark:text-blue-400" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                المذهب: {profile?.religion}
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => setIsSettingsOpen(true)}
            variant="outline"
            size="lg"
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 transform hover:scale-105 transition-all duration-200"
          >
            <Settings className="h-5 w-5 ml-2" />
            <span style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>الإعدادات</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700">
              <CardHeader>
                <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                  <Gamepad2 className="h-6 w-6 ml-3" />
                  إجراءات سريعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                  <Button
                    onClick={() => navigate('/random-debates')}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    <Users className="h-5 w-5 ml-2" />
                    المناظرات العشوائية
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={createRandomDebate}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-3 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    إنشاء عشوائية
                  </Button>
                  
                  <Button
                    onClick={createPrivateDebate}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    إنشاء خاصة
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Join Debate */}
            <Card className="shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700">
              <CardHeader>
                <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                  <UserCheck className="h-6 w-6 ml-3" />
                  الانضمام لمناظرة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="join-code" className="text-blue-700 dark:text-blue-300 font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                    كود المناظرة
                  </Label>
                  <Input
                    id="join-code"
                    placeholder="أدخل كود المناظرة"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="border-2 border-blue-300 focus:border-blue-500 dark:border-blue-600 text-center font-mono text-lg"
                    onKeyPress={(e) => e.key === 'Enter' && joinDebate()}
                  />
                </div>
                <Button
                  onClick={joinDebate}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold py-3 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                >
                  <MessageCircle className="h-5 w-5 ml-2" />
                  انضم للمناظرة
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Settings Panel */}
          <Card className="shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-300" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                إعدادات المناظرة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preparation Time */}
              <div className="space-y-3">
                <Label className="text-blue-700 dark:text-blue-300 font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                  وقت التحضير: {preparationTime} دقائق
                </Label>
                <Slider
                  value={[preparationTime]}
                  onValueChange={(value) => setPreparationTime(value[0])}
                  max={15}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Round Time */}
              <div className="space-y-3">
                <Label className="text-blue-700 dark:text-blue-300 font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                  مدة الجولة: {roundTime} دقائق
                </Label>
                <Slider
                  value={[roundTime]}
                  onValueChange={(value) => setRoundTime(value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Round Count */}
              <div className="space-y-3">
                <Label className="text-blue-700 dark:text-blue-300 font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                  عدد الجولات: {roundCount}
                </Label>
                <Slider
                  value={[roundCount]}
                  onValueChange={(value) => setRoundCount(value[0])}
                  max={7}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Final Time */}
              <div className="space-y-3">
                <Label className="text-blue-700 dark:text-blue-300 font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                  وقت الختام: {finalTime} دقائق
                </Label>
                <Slider
                  value={[finalTime]}
                  onValueChange={(value) => setFinalTime(value[0])}
                  max={15}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Auto Mic */}
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-mic" className="text-blue-700 dark:text-blue-300 font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                  تحكم تلقائي بالميكروفون
                </Label>
                <Switch
                  id="auto-mic"
                  checked={autoMic}
                  onCheckedChange={setAutoMic}
                />
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
