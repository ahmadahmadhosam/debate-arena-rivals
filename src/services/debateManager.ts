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

class DebateManager {
  private storageKey = 'activeDebates';
  private sessionKey = 'currentDebateSession';
  private usedCodesKey = 'usedDebateCodes';
  private randomDebatesKey = 'randomDebates';

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
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      attempts++;
      
      if (attempts >= maxAttempts) {
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

  // إدارة المناظرات العشوائية
  getRandomDebates(): DebateSession[] {
    const debates = localStorage.getItem(this.randomDebatesKey);
    return debates ? JSON.parse(debates) : [];
  }

  saveRandomDebates(debates: DebateSession[]): void {
    localStorage.setItem(this.randomDebatesKey, JSON.stringify(debates));
  }

  createRandomDebate(creator: string, creatorReligion: string, settings: any): string | null {
    try {
      const code = this.generateUniqueCode();
      
      const newDebate: DebateSession = {
        code,
        creator,
        creatorReligion,
        settings: {
          ...settings,
          isRandom: true
        },
        isActive: false,
        isRandom: true,
        createdAt: new Date()
      };

      const randomDebates = this.getRandomDebates();
      randomDebates.push(newDebate);
      this.saveRandomDebates(randomDebates);
      this.addUsedCode(code);
      
      console.log(`تم إنشاء مناظرة عشوائية بالكود: ${code}`);
      return code;
    } catch (error) {
      console.error('خطأ في إنشاء المناظرة العشوائية:', error);
      return null;
    }
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
      // البحث في المناظرات الخاصة أولاً
      const debates = this.getActiveDebates();
      const normalizedCode = code.toUpperCase().trim();
      
      console.log(`محاولة الدخول بالكود: ${normalizedCode}`);
      console.log('المناظرات المتاحة:', debates.map(d => ({ code: d.code, creator: d.creator, hasOpponent: !!d.opponent })));
      
      let debateIndex = debates.findIndex(debate => 
        debate.code === normalizedCode && !debate.opponent
      );

      let isRandomDebate = false;
      let targetDebates = debates;

      // إذا لم توجد في المناظرات الخاصة، ابحث في العشوائية
      if (debateIndex === -1) {
        const randomDebates = this.getRandomDebates();
        debateIndex = randomDebates.findIndex(debate => 
          debate.code === normalizedCode && !debate.opponent
        );
        
        if (debateIndex !== -1) {
          isRandomDebate = true;
          targetDebates = randomDebates;
        }
      }

      if (debateIndex === -1) {
        console.log('المناظرة غير موجودة أو ممتلئة');
        return null;
      }

      const debate = targetDebates[debateIndex];
      
      // التحقق من اختلاف المذهب
      if (debate.creatorReligion === opponentReligion) {
        console.log('نفس المذهب');
        return null;
      }

      // إضافة المناظر
      debate.opponent = opponent;
      debate.opponentReligion = opponentReligion;
      debate.isActive = true;

      targetDebates[debateIndex] = debate;
      
      // حفظ التغييرات في المكان المناسب
      if (isRandomDebate) {
        this.saveRandomDebates(targetDebates);
      } else {
        this.saveActiveDebates(targetDebates);
      }

      console.log(`تم الانضمام للمناظرة بنجاح: ${code}`);
      return debate;
    } catch (error) {
      console.error('خطأ في الانضمام للمناظرة:', error);
      return null;
    }
  }

  getDebate(code: string): DebateSession | null {
    try {
      const normalizedCode = code.toUpperCase().trim();
      
      // البحث في المناظرات الخاصة
      const debates = this.getActiveDebates();
      let found = debates.find(debate => debate.code === normalizedCode);
      
      // البحث في المناظرات العشوائية إذا لم توجد في الخاصة
      if (!found) {
        const randomDebates = this.getRandomDebates();
        found = randomDebates.find(debate => debate.code === normalizedCode);
      }
      
      console.log(`البحث عن الكود ${normalizedCode}:`, found ? 'موجود' : 'غير موجود');
      return found || null;
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
    const randomDebates = this.getRandomDebates();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const activeDebates = debates.filter(debate => 
      new Date(debate.createdAt) > oneDayAgo
    );

    const activeRandomDebates = randomDebates.filter(debate => 
      new Date(debate.createdAt) > oneDayAgo
    );

    this.saveActiveDebates(activeDebates);
    this.saveRandomDebates(activeRandomDebates);
  }

  // إحصائيات للمطورين
  getDebateStats() {
    const debates = this.getActiveDebates();
    const randomDebates = this.getRandomDebates();
    const usedCodes = this.getUsedCodes();
    
    return {
      totalDebates: debates.length + randomDebates.length,
      activeDebates: debates.filter(d => d.isActive).length + randomDebates.filter(d => d.isActive).length,
      waitingDebates: debates.filter(d => !d.isActive).length + randomDebates.filter(d => !d.isActive).length,
      randomDebates: randomDebates.length,
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
