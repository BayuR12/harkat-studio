-- PostgreSQL Schema for Harkat Music AI Studio

-- ENUMS
CREATE TYPE user_role AS ENUM ('guest', 'free_user', 'pro_user', 'creator', 'instructor', 'moderator', 'administrator');
CREATE TYPE subscription_plan AS ENUM ('free', 'creator', 'studio', 'institution');
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE generation_type AS ENUM ('music', 'lyrics', 'soundtrack', 'stem_separation');

-- USERS & PROFILES (Extending Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    role user_role DEFAULT 'free_user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUBSCRIPTIONS & PLANS
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    plan subscription_plan DEFAULT 'free',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    status VARCHAR(50),
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CREDIT SYSTEM
CREATE TABLE credit_wallets (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- positive for topup, negative for usage
    description TEXT,
    reference_type VARCHAR(100), -- e.g., 'generation_job', 'purchase'
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI GENERATION JOBS
CREATE TABLE generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    job_type generation_type NOT NULL,
    provider VARCHAR(100) DEFAULT 'demo_provider',
    model VARCHAR(100),
    parameters JSONB NOT NULL,
    status job_status DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    result_data JSONB, -- store urls, text, etc upon completion
    error_message TEXT,
    cost_credits INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MUSIC LIBRARY: SONGS
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    cover_url TEXT,
    audio_url TEXT NOT NULL,
    waveform_data JSONB,
    genre VARCHAR(100),
    mood VARCHAR(100),
    bpm INTEGER,
    musical_key VARCHAR(10),
    duration_seconds INTEGER,
    prompt_used TEXT,
    is_public BOOLEAN DEFAULT false,
    allow_remix BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MUSIC LIBRARY: LYRICS
CREATE TABLE lyrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    synchronized_data JSONB, -- for karaoke timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lyrics ENABLE ROW LEVEL SECURITY;

-- Note: Policies will be refined in later stages. For now, public read, auth write.
