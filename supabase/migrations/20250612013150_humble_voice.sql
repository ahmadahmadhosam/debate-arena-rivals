/*
  # إنشاء جدول المناظرات

  1. جداول جديدة
    - `debates`
      - `id` (uuid, primary key)
      - `code` (text, unique, كود المناظرة)
      - `creator_id` (uuid, منشئ المناظرة)
      - `creator_religion` (text, مذهب المنشئ)
      - `opponent_id` (uuid, المناظر الآخر)
      - `opponent_religion` (text, مذهب المناظر الآخر)
      - `settings` (jsonb, إعدادات المناظرة)
      - `is_active` (boolean, هل المناظرة نشطة)
      - `is_public` (boolean, هل المناظرة عامة)
      - `is_random` (boolean, هل المناظرة عشوائية)
      - `status` (text, حالة المناظرة)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جدول `debates`
    - إضافة سياسات للقراءة والكتابة
*/

CREATE TABLE IF NOT EXISTS debates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  creator_id text NOT NULL,
  creator_religion text NOT NULL,
  opponent_id text,
  opponent_religion text,
  settings jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT false,
  is_public boolean DEFAULT false,
  is_random boolean DEFAULT false,
  status text DEFAULT 'waiting',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE debates ENABLE ROW LEVEL SECURITY;

-- سياسة للقراءة - يمكن للجميع رؤية المناظرات العامة والعشوائية
CREATE POLICY "Anyone can view public debates"
  ON debates
  FOR SELECT
  USING (is_public = true OR is_random = true);

-- سياسة للقراءة - يمكن للمشاركين رؤية مناظراتهم الخاصة
CREATE POLICY "Participants can view their debates"
  ON debates
  FOR SELECT
  USING (creator_id = current_setting('app.current_user_id', true) OR opponent_id = current_setting('app.current_user_id', true));

-- سياسة للإنشاء - يمكن للمستخدمين المسجلين إنشاء مناظرات
CREATE POLICY "Authenticated users can create debates"
  ON debates
  FOR INSERT
  WITH CHECK (creator_id = current_setting('app.current_user_id', true));

-- سياسة للتحديث - يمكن للمشاركين تحديث مناظراتهم
CREATE POLICY "Participants can update their debates"
  ON debates
  FOR UPDATE
  USING (creator_id = current_setting('app.current_user_id', true) OR opponent_id = current_setting('app.current_user_id', true));

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_debates_code ON debates(code);
CREATE INDEX IF NOT EXISTS idx_debates_random ON debates(is_random) WHERE is_random = true;
CREATE INDEX IF NOT EXISTS idx_debates_public ON debates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_debates_status ON debates(status);