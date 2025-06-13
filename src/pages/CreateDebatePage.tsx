import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Settings, 
  Clock, 
  Users, 
  Mic, 
  Camera,
  Shuffle,
  Lock,
  Globe
} from 'lucide-react';
import { supabaseDebateManager } from '@/services/supabaseDebateManager';
import { useToast } from '@/hooks/use-toast';

const CreateDebatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // إعدادات المناظرة
  const [debateType, setDebateType] = useState<'private' | 'random'>('private');
  const [preparationTime, setPreparationTime] = useState(5);
  const [roundTime, setRoundTime] = useState(3);
  const [roundCount, setRoundCount] = useState(3);
  const [finalTime, setFinalTime] = useState(5);
  const [autoMic, setAutoMic] = useState(true);
  const [cameraOptional, setCameraOptional] = useState(true);

  useEffect(() => {
    checkAuth();
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

  const createDebate = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    const settings = {
      preparationTime,
      roundTime,
      roundCount,
      finalTime,
      autoMic,
      cameraOptional
    };

    try {
      let code: string | null = null;
      
      if (debateType === 'private') {
        code = await supabaseDebateManager.createPrivateDebate(
          user.id,
          user.religion,
          settings
        );
      } else {
        code = await supabaseDebateManager.createRandomDebate(
          user.id,
          user.religion,
          settings
        );
      }

      if (code) {
        toast({
          title: "تم إنشاء المناظرة بنجاح",
          description: `كود المناظرة: ${code}`,
          className: "bg-green-500 text-white border-green-600"
        });
        navigate(`/debate/${code}`);
      } else {
        toast({
          title: "خطأ",
          description: "فشل في إنشاء المناظرة، يرجى المحاولة مرة أخرى",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating debate:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء المناظرة",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

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
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="lg"
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 text-outlined"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-200 flex items-center text-outlined">
                <Settings className="h-8 w-8 ml-3" />
                إنشاء مناظرة جديدة
              </h1>
              <p className="text-blue-600 dark:text-blue-400 text-outlined">
                اختر نوع المناظرة وحدد الإعدادات
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-300 text-center text-2xl text-outlined">
                إعدادات المناظرة
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* نوع المناظرة */}
              <div className="space-y-4">
                <Label className="text-lg font-bold text-blue-700 dark:text-blue-300 text-outlined">
                  نوع المناظرة
                </Label>
                <RadioGroup 
                  value={debateType} 
                  onValueChange={(value: 'private' | 'random') => setDebateType(value)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-reverse space-x-3 p-4 border-2 border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                    <RadioGroupItem value="private" id="private" className="border-2 border-blue-500" />
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Lock className="h-5 w-5 text-blue-600" />
                      <Label htmlFor="private" className="text-blue-700 dark:text-blue-300 font-semibold cursor-pointer text-outlined">
                        مناظرة خاصة (بكود)
                      </Label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-reverse space-x-3 p-4 border-2 border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                    <RadioGroupItem value="random" id="random" className="border-2 border-blue-500" />
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Shuffle className="h-5 w-5 text-blue-600" />
                      <Label htmlFor="random" className="text-blue-700 dark:text-blue-300 font-semibold cursor-pointer text-outlined">
                        مناظرة عشوائية (عامة)
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* إعدادات الأوقات */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* وقت البداية */}
                <div className="space-y-3">
                  <Label className="text-blue-700 dark:text-blue-300 font-semibold flex items-center text-outlined">
                    <Clock className="h-4 w-4 ml-2" />
                    وقت البداية: {preparationTime} دقيقة
                  </Label>
                  <Slider
                    value={[preparationTime]}
                    onValueChange={(value) => setPreparationTime(value[0])}
                    max={60}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 text-outlined">
                    <span>1 دقيقة</span>
                    <span>60 دقيقة</span>
                  </div>
                </div>

                {/* مدة الجولة */}
                <div className="space-y-3">
                  <Label className="text-blue-700 dark:text-blue-300 font-semibold flex items-center text-outlined">
                    <Clock className="h-4 w-4 ml-2" />
                    مدة الجولة: {roundTime} دقيقة
                  </Label>
                  <Slider
                    value={[roundTime]}
                    onValueChange={(value) => setRoundTime(value[0])}
                    max={60}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 text-outlined">
                    <span>1 دقيقة</span>
                    <span>60 دقيقة</span>
                  </div>
                </div>

                {/* عدد الجولات */}
                <div className="space-y-3">
                  <Label className="text-blue-700 dark:text-blue-300 font-semibold flex items-center text-outlined">
                    <Users className="h-4 w-4 ml-2" />
                    عدد الجولات: {roundCount}
                  </Label>
                  <Slider
                    value={[roundCount]}
                    onValueChange={(value) => setRoundCount(value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 text-outlined">
                    <span>1 جولة</span>
                    <span>10 جولات</span>
                  </div>
                </div>

                {/* وقت النهاية */}
                <div className="space-y-3">
                  <Label className="text-blue-700 dark:text-blue-300 font-semibold flex items-center text-outlined">
                    <Clock className="h-4 w-4 ml-2" />
                    وقت النهاية: {finalTime} دقيقة
                  </Label>
                  <Slider
                    value={[finalTime]}
                    onValueChange={(value) => setFinalTime(value[0])}
                    max={60}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 text-outlined">
                    <span>1 دقيقة</span>
                    <span>60 دقيقة</span>
                  </div>
                </div>
              </div>

              {/* خيارات إضافية */}
              <div className="space-y-4">
                <Label className="text-lg font-bold text-blue-700 dark:text-blue-300 text-outlined">
                  خيارات إضافية
                </Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* الميكروفون التلقائي */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Mic className="h-5 w-5 text-blue-600" />
                      <Label htmlFor="auto-mic" className="text-blue-700 dark:text-blue-300 font-semibold text-outlined">
                        تحكم تلقائي بالميكروفون
                      </Label>
                    </div>
                    <Switch
                      id="auto-mic"
                      checked={autoMic}
                      onCheckedChange={setAutoMic}
                    />
                  </div>

                  {/* الكاميرا الاختيارية */}
                  <div className="flex items-center justify-between p-4 bg-sky-50 dark:bg-sky-900/30 rounded-lg">
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Camera className="h-5 w-5 text-sky-600" />
                      <Label htmlFor="camera-optional" className="text-sky-700 dark:text-sky-300 font-semibold text-outlined">
                        الكاميرا اختيارية
                      </Label>
                    </div>
                    <Switch
                      id="camera-optional"
                      checked={cameraOptional}
                      onCheckedChange={setCameraOptional}
                    />
                  </div>
                </div>
              </div>

              {/* ملخص الإعدادات */}
              <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/30 dark:to-sky-900/30 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-4 text-outlined">
                  ملخص إعدادات المناظرة
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-blue-600 dark:text-blue-400 text-outlined">وقت البداية</p>
                    <p className="font-bold text-blue-800 dark:text-blue-200 text-outlined">{preparationTime} دقيقة</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-600 dark:text-blue-400 text-outlined">مدة الجولة</p>
                    <p className="font-bold text-blue-800 dark:text-blue-200 text-outlined">{roundTime} دقيقة</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-600 dark:text-blue-400 text-outlined">عدد الجولات</p>
                    <p className="font-bold text-blue-800 dark:text-blue-200 text-outlined">{roundCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-600 dark:text-blue-400 text-outlined">وقت النهاية</p>
                    <p className="font-bold text-blue-800 dark:text-blue-200 text-outlined">{finalTime} دقيقة</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {autoMic && (
                    <div className="flex items-center bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                      <Mic className="h-4 w-4 text-green-600 ml-1" />
                      <span className="text-sm text-green-700 dark:text-green-300 text-outlined">ميكروفون تلقائي</span>
                    </div>
                  )}
                  {cameraOptional && (
                    <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                      <Camera className="h-4 w-4 text-blue-600 ml-1" />
                      <span className="text-sm text-blue-700 dark:text-blue-300 text-outlined">كاميرا اختيارية</span>
                    </div>
                  )}
                </div>
              </div>

              {/* زر الإنشاء */}
              <Button
                onClick={createDebate}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white font-bold py-4 text-lg transform hover:scale-105 transition-all duration-200 shadow-lg text-outlined"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                    جاري إنشاء المناظرة...
                  </>
                ) : (
                  <>
                    {debateType === 'private' ? (
                      <>
                        <Lock className="h-5 w-5 ml-2" />
                        إنشاء مناظرة خاصة
                      </>
                    ) : (
                      <>
                        <Shuffle className="h-5 w-5 ml-2" />
                        إنشاء مناظرة عشوائية
                      </>
                    )}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateDebatePage;