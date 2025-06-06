
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Religion = 'سني' | 'شيعي';
type AuthMode = 'signin' | 'signup';

const LoginPage = () => {
  const [selectedReligion, setSelectedReligion] = useState<Religion | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleAuth = () => {
    if (!selectedReligion || !username || !password) {
      alert('يرجى ملء جميع الحقول واختيار المذهب');
      return;
    }

    if (authMode === 'signup' && password !== confirmPassword) {
      alert('كلمات المرور غير متطابقة');
      return;
    }

    // حفظ بيانات المستخدم محلياً (يجب استبدالها بنظام مصادقة حقيقي)
    localStorage.setItem('user', JSON.stringify({
      username,
      religion: selectedReligion,
      isAuthenticated: true
    }));

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-islamic-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="islamic-card shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-islamic-gold-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🕌</span>
            </div>
            <CardTitle className="text-2xl font-bold text-islamic-gold-800 dark:text-islamic-gold-200">
              أرينا المناظرة
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              منصة المناظرات الإسلامية
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* اختيار المذهب */}
            <div className="space-y-3">
              <label className="text-sm font-medium">اختر المذهب:</label>
              <div className="grid grid-cols-2 gap-3">
                {(['سني', 'شيعي'] as Religion[]).map((religion) => (
                  <Button
                    key={religion}
                    variant={selectedReligion === religion ? "default" : "outline"}
                    onClick={() => setSelectedReligion(religion)}
                    className={`h-12 ${
                      selectedReligion === religion 
                        ? 'bg-islamic-gold-500 hover:bg-islamic-gold-600 text-white' 
                        : 'border-islamic-gold-300 hover:bg-islamic-gold-50'
                    }`}
                  >
                    {religion}
                  </Button>
                ))}
              </div>
            </div>

            {/* أزرار تبديل نوع التسجيل */}
            <div className="flex rounded-lg bg-muted p-1">
              <Button
                variant={authMode === 'signin' ? 'default' : 'ghost'}
                onClick={() => setAuthMode('signin')}
                className="flex-1 h-8"
              >
                تسجيل دخول
              </Button>
              <Button
                variant={authMode === 'signup' ? 'default' : 'ghost'}
                onClick={() => setAuthMode('signup')}
                className="flex-1 h-8"
              >
                إنشاء حساب
              </Button>
            </div>

            {/* حقول النموذج */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">اسم المستخدم:</label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">كلمة المرور:</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="mt-1"
                />
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="text-sm font-medium">تأكيد كلمة المرور:</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور"
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            {/* زر الدخول */}
            <Button
              onClick={handleAuth}
              className="w-full islamic-button h-12 text-lg"
              disabled={!selectedReligion || !username || !password}
            >
              {authMode === 'signin' ? 'دخول' : 'إنشاء حساب'}
            </Button>

            {/* معلومات إضافية */}
            {selectedReligion && (
              <div className="text-center">
                <Badge variant="secondary" className="bg-islamic-gold-100 text-islamic-gold-800">
                  مذهب: {selectedReligion}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-white text-sm">
          <p>منصة للحوار الحضاري والمناظرة الإسلامية</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
