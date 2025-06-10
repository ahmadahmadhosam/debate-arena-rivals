
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import CountrySelector, { Country } from './CountrySelector';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PhoneVerificationProps {
  onSuccess: () => void;
  religion: 'سني' | 'شيعي';
  username: string;
}

const PhoneVerification = ({ onSuccess, religion, username }: PhoneVerificationProps) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendCode = async () => {
    if (!selectedCountry || !phoneNumber.trim() || !password.trim() || !confirmPassword.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور غير متطابقة",
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
      const fullPhoneNumber = `${selectedCountry.dialCode}${phoneNumber}`;
      console.log('محاولة إنشاء حساب بالرقم:', fullPhoneNumber);
      
      const { data, error } = await supabase.auth.signUp({
        phone: fullPhoneNumber,
        password: password,
        options: {
          data: {
            username: username,
            religion: religion
          }
        }
      });

      if (error) {
        console.error('خطأ في إنشاء الحساب بالرقم:', error);
        if (error.message.includes('Phone signups are disabled')) {
          toast({
            title: "تسجيل الهاتف معطل",
            description: "تسجيل الحسابات بالهاتف معطل حالياً. يرجى استخدام الحساب الوهمي أو تفعيل تسجيل الهاتف في إعدادات Supabase",
            variant: "destructive"
          });
        } else if (error.message.includes('already registered')) {
          toast({
            title: "خطأ",
            description: "هذا الرقم مسجل مسبقاً",
            variant: "destructive"
          });
        } else {
          toast({
            title: "خطأ",
            description: `فشل في إرسال الكود: ${error.message}`,
            variant: "destructive"
          });
        }
      } else {
        console.log('تم إرسال كود التحقق:', data);
        toast({
          title: "تم إرسال الكود",
          description: "تم إرسال كود التحقق إلى رقمك"
        });
        setStep('verify');
      }
    } catch (error: any) {
      console.error('خطأ غير متوقع في إرسال الكود:', error);
      toast({
        title: "خطأ",
        description: `حدث خطأ غير متوقع: ${error.message}`,
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كود التحقق كاملاً",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const fullPhoneNumber = `${selectedCountry?.dialCode}${phoneNumber}`;
      console.log('محاولة التحقق من الكود:', verificationCode);
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: fullPhoneNumber,
        token: verificationCode,
        type: 'sms'
      });

      if (error) {
        console.error('خطأ في التحقق:', error);
        toast({
          title: "خطأ في التحقق",
          description: `كود التحقق غير صحيح: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log('تم التحقق بنجاح:', data);
        toast({
          title: "تم التحقق بنجاح",
          description: "مرحباً بك في منصة المناظرات"
        });
        onSuccess();
      }
    } catch (error: any) {
      console.error('خطأ غير متوقع في التحقق:', error);
      toast({
        title: "خطأ في التحقق",
        description: `حدث خطأ أثناء التحقق: ${error.message}`,
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleResendCode = async () => {
    if (!selectedCountry || !phoneNumber.trim()) return;
    
    setIsLoading(true);
    const fullPhoneNumber = `${selectedCountry.dialCode}${phoneNumber}`;
    
    try {
      console.log('إعادة إرسال الكود إلى:', fullPhoneNumber);
      const { data, error } = await supabase.auth.resend({
        type: 'sms',
        phone: fullPhoneNumber
      });

      if (error) {
        console.error('خطأ في إعادة الإرسال:', error);
        toast({
          title: "خطأ",
          description: `فشل في إعادة إرسال الكود: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log('تم إعادة الإرسال بنجاح:', data);
        toast({
          title: "تم إعادة الإرسال",
          description: "تم إعادة إرسال كود التحقق"
        });
      }
    } catch (error: any) {
      console.error('خطأ غير متوقع في إعادة الإرسال:', error);
      toast({
        title: "خطأ",
        description: `حدث خطأ غير متوقع: ${error.message}`,
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  if (step === 'verify') {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
            تحقق من رقم الهاتف
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            تم إرسال كود التحقق إلى {selectedCountry?.dialCode}{phoneNumber}
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-blue-700 dark:text-blue-300 font-semibold">
            كود التحقق
          </Label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={verificationCode}
              onChange={setVerificationCode}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <Button 
          onClick={handleVerifyCode}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3"
          disabled={isLoading || verificationCode.length !== 6}
        >
          {isLoading ? 'جاري التحقق...' : 'تحقق من الكود'}
        </Button>

        <Button 
          onClick={handleResendCode}
          variant="outline"
          className="w-full border-2 border-blue-300"
          disabled={isLoading}
        >
          إعادة إرسال الكود
        </Button>

        <Button 
          onClick={() => setStep('phone')}
          variant="ghost"
          className="w-full text-blue-600"
        >
          العودة لتغيير الرقم
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-blue-700 dark:text-blue-300 font-semibold">
          البلد
        </Label>
        <CountrySelector
          selectedCountry={selectedCountry}
          onCountryChange={setSelectedCountry}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-blue-700 dark:text-blue-300 font-semibold">
          رقم الهاتف
        </Label>
        <div className="flex gap-2">
          <div className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 border-2 border-blue-300 rounded-md min-w-[80px] justify-center">
            <span className="text-sm font-medium">
              {selectedCountry?.dialCode || '+xxx'}
            </span>
          </div>
          <Input
            type="tel"
            placeholder="أدخل رقم الهاتف"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
            className="flex-1 border-2 border-blue-300 focus:border-blue-500 dark:border-blue-600"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-blue-700 dark:text-blue-300 font-semibold">
          كلمة المرور
        </Label>
        <Input
          type="password"
          placeholder="أدخل كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-2 border-blue-300 focus:border-blue-500 dark:border-blue-600"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-blue-700 dark:text-blue-300 font-semibold">
          تأكيد كلمة المرور
        </Label>
        <Input
          type="password"
          placeholder="أعد إدخال كلمة المرور"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border-2 border-blue-300 focus:border-blue-500 dark:border-blue-600"
        />
      </div>

      <Button 
        onClick={handleSendCode}
        className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3"
        disabled={isLoading || !selectedCountry || !phoneNumber || !password || !confirmPassword}
      >
        {isLoading ? 'جاري الإرسال...' : 'إرسال كود التحقق'}
      </Button>
    </div>
  );
};

export default PhoneVerification;
