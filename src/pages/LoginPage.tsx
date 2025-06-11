
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [religion, setReligion] = useState<'سني' | 'شيعي'>('سني');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const appUser = localStorage.getItem('app_user');
    if (appUser) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleEnterApp = async () => {
    if (!username.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المستخدم",
        variant: "destructive"
      });
      return;
    }

    if (username.trim().length < 3) {
      toast({
        title: "خطأ",
        description: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('محاولة التحقق من اسم المستخدم:', username);
      
      // Check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('app_users')
        .select('username')
        .eq('username', username.trim())
        .maybeSingle();

      if (checkError) {
        console.error('خطأ في التحقق من اسم المستخدم:', checkError);
        toast({
          title: "خطأ",
          description: "حدث خطأ في النظام، يرجى المحاولة مرة أخرى",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (existingUser) {
        toast({
          title: "خطأ",
          description: "اسم المستخدم موجود مسبقاً، يرجى اختيار اسم آخر",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Create new user entry
      const { data: newUser, error: insertError } = await supabase
        .from('app_users')
        .insert([
          {
            username: username.trim(),
            password_hash: '', // Empty since we don't use passwords
            religion: religion
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('خطأ في إنشاء المستخدم:', insertError);
        toast({
          title: "خطأ",
          description: "حدث خطأ في إنشاء المستخدم، يرجى المحاولة مرة أخرى",
          variant: "destructive"
        });
      } else {
        console.log('تم إنشاء المستخدم بنجاح:', newUser);
        
        // Store user data in localStorage
        localStorage.setItem('app_user', JSON.stringify({
          id: newUser.id,
          username: newUser.username,
          religion: newUser.religion
        }));
        
        toast({
          title: "مرحباً بك",
          description: `أهلاً ${newUser.username} في منصة المناظرات`,
          className: "bg-sky-500 text-white border-sky-600"
        });
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('خطأ غير متوقع:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform border border-white border-opacity-30">
            <span className="text-white font-bold text-3xl">🕌</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            منصة المناظرات الإسلامية
          </h1>
          <p className="text-white text-opacity-90 drop-shadow-md">
            منصة للحوار البناء بين المذاهب الإسلامية
          </p>
        </div>

        <Card className="shadow-2xl backdrop-blur-sm bg-white bg-opacity-10 border border-white border-opacity-30 transform hover:scale-102 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-center text-white text-2xl drop-shadow-md">
              ادخل إلى المنصة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white font-semibold drop-shadow-sm">اسم المستخدم</Label>
              <Input
                id="username"
                type="text"
                placeholder="اختر اسم المستخدم الخاص بك"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-40 text-white placeholder:text-white placeholder:text-opacity-70 focus:border-white focus:border-opacity-60"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-white font-semibold drop-shadow-sm">المذهب</Label>
              <RadioGroup 
                value={religion} 
                onValueChange={(value: 'سني' | 'شيعي') => setReligion(value)}
                className="flex space-x-reverse space-x-6"
                disabled={isLoading}
              >
                <div className="flex items-center space-x-reverse space-x-2">
                  <RadioGroupItem value="سني" id="sunni" className="border-2 border-white text-white" />
                  <Label htmlFor="sunni" className="text-white font-semibold drop-shadow-sm">سني</Label>
                </div>
                <div className="flex items-center space-x-reverse space-x-2">
                  <RadioGroupItem value="شيعي" id="shia" className="border-2 border-white text-white" />
                  <Label htmlFor="shia" className="text-white font-semibold drop-shadow-sm">شيعي</Label>
                </div>
              </RadioGroup>
            </div>
                
            <Button 
              onClick={handleEnterApp} 
              className="w-full bg-white bg-opacity-20 backdrop-blur-sm hover:bg-white hover:bg-opacity-30 text-white font-bold py-3 transform hover:scale-105 transition-all duration-200 shadow-lg border border-white border-opacity-30"
              disabled={isLoading}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleEnterApp()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الدخول...
                </>
              ) : (
                'دخول المنصة'
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-white text-opacity-90">
          <p className="drop-shadow-md">منصة آمنة للحوار الهادف والمثمر</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
