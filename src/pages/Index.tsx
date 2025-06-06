
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-islamic-gradient flex items-center justify-center p-4">
      <Card className="islamic-card max-w-2xl mx-auto shadow-2xl">
        <CardContent className="text-center space-y-8 p-8">
          <div className="space-y-4">
            <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-3xl">🕌</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-2">
              أرينا المناظرة
            </h1>
            
            <p className="text-xl text-white/90 mb-6">
              منصة المناظرات الإسلامية للحوار الحضاري
            </p>
          </div>

          <div className="space-y-4 text-white/80">
            <p className="text-lg">
              منصة متخصصة للمناظرات الإسلامية بين أهل السنة والشيعة
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">مناظرات منظمة</h3>
                <p className="text-sm">نظام جولات بأوقات محددة ومؤقتات دقيقة</p>
              </div>
              
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">تحكم صوتي</h3>
                <p className="text-sm">تفعيل وإلغاء الميكروفون تلقائياً حسب الدور</p>
              </div>
              
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">غرف خاصة</h3>
                <p className="text-sm">إنشاء مناظرات خاصة أو الانضمام لمناظرات عشوائية</p>
              </div>
              
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">تعليقات مباشرة</h3>
                <p className="text-sm">نظام تعليقات للمتابعين والمشاهدين</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => navigate('/')}
              className="w-full islamic-button text-lg py-3"
            >
              ابدأ المناظرة الآن
            </Button>
            
            <p className="text-sm text-white/70">
              انضم إلى مجتمع المناظرين وشارك في حوارات بناءة ومثمرة
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
