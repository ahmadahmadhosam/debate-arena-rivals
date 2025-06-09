
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, Users, ChevronDown, ChevronUp, User } from 'lucide-react';
import { debateManager } from '@/services/debateManager';

interface User {
  username: string;
  religion: string;
}

interface DebateSession {
  code: string;
  creator: string;
  creatorReligion: string;
  opponent?: string;
  opponentReligion?: string;
  settings: {
    preparationTime: number;
    roundTime: number;
    roundCount: number;
    finalTime: number;
    autoMic?: boolean;
    isRandom?: boolean;
  };
  isActive: boolean;
  isRandom?: boolean;
  createdAt: Date;
}

const PublicRandomDebatesPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [randomDebates, setRandomDebates] = useState<DebateSession[]>([]);
  const [expandedDebates, setExpandedDebates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/');
      return;
    }

    loadRandomDebates();
    
    // تحديث القائمة كل 5 ثواني
    const interval = setInterval(loadRandomDebates, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const loadRandomDebates = () => {
    const debates = debateManager.getRandomDebates();
    // إظهار المناظرات المتاحة فقط (غير النشطة وبدون خصم)
    const availableDebates = debates.filter(debate => 
      !debate.isActive && 
      !debate.opponent &&
      debate.creatorReligion !== user?.religion
    );
    setRandomDebates(availableDebates);
  };

  const toggleExpanded = (code: string) => {
    const newExpanded = new Set(expandedDebates);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedDebates(newExpanded);
  };

  const joinDebate = (code: string) => {
    if (!user) return;
    
    const result = debateManager.joinPrivateDebate(code, user.username, user.religion);
    if (result) {
      navigate(`/debate/${code}`);
    } else {
      alert('فشل في الانضمام للمناظرة');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      {/* الشريط العلوي */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-sky-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-reverse space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-sky-100"
            >
              <ArrowLeft className="h-5 w-5 text-sky-600" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-sky-800 dark:text-sky-200">
                المناظرات العشوائية العامة
              </h1>
              <p className="text-sm text-sky-600 dark:text-sky-300">
                انضم لمناظرة عشوائية متاحة
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {randomDebates.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="w-20 h-20 bg-sky-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold text-sky-800 mb-2">
                لا توجد مناظرات متاحة حالياً
              </h3>
              <p className="text-sky-600 mb-4">
                لا توجد مناظرات عشوائية متاحة للانضمام في الوقت الحالي
              </p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-sky-500 hover:bg-sky-600 text-white"
              >
                إنشاء مناظرة جديدة
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {randomDebates.map((debate) => (
              <Card key={debate.code} className="bg-white/90 backdrop-blur-sm border-sky-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader 
                  className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-200 cursor-pointer"
                  onClick={() => toggleExpanded(debate.code)}
                >
                  <CardTitle className="text-sky-800 flex items-center justify-between">
                    <div className="flex items-center space-x-reverse space-x-3">
                      <User className="h-5 w-5 text-sky-600" />
                      <span>{debate.creator} ({debate.creatorReligion})</span>
                    </div>
                    <div className="flex items-center space-x-reverse space-x-3">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        متاحة
                      </span>
                      {expandedDebates.has(debate.code) ? (
                        <ChevronUp className="h-5 w-5 text-sky-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-sky-600" />
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                
                {expandedDebates.has(debate.code) && (
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-reverse space-x-2">
                        <Clock className="h-4 w-4 text-sky-600" />
                        <span className="text-sky-700 border border-sky-300 rounded px-2 py-1">
                          تحضير: {debate.settings.preparationTime}د
                        </span>
                      </div>
                      <div className="flex items-center space-x-reverse space-x-2">
                        <Clock className="h-4 w-4 text-sky-600" />
                        <span className="text-sky-700 border border-sky-300 rounded px-2 py-1">
                          جولة: {debate.settings.roundTime}د
                        </span>
                      </div>
                      <div className="flex items-center space-x-reverse space-x-2">
                        <Users className="h-4 w-4 text-sky-600" />
                        <span className="text-sky-700 border border-sky-300 rounded px-2 py-1">
                          جولات: {debate.settings.roundCount}
                        </span>
                      </div>
                      <div className="flex items-center space-x-reverse space-x-2">
                        <Clock className="h-4 w-4 text-sky-600" />
                        <span className="text-sky-700 border border-sky-300 rounded px-2 py-1">
                          نهاية: {debate.settings.finalTime}د
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        onClick={() => joinDebate(debate.code)}
                        className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-8 py-2"
                      >
                        انضمام للمناظرة
                      </Button>
                    </div>
                    
                    <p className="text-xs text-sky-500 text-center border-t border-sky-200 pt-2">
                      تم الإنشاء: {new Date(debate.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicRandomDebatesPage;
