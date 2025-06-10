import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  // Login states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register states
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const handleLogin = async () => {
    if (!loginUsername.trim() || !loginPassword.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('محاولة تسجيل الدخول باسم المستخدم:', loginUsername);
      
      const { data, error } = await supabase.rpc('verify_password', {
        p_username: loginUsername.trim(),
        p_password: loginPassword
      });

      if (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        toast({
          title: "خطأ في تسجيل الدخول",
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
        const userData = data[0];
        console.log('نجح تسجيل الدخول:', userData);
        
        // Store user data in localStorage
        localStorage.setItem('app_user', JSON.stringify({
          id: userData.user_id,
          username: userData.user_username,
          religion: userData.user_religion
        }));
        
        toast({
          title: "نجح تسجيل الدخول",
          description: `مرحباً ${userData.user_username}`
        });
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('خطأ غير متوقع:', error);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleRegister = async () => {
    if (!registerUsername.trim() || !registerPassword.trim() || !confirmPassword.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive"
      });
      return;
    }

    if (registerPassword !== confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور غير متطابقة",
        variant: "destructive"
      });
      return;
    }

    if (registerPassword.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('محاولة إنشاء حساب جديد:', registerUsername);
      
      const { data, error } = await supabase.rpc('create_app_user', {
        p_username: registerUsername.trim(),
        p_password: registerPassword,
        p_religion: religion
      });

      if (error) {
        console.error('خطأ في إنشاء الحساب:', error);
        toast({
          title: "خطأ في إنشاء الحساب",
          description: "حدث خطأ في النظام، يرجى المحاولة مرة أخرى",
          variant: "destructive"
        });
      } else if (data && data.length > 0) {
        const result = data[0];
        if (result.success) {
          console.log('تم إنشاء الحساب بنجاح:', result.user_id);
          
          // Store user data in localStorage for automatic login
          localStorage.setItem('app_user', JSON.stringify({
            id: result.user_id,
            username: registerUsername.trim(),
            religion: religion
          }));
          
          toast({
            title: "تم إنشاء الحساب بنجاح",
            description: `مرحباً ${registerUsername.trim()}، تم تسجيل الدخول تلقائياً`
          });
          
          // Navigate to dashboard automatically
          navigate('/dashboard');
        } else {
          toast({
            title: "خطأ في إنشاء الحساب",
            description: result.error_message || "حدث خطأ غير معروف",
            variant: "destructive"
          });
        }
      }
    } catch (error: any) {
      console.error('خطأ غير متوقع في إنشاء الحساب:', error);
      toast({
        title: "خطأ في إنشاء الحساب",
        description: "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fadeIn">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
            <span className="text-white font-bold text-3xl">🕌</span>
          </div>
          <h1 className="text-4xl font-bold text-blue-800 dark:text-blue-200 mb-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
            منصة المناظرات الإسلامية
          </h1>
          <p className="text-gray-600 dark:text-gray-300" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
            منصة للحوار البناء بين المذاهب الإسلامية
          </p>
        </div>

        <Card className="shadow-2xl backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-2 border-blue-200 dark:border-blue-700 transform hover:scale-102 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-center text-blue-600 dark:text-blue-400 text-2xl" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              مرحباً بك
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-blue-100 dark:bg-blue-900">
                <TabsTrigger value="login" className="text-blue-700 dark:text-blue-300 font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="register" className="text-blue-700 dark:text-blue-300 font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>إنشاء حساب</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="login-username" className="text-blue-700 dark:text-blue-300 font-semibold">اسم المستخدم</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="أدخل اسم المستخدم"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="border-2 border-blue-300 focus:border-blue-500 dark:border-blue-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-blue-700 dark:text-blue-300 font-semibold">كلمة المرور</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="أدخل كلمة المرور"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="border-2 border-blue-300 focus:border-blue-500 dark:border-blue-600"
                  />
                </div>

                <Button 
                  onClick={handleLogin} 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  disabled={isLoading}
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                </Button>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="register-username" className="text-blue-700 dark:text-blue-300 font-semibold">اسم المستخدم</Label>
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="اختر اسم المستخدم"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    className="border-2 border-blue-300 focus:border-blue-500 dark:border-blue-600"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-blue-700 dark:text-blue-300 font-semibold">المذهب</Label>
                  <RadioGroup 
                    value={religion} 
                    onValueChange={(value: 'سني' | 'شيعي') => setReligion(value)}
                    className="flex space-x-reverse space-x-6"
                  >
                    <div className="flex items-center space-x-reverse space-x-2">
                      <RadioGroupItem value="سني" id="sunni" className="border-2 border-blue-400" />
                      <Label htmlFor="sunni" className="text-blue-700 dark:text-blue-300 font-semibold">سني</Label>
                    </div>
                    <div className="flex items-center space-x-reverse space-x-2">
                      <RadioGroupItem value="شيعي" id="shia" className="border-2 border-blue-400" />
                      <Label htmlFor="shia" className="text-blue-700 dark:text-blue-300 font-semibold">شيعي</Label>
                    </div>
                  </RadioGroup>
                </div>
                    
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-blue-700 dark:text-blue-300 font-semibold">كلمة المرور</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="أدخل كلمة المرور"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="border-2 border-blue-300 focus:border-blue-500 dark:border-blue-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-blue-700 dark:text-blue-300 font-semibold">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="أعد إدخال كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                    className="border-2 border-blue-300 focus:border-blue-500 dark:border-blue-600"
                  />
                </div>
                
                <Button 
                  onClick={handleRegister} 
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold py-3 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  disabled={isLoading}
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-gray-600 dark:text-gray-300">
          <p style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>منصة آمنة للحوار الهادف والمثمر</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
