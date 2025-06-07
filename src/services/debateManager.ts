
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

  getActiveDebates(): DebateSession[] {
    const debates = localStorage.getItem(this.storageKey);
    return debates ? JSON.parse(debates) : [];
  }

  saveActiveDebates(debates: DebateSession[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(debates));
  }

  createPrivateDebate(code: string, creator: string, creatorReligion: string, settings: any): boolean {
    const debates = this.getActiveDebates();
    
    // التحقق من عدم وجود مناظرة بنفس الكود
    if (debates.find(debate => debate.code === code)) {
      return false;
    }

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
    return true;
  }

  joinPrivateDebate(code: string, opponent: string, opponentReligion: string): DebateSession | null {
    const debates = this.getActiveDebates();
    const debateIndex = debates.findIndex(debate => debate.code === code && !debate.opponent);

    if (debateIndex === -1) {
      return null; // المناظرة غير موجودة أو ممتلئة
    }

    const debate = debates[debateIndex];
    
    // التحقق من اختلاف المذهب
    if (debate.creatorReligion === opponentReligion) {
      return null; // نفس المذهب
    }

    // إضافة المناظر
    debate.opponent = opponent;
    debate.opponentReligion = opponentReligion;
    debate.isActive = true;

    debates[debateIndex] = debate;
    this.saveActiveDebates(debates);

    return debate;
  }

  getDebate(code: string): DebateSession | null {
    const debates = this.getActiveDebates();
    return debates.find(debate => debate.code === code) || null;
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
}

export const debateManager = new DebateManager();
