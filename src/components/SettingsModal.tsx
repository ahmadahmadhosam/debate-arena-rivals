import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Moon, Sun, LogOut, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('ar');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // تحميل الإعدادات المحفوظة
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language') || 'ar';
    
    setIsDarkMode(savedTheme === 'dark');
    setLanguage(savedLanguage);
    
    // تطبيق الثيم
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    toast({
      title: "تم تحديث الثيم",
      description: newTheme ? "تم تفعيل الوضع الداكن" : "تم تفعيل الوضع النهاري"
    });
  };

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // تطبيق اتجاه اللغة
    if (newLanguage === 'ar') {
      document.documentElement.dir = 'rtl';
      document.body.style.fontFamily = "'Noto Sans Arabic', sans-serif";
    } else {
      document.documentElement.dir = 'ltr';
      document.body.style.fontFamily = "'Inter', sans-serif";
    }

    toast({
      title: "تم تحديث اللغة",
      description: newLanguage === 'ar' ? "تم تغيير اللغة إلى العربية" : "Language changed to English"
    });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // مسح البيانات المحلية
      localStorage.removeItem('app_user');
      
      toast({
        title: "تم تسجيل الخروج",
        description: "شكراً لاستخدام منصة المناظرات"
      });
      onClose();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive"
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!isOpen) return null;

  const texts = {
    ar: {
      settings: 'الإعدادات',
      darkMode: 'الوضع الداكن',
      lightMode: 'الوضع النهاري',
      language: 'اللغة',
      arabic: 'العربية',
      english: 'الإنجليزية',
      logout: 'تسجيل الخروج',
      close: 'إغلاق'
    },
    en: {
      settings: 'Settings',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      language: 'Language',
      arabic: 'Arabic',
      english: 'English',
      logout: 'Logout',
      close: 'Close'
    }
  };

  const t = texts[language as keyof typeof texts];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md bg-white/95 dark:bg-gray-800/95 shadow-2xl backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700 transform animate-fadeIn">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold text-blue-800 dark:text-blue-200 text-outlined">
            {t.settings}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-blue-100 dark:hover:bg-blue-900 text-outlined">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* إعداد الثيم */}
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <div className="flex items-center space-x-reverse space-x-3">
              {isDarkMode ? (
                <Moon className="h-5 w-5 text-blue-600" />
              ) : (
                <Sun className="h-5 w-5 text-blue-600" />
              )}
              <span className="text-blue-700 dark:text-blue-300 font-medium text-outlined">
                {isDarkMode ? t.darkMode : t.lightMode}
              </span>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleTheme}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          {/* إعداد اللغة */}
          <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
            <div className="flex items-center space-x-reverse space-x-3">
              <Globe className="h-5 w-5 text-purple-600" />
              <span className="text-purple-700 dark:text-purple-300 font-medium text-outlined">
                {t.language}
              </span>
            </div>
            <Select value={language} onValueChange={changeLanguage}>
              <SelectTrigger className="w-32 border-2 border-purple-300 dark:border-purple-600 text-outlined">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar" className="text-outlined">{t.arabic}</SelectItem>
                <SelectItem value="en" className="text-outlined">{t.english}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* فاصل */}
          <div className="border-t border-blue-200 dark:border-blue-700"></div>

          {/* تسجيل الخروج */}
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="outline"
            className="w-full border-2 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 transform hover:scale-105 transition-all duration-200 text-outlined"
          >
            <LogOut className="h-4 w-4 ml-2" />
            <span>
              {isLoggingOut ? 'جاري تسجيل الخروج...' : t.logout}
            </span>
          </Button>

          {/* زر الإغلاق */}
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transform hover:scale-105 transition-all duration-200 shadow-lg text-outlined"
          >
            {t.close}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsModal;