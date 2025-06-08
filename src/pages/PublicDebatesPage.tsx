
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Users, Clock, Trophy, Eye } from 'lucide-react';

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
  };
}

const PublicDebatesPage = () => {
  const [publicDebates, setPublicDebates] = useState<PublishedDebate[]>([]);
  const [filteredDebates, setFilteredDebates] = useState<PublishedDebate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'completed' | 'waiting'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadPublicDebates();
  }, []);

  useEffect(() => {
    filterDebates();
  }, [searchTerm, filterType, publicDebates]);

  const loadPublicDebates = () => {
    const debates = localStorage.getItem('publishedDebates');
    const allDebates: PublishedDebate[] = debates ? JSON.parse(debates) : [];
    const publicOnly = allDebates.filter(debate => debate.isPublic);
    setPublicDebates(publicOnly);
  };

  const filterDebates = () => {
    let filtered = publicDebates;

    // فلترة حسب النوع
    if (filterType === 'completed') {
      filtered = filtered.filter(debate => debate.opponent);
    } else if (filterType === 'waiting') {
      filtered = filtered.filter(debate => !debate.opponent);
    }

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(debate => 
        debate.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        debate.opponent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        debate.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDebates(filtered);
  };

  const viewDebate = (code: string) => {
    navigate(`/debate/${code}`);
  };

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
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* شريط البحث والفلترة */}
        <Card className="islamic-card">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث عن مناظرة أو مناظر..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <div className="flex space-x-reverse space-x-2">
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
                  {searchTerm || filterType !== 'all' 
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
                      <Eye className="h-4 w-4 text-green-600" />
                      {debate.opponent ? (
                        <Badge variant="secondary">مكتملة</Badge>
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

                  <div className="bg-muted/50 p-3 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span>وقت الجولة:</span>
                      <span className="font-medium">{debate.settings.roundTime} دقيقة</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>عدد الجولات:</span>
                      <span className="font-medium">{debate.settings.roundCount} جولات</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>التحضير:</span>
                      <span className="font-medium">{debate.settings.preparationTime} دقيقة</span>
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
