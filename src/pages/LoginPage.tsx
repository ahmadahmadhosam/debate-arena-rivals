import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, LogIn } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [religion, setReligion] = useState<'سني' | 'شيعي'>('سني');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const appUser = localStorage.getItem('app_user');
    if (appUser) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المستخدم وكلمة المرور",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('محاولة تسجيل الدخول:', username);
      
      const { data, error } = await supabase.rpc('verify_password', {
        p_username: username.trim(),
        p_password: password
      });

      if (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        toast({
          title: "خطأ",
          description: "حدث خطأ في النظام، يرجى المحاولة مرة أخرى",
          variant: "destructive"
        });
      } else if (!data || data.length === 0) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "اسم المستخدم أو كلمة المرور غير صحيحة",
          variant: "destructive"
        });
      } else {
        const user = data[0];
        console.log('تم تسجيل الدخول بنجاح:', user);
        
        // Store user data in localStorage
        localStorage.setItem('app_user', JSON.stringify({
          id: user.user_id,
          username: user.user_username,
          religion: user.user_religion
        }));
        
        toast({
          title: "مرحباً بك",
          description: `أهلاً ${user.user_username} في منصة المناظرات`,
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

  const handleSignUp = async () => {
    if (!username.trim() || !password.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المستخدم وكلمة المرور",
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

    if (password.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('محاولة إنشاء حساب جديد:', username);
      
      const { data, error } = await supabase.rpc('create_app_user', {
        p_username: username.trim(),
        p_password: password,
        p_religion: religion
      });

      if (error) {
        console.error('خطأ في إنشاء الحساب:', error);
        toast({
          title: "خطأ",
          description: "حدث خطأ في إنشاء الحساب، يرجى المحاولة مرة أخرى",
          variant: "destructive"
        });
      } else if (data && data.length > 0) {
        const result = data[0];
        if (result.success) {
          console.log('تم إنشاء الحساب بنجاح:', result);
          
          // Store user data in localStorage
          localStorage.setItem('app_user', JSON.stringify({
            id: result.user_id,
            username: username.trim(),
            religion: religion
          }));
          
          toast({
            title: "تم إنشاء الحساب بنجاح",
            description: `مرحباً ${username.trim()} في منصة المناظرات`,
            className: "bg-sky-500 text-white border-sky-600"
          });
          
          navigate('/dashboard');
        } else {
          toast({
            title: "خطأ",
            description: result.error_message || "فشل في إنشاء الحساب",
            variant: "destructive"
          });
        }
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

  const handleSubmit = () => {
    if (isSignUp) {
      handleSignUp();
    } else {
      handleLogin();
    }
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
            <CardTitle className="text-center text-white text-2xl drop-shadow-md flex items-center justify-center">
              {isSignUp ? (
                <>
                  <UserPlus className="h-6 w-6 ml-2" />
                  إنشاء حساب جديد
                </>
              ) : (
                <>
                  <LogIn className="h-6 w-6 ml-2" />
                  تسجيل الدخول
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white font-semibold drop-shadow-sm">
                اسم المستخدم
              </Label>
              <Input
                id="username"
                type="text"
                placeholder={isSignUp ? "اختر اسم المستخدم الخاص بك" : "أدخل اسم المستخدم"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-40 text-white placeholder:text-white placeholder:text-opacity-70 focus:border-white focus:border-opacity-60"
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSubmit()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-semibold drop-shadow-sm">
                كلمة المرور
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={isSignUp ? "اختر كلمة مرور قوية (6 أحرف على الأقل)" : "أدخل كلمة المرور"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-40 text-white placeholder:text-white placeholder:text-opacity-70 focus:border-white focus:border-opacity-60"
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSubmit()}
              />
            </div>

            {isSignUp && (
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
            )}
                
            <Button 
              onClick={handleSubmit} 
              className="w-full bg-white bg-opacity-20 backdrop-blur-sm hover:bg-white hover:bg-opacity-30 text-white font-bold py-3 transform hover:scale-105 transition-all duration-200 shadow-lg border border-white border-opacity-30"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? 'جاري إنشاء الحساب...' : 'جاري تسجيل الدخول...'}
                </>
              ) : (
                isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'
              )}
            </Button>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-white hover:bg-white hover:bg-opacity-10 text-sm"
                disabled={isLoading}
              >
                {isSignUp ? 'لديك حساب؟ سجل الدخول' : 'ليس لديك حساب؟ أنشئ حساباً جديداً'}
              </Button>
            </div>
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