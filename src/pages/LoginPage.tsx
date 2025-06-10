
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
import PhoneVerification from '@/components/PhoneVerification';
import CountrySelector, { Country } from '@/components/CountrySelector';

const LoginPage = () => {
  // Login states
  const [loginMethod, setLoginMethod] = useState<'fake' | 'phone'>('fake');
  const [loginUsernameOrPhone, setLoginUsernameOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginCountry, setLoginCountry] = useState<Country | null>(null);
  
  // Register states
  const [registerMethod, setRegisterMethod] = useState<'fake' | 'phone'>('fake');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerFakeAccount, setRegisterFakeAccount] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [religion, setReligion] = useState<'سني' | 'شيعي'>('سني');
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const createFakeEmail = (account: string) => {
    return `${account.toLowerCase().replace(/\s+/g, '')}@fakeuser.local`;
  };

  const handleLoginWithFakeAccount = async () => {
    if (!loginUsernameOrPhone.trim() || !loginPassword.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const fakeEmail = createFakeEmail(loginUsernameOrPhone);
      const { error } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: loginPassword
      });

      if (error) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "اسم المستخدم أو كلمة المرور غير صحيحة",
          variant: "destructive"
        });
      } else {
        toast({
          title: "نجح تسجيل الدخول",
          description: "مرحباً بك في منصة المناظرات"
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "اسم المستخدم أو كلمة المرور غير صحيحة",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleLoginWithPhone = async () => {
    if (!loginCountry || !loginUsernameOrPhone.trim() || !loginPassword.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const fullPhoneNumber = `${loginCountry.dialCode}${loginUsernameOrPhone}`;
      const { error } = await supabase.auth.signInWithPassword({
        phone: fullPhoneNumber,
        password: loginPassword
      });

      if (error) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "رقم الهاتف أو كلمة المرور غير صحيحة",
          variant: "destructive"
        });
      } else {
        toast({
          title: "نجح تسجيل الدخول",
          description: "مرحباً بك في منصة المناظرات"
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "رقم الهاتف أو كلمة المرور غير صحيحة",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleRegisterWithFakeAccount = async () => {
    if (!registerUsername.trim() || !registerFakeAccount.trim() || !registerPassword.trim() || !confirmPassword.trim()) {
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
      const fakeEmail = createFakeEmail(registerFakeAccount);
      
      const { error } = await supabase.auth.signUp({
        email: fakeEmail,
        password: registerPassword,
        options: {
          data: {
            username: registerUsername.trim(),
            religion: religion,
            fake_account: registerFakeAccount.trim()
          },
          emailRedirectTo: undefined
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "خطأ في إنشاء الحساب",
            description: "هذا الحساب مسجل مسبقاً، يرجى اختيار حساب آخر",
            variant: "destructive"
          });
        } else {
          toast({
            title: "خطأ في إنشاء الحساب",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: "يمكنك الآن استخدام الحساب مباشرة"
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleLogin = () => {
    if (loginMethod === 'fake') {
      handleLoginWithFakeAccount();
    } else {
      handleLoginWithPhone();
    }
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
                <div className="space-y-3">
                  <Label className="text-blue-700 dark:text-blue-300 font-semibold">طريقة تسجيل الدخول</Label>
                  <RadioGroup 
                    value={loginMethod} 
                    onValueChange={(value: 'fake' | 'phone') => setLoginMethod(value)}
                    className="flex space-x-reverse space-x-6"
                  >
                    <div className="flex items-center space-x-reverse space-x-2">
                      <RadioGroupItem value="fake" id="login-fake" className="border-2 border-blue-400" />
                      <Label htmlFor="login-fake" className="text-blue-700 dark:text-blue-300 font-semibold">حساب وهمي</Label>
                    </div>
                    <div className="flex items-center space-x-reverse space-x-2">
                      <RadioGroupItem value="phone" id="login-phone" className="border-2 border-blue-400" />
                      <Label htmlFor="login-phone" className="text-blue-700 dark:text-blue-300 font-semibold">رقم الهاتف</Label>
                    </div>
                  </RadioGroup>
                </div>

                {loginMethod === 'phone' && (
                  <div className="space-y-2">
                    <Label className="text-blue-700 dark:text-blue-300 font-semibold">البلد</Label>
                    <CountrySelector
                      selectedCountry={loginCountry}
                      onCountryChange={setLoginCountry}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-username-or-phone" className="text-blue-700 dark:text-blue-300 font-semibold">
                    {loginMethod === 'fake' ? 'اسم المستخدم الوهمي' : 'رقم الهاتف'}
                  </Label>
                  {loginMethod === 'phone' ? (
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 border-2 border-blue-300 rounded-md min-w-[80px] justify-center">
                        <span className="text-sm font-medium">
                          {loginCountry?.dialCode || '+xxx'}
                        </span>
                      </div>
                      <Input
                        id="login-username-or-phone"
                        type="tel"
                        placeholder="أدخل رقم الهاتف"
                        value={loginUsernameOrPhone}
                        onChange={(e) => setLoginUsernameOrPhone(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 border-2 border-blue-300 focus:border-blue-500 dark:border-blue-600"
                      />
                    </div>
                  ) : (
                    <Input
                      id="login-username-or-phone"
                      type="text"
                      placeholder="أدخل اسم المستخدم الوهمي"
                      value={loginUsernameOrPhone}
                      onChange={(e) => setLoginUsernameOrPhone(e.target.value)}
                      className="border-2 border-blue-300 focus:border-blue-500 dark:border-blue-600"
                    />
                  )}
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
                <div className="space-y-3">
                  <Label className="text-blue-700 dark:text-blue-300 font-semibold">طريقة إنشاء الحساب</Label>
                  <RadioGroup 
                    value={registerMethod} 
                    onValueChange={(value: 'fake' | 'phone') => setRegisterMethod(value)}
                    className="flex space-x-reverse space-x-6"
                  >
                    <div className="flex items-center space-x-reverse space-x-2">
                      <RadioGroupItem value="fake" id="register-fake" className="border-2 border-blue-400" />
                      <Label htmlFor="register-fake" className="text-blue-700 dark:text-blue-300 font-semibold">حساب وهمي</Label>
                    </div>
                    <div className="flex items-center space-x-reverse space-x-2">
                      <RadioGroupItem value="phone" id="register-phone" className="border-2 border-blue-400" />
                      <Label htmlFor="register-phone" className="text-blue-700 dark:text-blue-300 font-semibold">رقم الهاتف</Label>
                    </div>
                  </RadioGroup>
                </div>

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

                {registerMethod === 'fake' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="register-fake-account" className="text-blue-700 dark:text-blue-300 font-semibold">حساب جديد (وهمي)</Label>
                      <Input
                        id="register-fake-account"
                        type="text"
                        placeholder="اختر اسم حساب وهمي (مثل: محمد123، أحمد_المناظر)"
                        value={registerFakeAccount}
                        onChange={(e) => setRegisterFakeAccount(e.target.value)}
                        className="border-2 border-blue-300 focus:border-blue-500 dark:border-blue-600"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        هذا حساب وهمي لا يحتاج إلى بريد إلكتروني حقيقي
                      </p>
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
                        onKeyPress={(e) => e.key === 'Enter' && handleRegisterWithFakeAccount()}
                        className="border-2 border-blue-300 focus:border-blue-500 dark:border-blue-600"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleRegisterWithFakeAccount} 
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold py-3 transform hover:scale-105 transition-all duration-200 shadow-lg"
                      disabled={isLoading}
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
                    </Button>
                  </>
                ) : (
                  <PhoneVerification
                    onSuccess={() => navigate('/dashboard')}
                    religion={religion}
                    username={registerUsername}
                  />
                )}
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
