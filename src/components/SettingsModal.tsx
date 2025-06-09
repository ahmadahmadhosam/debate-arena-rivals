
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Moon, Sun, LogOut, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('ar');

  useEffect(() => {
    // تحميل الإعدادات المحفوظة
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language') || 'ar';
    
    setIsDarkMode(savedTheme === 'dark');
    setLanguage(savedLanguage);
    
    // تطبيق السمة
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
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('currentDebateSession');
    navigate('/');
    onClose();
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold text-sky-800 dark:text-sky-200">
            {t.settings}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* إعداد السمة */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-3">
              {isDarkMode ? (
                <Moon className="h-5 w-5 text-sky-600" />
              ) : (
                <Sun className="h-5 w-5 text-sky-600" />
              )}
              <span className="text-sky-700 dark:text-sky-300 font-medium">
                {isDarkMode ? t.darkMode : t.lightMode}
              </span>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleTheme}
            />
          </div>

          {/* إعداد اللغة */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-3">
              <Globe className="h-5 w-5 text-sky-600" />
              <span className="text-sky-700 dark:text-sky-300 font-medium">
                {t.language}
              </span>
            </div>
            <Select value={language} onValueChange={changeLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">{t.arabic}</SelectItem>
                <SelectItem value="en">{t.english}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* خط فاصل */}
          <div className="border-t border-sky-200 dark:border-sky-700"></div>

          {/* تسجيل الخروج */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
          >
            <LogOut className="h-4 w-4 ml-2" />
            {t.logout}
          </Button>

          {/* زر الإغلاق */}
          <Button
            onClick={onClose}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white"
          >
            {t.close}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsModal;
