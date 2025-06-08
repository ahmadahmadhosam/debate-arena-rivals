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
  };
  isActive: boolean;
  createdAt: Date;
}

class DebateManager {
  private storageKey = 'activeDebates';
  private sessionKey = 'currentDebateSession';
  private usedCodesKey = 'usedDebateCodes';

  // قائمة الأكواد المستخدمة
  getUsedCodes(): string[] {
    const codes = localStorage.getItem(this.usedCodesKey);
    return codes ? JSON.parse(codes) : [];
  }

  saveUsedCodes(codes: string[]): void {
    localStorage.setItem(this.usedCodesKey, JSON.stringify(codes));
  }

  // إضافة كود جديد للقائمة
  addUsedCode(code: string): void {
    const usedCodes = this.getUsedCodes();
    if (!usedCodes.includes(code)) {
      usedCodes.push(code);
      this.saveUsedCodes(usedCodes);
    }
  }

  // التحقق من استخدام الكود سابقاً
  isCodeUsed(code: string): boolean {
    return this.getUsedCodes().includes(code);
  }

  // توليد كود فريد محسن
  generateUniqueCode(): string {
    let code: string;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      // توليد كود من 6 أحرف وأرقام
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      attempts++;
      
      if (attempts >= maxAttempts) {
        // إذا فشل في إيجاد كود فريد، استخدم timestamp
        code = Date.now().toString(36).toUpperCase().substring(0, 6);
        break;
      }
    } while (this.isCodeUsed(code) || this.getDebate(code));

    console.log(`تم توليد كود جديد: ${code}`);
    return code;
  }

  getActiveDebates(): DebateSession[] {
    const debates = localStorage.getItem(this.storageKey);
    return debates ? JSON.parse(debates) : [];
  }

  saveActiveDebates(debates: DebateSession[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(debates));
  }

  createPrivateDebate(creator: string, creatorReligion: string, settings: any): string | null {
    try {
      const debates = this.getActiveDebates();
      
      // توليد كود فريد
      const code = this.generateUniqueCode();
      
      const newDebate: DebateSession = {
        code,
        creator,
        creatorReligion,
        settings,
        isActive: false,
        createdAt: new Date()
      };

      debates.push(newDebate);
      this.saveActiveDebates(debates);
      this.addUsedCode(code);
      
      console.log(`تم إنشاء مناظرة بالكود: ${code}`);
      console.log('المناظرات الحالية:', this.getActiveDebates().map(d => d.code));
      return code;
    } catch (error) {
      console.error('خطأ في إنشاء المناظرة:', error);
      return null;
    }
  }

  joinPrivateDebate(code: string, opponent: string, opponentReligion: string): DebateSession | null {
    try {
      const debates = this.getActiveDebates();
      const normalizedCode = code.toUpperCase().trim();
      
      console.log(`محاولة الدخول بالكود: ${normalizedCode}`);
      console.log('المناظرات المتاحة:', debates.map(d => ({ code: d.code, creator: d.creator, hasOpponent: !!d.opponent })));
      
      const debateIndex = debates.findIndex(debate => 
        debate.code === normalizedCode && !debate.opponent
      );

      if (debateIndex === -1) {
        console.log('المناظرة غير موجودة أو ممتلئة');
        return null;
      }

      const debate = debates[debateIndex];
      
      // التحقق من اختلاف المذهب
      if (debate.creatorReligion === opponentReligion) {
        console.log('نفس المذهب');
        return null;
      }

      // إضافة المناظر
      debate.opponent = opponent;
      debate.opponentReligion = opponentReligion;
      debate.isActive = true;

      debates[debateIndex] = debate;
      this.saveActiveDebates(debates);

      console.log(`تم الانضمام للمناظرة بنجاح: ${code}`);
      return debate;
    } catch (error) {
      console.error('خطأ في الانضمام للمناظرة:', error);
      return null;
    }
  }

  getDebate(code: string): DebateSession | null {
    try {
      const debates = this.getActiveDebates();
      const normalizedCode = code.toUpperCase().trim();
      const found = debates.find(debate => debate.code === normalizedCode) || null;
      console.log(`البحث عن الكود ${normalizedCode}:`, found ? 'موجود' : 'غير موجود');
      return found;
    } catch (error) {
      console.error('خطأ في البحث عن المناظرة:', error);
      return null;
    }
  }

  setCurrentSession(session: DebateSession): void {
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
  }

  getCurrentSession(): DebateSession | null {
    const session = localStorage.getItem(this.sessionKey);
    return session ? JSON.parse(session) : null;
  }

  clearCurrentSession(): void {
    localStorage.removeItem(this.sessionKey);
  }

  cleanupOldDebates(): void {
    const debates = this.getActiveDebates();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const activeDebates = debates.filter(debate => 
      new Date(debate.createdAt) > oneDayAgo
    );

    this.saveActiveDebates(activeDebates);
  }

  // إحصائيات للمطورين
  getDebateStats() {
    const debates = this.getActiveDebates();
    const usedCodes = this.getUsedCodes();
    
    return {
      totalDebates: debates.length,
      activeDebates: debates.filter(d => d.isActive).length,
      waitingDebates: debates.filter(d => !d.isActive).length,
      totalUsedCodes: usedCodes.length
    };
  }

  // وظائف جديدة لإدارة المناظرات المنشورة
  publishDebate(debate: DebateSession, isPublic: boolean = true) {
    const publishedDebates = this.getPublishedDebates();
    const publishedDebate = {
      ...debate,
      isPublic,
      publishedAt: new Date()
    };
    
    publishedDebates.push(publishedDebate);
    this.savePublishedDebates(publishedDebates);
    console.log(`تم نشر المناظرة: ${debate.code}`);
  }

  getPublishedDebates() {
    const debates = localStorage.getItem('publishedDebates');
    return debates ? JSON.parse(debates) : [];
  }

  savePublishedDebates(debates: any[]) {
    localStorage.setItem('publishedDebates', JSON.stringify(debates));
  }
}

export const debateManager = new DebateManager();
