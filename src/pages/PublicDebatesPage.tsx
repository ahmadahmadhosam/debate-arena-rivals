
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Clock, Trophy, Eye, Globe, Mic, MicOff } from 'lucide-react';

interface PublishedDebate {
  code: string;
  title: string;
  creator: string;
  creatorReligion: string;
  opponent?: string;
  opponentReligion?: string;
  isPublic: boolean;
  publishedAt: Date;
  settings: {
    preparationTime: number;
    roundTime: number;
    roundCount: number;
    finalTime: number;
    autoMic?: boolean;
  };
}

const PublicDebatesPage = () => {
  const [publicDebates, setPublicDebates] = useState<PublishedDebate[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'completed' | 'waiting'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadPublicDebates();
  }, []);

  const loadPublicDebates = () => {
    const debates = localStorage.getItem('publishedDebates');
    const allDebates: PublishedDebate[] = debates ? JSON.parse(debates) : [];
    const publicOnly = allDebates.filter(debate => debate.isPublic);
    setPublicDebates(publicOnly);
  };

  const getFilteredDebates = () => {
    let filtered = publicDebates;

    if (filterType === 'completed') {
      filtered = filtered.filter(debate => debate.opponent);
    } else if (filterType === 'waiting') {
      filtered = filtered.filter(debate => !debate.opponent);
    }

    return filtered;
  };

  const viewDebate = (code: string) => {
    navigate(`/debate/${code}`);
  };

  const filteredDebates = getFilteredDebates();

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-gold-50 to-islamic-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* الشريط العلوي */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-reverse space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-islamic-gold-800 dark:text-islamic-gold-200">
                المناظرات العامة
              </h1>
              <p className="text-sm text-muted-foreground">
                تصفح المناظرات المنشورة من المجتمع
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-reverse space-x-2">
            <Globe className="h-5 w-5 text-islamic-gold-600" />
            <span className="text-sm font-medium">{publicDebates.length} مناظرة عامة</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* شريط الفلترة */}
        <Card className="islamic-card">
          <CardContent className="pt-6">
            <div className="flex justify-center space-x-reverse space-x-4">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
                size="sm"
              >
                الكل ({publicDebates.length})
              </Button>
              <Button
                variant={filterType === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilterType('completed')}
                size="sm"
              >
                مكتملة ({publicDebates.filter(d => d.opponent).length})
              </Button>
              <Button
                variant={filterType === 'waiting' ? 'default' : 'outline'}
                onClick={() => setFilterType('waiting')}
                size="sm"
              >
                في الانتظار ({publicDebates.filter(d => !d.opponent).length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* قائمة المناظرات */}
        {filteredDebates.length === 0 ? (
          <Card className="islamic-card">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  {filterType !== 'all' 
                    ? 'لم يتم العثور على مناظرات مطابقة' 
                    : 'لا توجد مناظرات عامة متاحة حالياً'}
                </p>
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                >
                  إنشاء مناظرة جديدة
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDebates.map((debate) => (
              <Card key={debate.code} className="islamic-card hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono">
                      {debate.code}
                    </Badge>
                    <div className="flex items-center space-x-reverse space-x-1">
                      <Globe className="h-4 w-4 text-blue-600" />
                      {debate.opponent ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          مكتملة
                        </Badge>
                      ) : (
                        <Badge variant="destructive">في الانتظار</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">المنشئ:</span>
                      <div className="flex items-center space-x-reverse space-x-1">
                        <span className="font-medium">{debate.creator}</span>
                        <Badge variant="outline" className="text-xs">
                          {debate.creatorReligion}
                        </Badge>
                      </div>
                    </div>
                    
                    {debate.opponent && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">المناظر:</span>
                        <div className="flex items-center space-x-reverse space-x-1">
                          <span className="font-medium">{debate.opponent}</span>
                          <Badge variant="outline" className="text-xs">
                            {debate.opponentReligion}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* تفاصيل المناظرة المحسنة */}
                  <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-reverse space-x-1">
                        <Clock className="h-3 w-3 text-blue-500" />
                        <span>التحضير: {debate.settings.preparationTime} دقيقة</span>
                      </div>
                      <div className="flex items-center space-x-reverse space-x-1">
                        <Clock className="h-3 w-3 text-green-500" />
                        <span>الجولة: {debate.settings.roundTime} دقيقة</span>
                      </div>
                      <div className="flex items-center space-x-reverse space-x-1">
                        <Trophy className="h-3 w-3 text-purple-500" />
                        <span>الجولات: {debate.settings.roundCount}</span>
                      </div>
                      <div className="flex items-center space-x-reverse space-x-1">
                        <Clock className="h-3 w-3 text-orange-500" />
                        <span>النهاية: {debate.settings.finalTime} دقيقة</span>
                      </div>
                    </div>
                    
                    {/* ميزات إضافية */}
                    <div className="flex items-center justify-between pt-1 border-t border-muted">
                      <div className="flex items-center space-x-reverse space-x-1">
                        {debate.settings.autoMic ? (
                          <>
                            <Mic className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600">ميكروفون تلقائي</span>
                          </>
                        ) : (
                          <>
                            <MicOff className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500">ميكروفون يدوي</span>
                          </>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(debate.publishedAt).toLocaleDateString('ar')}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => viewDebate(debate.code)}
                    className="w-full"
                    variant={debate.opponent ? "outline" : "default"}
                  >
                    {debate.opponent ? (
                      <>
                        <Eye className="h-4 w-4 ml-2" />
                        مشاهدة المناظرة
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4 ml-2" />
                        انضم للمناظرة
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicDebatesPage;
