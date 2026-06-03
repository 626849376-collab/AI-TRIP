-- ============================================
-- AI Mini Travel Planner - Supabase Schema
-- ============================================

-- 1. user_profiles 表 - 用户资料
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. trip_plans 表 - 旅行计划
CREATE TABLE IF NOT EXISTS trip_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget NUMERIC(10, 2) DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    share_code TEXT UNIQUE,
    likes_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. trip_details 表 - 旅行每日详情
CREATE TABLE IF NOT EXISTS trip_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trip_plans(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. trip_likes 表 - 点赞记录
CREATE TABLE IF NOT EXISTS trip_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trip_plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trip_id, user_id)
);

-- 5. trip_favorites 表 - 收藏记录
CREATE TABLE IF NOT EXISTS trip_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trip_plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trip_id, user_id)
);

-- ============================================
-- 索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_trip_plans_user_id ON trip_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_plans_is_deleted ON trip_plans(is_deleted);
CREATE INDEX IF NOT EXISTS idx_trip_plans_is_public ON trip_plans(is_public);
CREATE INDEX IF NOT EXISTS idx_trip_plans_share_code ON trip_plans(share_code);
CREATE INDEX IF NOT EXISTS idx_trip_plans_created_at ON trip_plans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trip_details_trip_id ON trip_details(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_details_day_number ON trip_details(day_number);
CREATE INDEX IF NOT EXISTS idx_trip_likes_trip_id ON trip_likes(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_likes_user_id ON trip_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_favorites_trip_id ON trip_favorites(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_favorites_user_id ON trip_favorites(user_id);

-- ============================================
-- 行级安全策略 (RLS)
-- ============================================

-- 启用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_favorites ENABLE ROW LEVEL SECURITY;

-- user_profiles 策略
CREATE POLICY "用户可查看自己的资料"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "用户可插入自己的资料"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "用户可更新自己的资料"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- trip_plans 策略
CREATE POLICY "用户可查看自己的旅行计划"
    ON trip_plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "用户可查看公开的旅行计划"
    ON trip_plans FOR SELECT
    USING (is_public = TRUE AND is_deleted = FALSE);

CREATE POLICY "用户可创建自己的旅行计划"
    ON trip_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可更新自己的旅行计划"
    ON trip_plans FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "用户可删除自己的旅行计划"
    ON trip_plans FOR DELETE
    USING (auth.uid() = user_id);

-- trip_details 策略
CREATE POLICY "用户可查看自己旅行计划的详情"
    ON trip_details FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM trip_plans
            WHERE trip_plans.id = trip_details.trip_id
            AND (trip_plans.user_id = auth.uid() OR trip_plans.is_public = TRUE)
        )
    );

CREATE POLICY "用户可创建自己旅行计划的详情"
    ON trip_details FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM trip_plans
            WHERE trip_plans.id = trip_details.trip_id
            AND trip_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "用户可更新自己旅行计划的详情"
    ON trip_details FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM trip_plans
            WHERE trip_plans.id = trip_details.trip_id
            AND trip_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "用户可删除自己旅行计划的详情"
    ON trip_details FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM trip_plans
            WHERE trip_plans.id = trip_details.trip_id
            AND trip_plans.user_id = auth.uid()
        )
    );

-- trip_likes 策略
CREATE POLICY "所有人可查看点赞"
    ON trip_likes FOR SELECT
    USING (TRUE);

CREATE POLICY "用户可点赞"
    ON trip_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可取消点赞"
    ON trip_likes FOR DELETE
    USING (auth.uid() = user_id);

-- trip_favorites 策略
CREATE POLICY "所有人可查看收藏"
    ON trip_favorites FOR SELECT
    USING (TRUE);

CREATE POLICY "用户可收藏"
    ON trip_favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可取消收藏"
    ON trip_favorites FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 触发器：自动更新 updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trip_plans_updated_at
    BEFORE UPDATE ON trip_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 触发器：自动更新点赞/收藏计数
-- ============================================
CREATE OR REPLACE FUNCTION update_trip_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE trip_plans SET likes_count = likes_count + 1 WHERE id = NEW.trip_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE trip_plans SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.trip_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_trip_likes_count
    AFTER INSERT OR DELETE ON trip_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_trip_likes_count();

CREATE OR REPLACE FUNCTION update_trip_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE trip_plans SET favorites_count = favorites_count + 1 WHERE id = NEW.trip_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE trip_plans SET favorites_count = GREATEST(favorites_count - 1, 0) WHERE id = OLD.trip_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_trip_favorites_count
    AFTER INSERT OR DELETE ON trip_favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_trip_favorites_count();