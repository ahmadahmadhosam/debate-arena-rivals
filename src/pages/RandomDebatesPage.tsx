
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, Users, Trash2 } from 'lucide-react';
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

const RandomDebatesPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [randomDebates, setRandomDebates] = useState<DebateSession[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/');
      return;
    }

    loadRandomDebates();
  }, [navigate]);

  const loadRandomDebates = () => {
    const debates = debateManager.getRandomDebates();
    const userDebates = debates.filter(debate => debate.creator === user?.username);
    setRandomDebates(userDebates);
  };

  const deleteDebate = (code: string) => {
    const debates = debateManager.getRandomDebates();
    const updatedDebates = debates.filter(debate => debate.code !== code);
    debateManager.saveRandomDebates(updatedDebates);
    loadRandomDebates();
  };

  const joinDebate = (code: string) => {
    navigate(`/debate/${code}`);
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
                المناظرات العشوائية
              </h1>
              <p className="text-sm text-sky-600 dark:text-sky-300">
                إدارة مناظراتك العشوائية
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
                لا توجد مناظرات عشوائية
              </h3>
              <p className="text-sky-600 mb-4">
                لم تقم بإنشاء أي مناظرات عشوائية بعد
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {randomDebates.map((debate) => (
              <Card key={debate.code} className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-200">
                  <CardTitle className="text-sky-800 flex items-center justify-between">
                    <span className="font-mono text-lg">{debate.code}</span>
                    <div className="flex items-center space-x-2">
                      {debate.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          نشطة
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          في الانتظار
                        </span>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Clock className="h-4 w-4 text-sky-600" />
                      <span className="text-sky-700">تحضير: {debate.settings.preparationTime}د</span>
                    </div>
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Clock className="h-4 w-4 text-sky-600" />
                      <span className="text-sky-700">جولة: {debate.settings.roundTime}د</span>
                    </div>
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Users className="h-4 w-4 text-sky-600" />
                      <span className="text-sky-700">جولات: {debate.settings.roundCount}</span>
                    </div>
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Clock className="h-4 w-4 text-sky-600" />
                      <span className="text-sky-700">نهاية: {debate.settings.finalTime}د</span>
                    </div>
                  </div>

                  {debate.opponent && (
                    <div className="bg-sky-50 p-3 rounded-lg border border-sky-200">
                      <p className="text-sm text-sky-700">
                        <strong>المناظر:</strong> {debate.opponent} ({debate.opponentReligion})
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-reverse space-x-2">
                    <Button
                      onClick={() => joinDebate(debate.code)}
                      className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
                      size="sm"
                    >
                      دخول المناظرة
                    </Button>
                    <Button
                      onClick={() => deleteDebate(debate.code)}
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-xs text-sky-500">
                    تم الإنشاء: {new Date(debate.createdAt).toLocaleDateString('ar-SA')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RandomDebatesPage;
