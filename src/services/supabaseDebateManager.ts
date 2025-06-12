import { supabase } from '@/integrations/supabase/client';

export interface DebateSettings {
  preparationTime: number;
  roundTime: number;
  roundCount: number;
  finalTime: number;
  autoMic?: boolean;
  isRandom?: boolean;
  cameraOptional?: boolean;
}

export interface Debate {
  id: string;
  code: string;
  creator_id: string;
  creator_religion: string;
  opponent_id?: string;
  opponent_religion?: string;
  settings: DebateSettings;
  is_active: boolean;
  is_public: boolean;
  is_random: boolean;
  status: 'waiting' | 'active' | 'finished';
  created_at: string;
  updated_at: string;
}

export class SupabaseDebateManager {
  async setCurrentUser(userId: string) {
    await supabase.rpc('set_config', {
      setting_name: 'app.current_user_id',
      setting_value: userId,
      is_local: true
    });
  }

  async generateUniqueCode(): Promise<string> {
    let code: string;
    let attempts = 0;
    const maxAttempts = 50;
    let data: any = null;

    do {
      // توليد كود من 6 أحرف وأرقام
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      attempts++;
      
      if (attempts >= maxAttempts) {
        code = Date.now().toString(36).toUpperCase().substring(0, 6);
        break;
      }
      
      const result = await supabase
        .from('debates')
        .select('code')
        .eq('code', code)
        .maybeSingle();
        
      if (result.error) {
        console.error('Error checking code uniqueness:', result.error);
        break;
      }
      
      data = result.data;
        
    } while (data && attempts < maxAttempts);

    return code;
  }

  async createPrivateDebate(creatorId: string, creatorReligion: string, settings: DebateSettings): Promise<string | null> {
    try {
      await this.setCurrentUser(creatorId);
      const code = await this.generateUniqueCode();
      
      const { data, error } = await supabase
        .from('debates')
        .insert({
          code,
          creator_id: creatorId,
          creator_religion: creatorReligion,
          settings: settings as any,
          is_active: false,
          is_public: false,
          is_random: false,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating private debate:', error);
        return null;
      }

      return code;
    } catch (error) {
      console.error('Error creating private debate:', error);
      return null;
    }
  }

  async createRandomDebate(creatorId: string, creatorReligion: string, settings: DebateSettings): Promise<string | null> {
    try {
      await this.setCurrentUser(creatorId);
      const code = await this.generateUniqueCode();
      
      const { data, error } = await supabase
        .from('debates')
        .insert({
          code,
          creator_id: creatorId,
          creator_religion: creatorReligion,
          settings: { ...settings, isRandom: true } as any,
          is_active: false,
          is_public: true,
          is_random: true,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating random debate:', error);
        return null;
      }

      return code;
    } catch (error) {
      console.error('Error creating random debate:', error);
      return null;
    }
  }

  async joinDebate(code: string, opponentId: string, opponentReligion: string): Promise<Debate | null> {
    try {
      await this.setCurrentUser(opponentId);
      const normalizedCode = code.toUpperCase().trim();
      
      // البحث عن المناظرة
      const { data: debate, error: fetchError } = await supabase
        .from('debates')
        .select('*')
        .eq('code', normalizedCode)
        .is('opponent_id', null)
        .maybeSingle();

      if (fetchError || !debate) {
        console.error('Debate not found:', fetchError);
        return null;
      }

      // التحقق من اختلاف المذهب
      if (debate.creator_religion === opponentReligion) {
        console.error('Same religion not allowed');
        return null;
      }

      // تحديث المناظرة بالمناظر الجديد
      const { data: updatedDebate, error: updateError } = await supabase
        .from('debates')
        .update({
          opponent_id: opponentId,
          opponent_religion: opponentReligion,
          is_active: true,
          status: 'active'
        })
        .eq('id', debate.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error joining debate:', updateError);
        return null;
      }

      return {
        ...updatedDebate,
        settings: (updatedDebate.settings as unknown) as DebateSettings,
        status: updatedDebate.status as 'waiting' | 'active' | 'finished',
        is_active: updatedDebate.is_active ?? false,
        is_public: updatedDebate.is_public ?? false,
        is_random: updatedDebate.is_random ?? false
      };
    } catch (error) {
      console.error('Error joining debate:', error);
      return null;
    }
  }

  async getDebate(code: string): Promise<Debate | null> {
    try {
      const normalizedCode = code.toUpperCase().trim();
      
      const { data, error } = await supabase
        .from('debates')
        .select('*')
        .eq('code', normalizedCode)
        .maybeSingle();

      if (error) {
        console.error('Error fetching debate:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        ...data,
        settings: (data.settings as unknown) as DebateSettings,
        status: data.status as 'waiting' | 'active' | 'finished',
        is_active: data.is_active ?? false,
        is_public: data.is_public ?? false,
        is_random: data.is_random ?? false
      };
    } catch (error) {
      console.error('Error fetching debate:', error);
      return null;
    }
  }

  async getRandomDebates(): Promise<Debate[]> {
    try {
      const { data, error } = await supabase
        .from('debates')
        .select('*')
        .eq('is_random', true)
        .eq('status', 'waiting')
        .is('opponent_id', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching random debates:', error);
        return [];
      }

      return (data || []).map(debate => ({
        ...debate,
        settings: (debate.settings as unknown) as DebateSettings,
        status: debate.status as 'waiting' | 'active' | 'finished',
        is_active: debate.is_active ?? false,
        is_public: debate.is_public ?? false,
        is_random: debate.is_random ?? false
      }));
    } catch (error) {
      console.error('Error fetching random debates:', error);
      return [];
    }
  }

  async getPublicDebates(): Promise<Debate[]> {
    try {
      const { data, error } = await supabase
        .from('debates')
        .select('*')
        .eq('is_public', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching public debates:', error);
        return [];
      }

      return (data || []).map(debate => ({
        ...debate,
        settings: (debate.settings as unknown) as DebateSettings,
        status: debate.status as 'waiting' | 'active' | 'finished',
        is_active: debate.is_active ?? false,
        is_public: debate.is_public ?? false,
        is_random: debate.is_random ?? false
      }));
    } catch (error) {
      console.error('Error fetching public debates:', error);
      return [];
    }
  }

  async getUserDebates(userId: string): Promise<Debate[]> {
    try {
      await this.setCurrentUser(userId);
      
      const { data, error } = await supabase
        .from('debates')
        .select('*')
        .or(`creator_id.eq.${userId},opponent_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user debates:', error);
        return [];
      }

      return (data || []).map(debate => ({
        ...debate,
        settings: (debate.settings as unknown) as DebateSettings,
        status: debate.status as 'waiting' | 'active' | 'finished',
        is_active: debate.is_active ?? false,
        is_public: debate.is_public ?? false,
        is_random: debate.is_random ?? false
      }));
    } catch (error) {
      console.error('Error fetching user debates:', error);
      return [];
    }
  }

  async publishDebate(debateId: string, isPublic: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('debates')
        .update({ is_public: isPublic })
        .eq('id', debateId);

      if (error) {
        console.error('Error publishing debate:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error publishing debate:', error);
      return false;
    }
  }

  async finishDebate(debateId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('debates')
        .update({ 
          status: 'finished',
          is_active: false 
        })
        .eq('id', debateId);

      if (error) {
        console.error('Error finishing debate:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error finishing debate:', error);
      return false;
    }
  }
}

export const supabaseDebateManager = new SupabaseDebateManager();