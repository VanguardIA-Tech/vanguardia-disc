-- VANGUARDIA DISC - Setup do banco de dados
-- Execute no SQL Editor do Supabase (VPS: 177.104.185.61:8000)
-- Dashboard: http://177.104.185.61:8000 | user: supabase | pass: V@nguardia2026

-- ============================================================
-- TABELA: projects
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- ============================================================
-- TABELA: disc_assessments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.disc_assessments (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    project_id BIGINT REFERENCES public.projects(id),
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    candidate_phone TEXT,
    candidate_position TEXT,
    candidate_department TEXT,
    score_d INTEGER NOT NULL DEFAULT 0,
    score_i INTEGER NOT NULL DEFAULT 0,
    score_s INTEGER NOT NULL DEFAULT 0,
    score_c INTEGER NOT NULL DEFAULT 0,
    dominant_profile CHAR(1) NOT NULL,
    answers JSONB
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_disc_email   ON public.disc_assessments(candidate_email);
CREATE INDEX IF NOT EXISTS idx_disc_created ON public.disc_assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disc_profile ON public.disc_assessments(dominant_profile);
CREATE INDEX IF NOT EXISTS idx_disc_project ON public.disc_assessments(project_id);

-- ============================================================
-- RLS: projects
-- ============================================================
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proj_anon_select" ON public.projects FOR SELECT TO anon USING (true);
CREATE POLICY "proj_anon_insert" ON public.projects FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "proj_anon_update" ON public.projects FOR UPDATE TO anon USING (true);
CREATE POLICY "proj_anon_delete" ON public.projects FOR DELETE TO anon USING (true);

-- ============================================================
-- RLS: disc_assessments
-- ============================================================
ALTER TABLE public.disc_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert"     ON public.disc_assessments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_all" ON public.disc_assessments FOR SELECT TO anon USING (true);
CREATE POLICY "anon_delete"     ON public.disc_assessments FOR DELETE TO anon USING (true);

-- ============================================================
-- MIGRAÇÃO: adicionar project_id se tabela já existia
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'disc_assessments'
          AND column_name  = 'project_id'
    ) THEN
        ALTER TABLE public.disc_assessments
            ADD COLUMN project_id BIGINT REFERENCES public.projects(id);
    END IF;
END
$$;

-- ============================================================
-- PROJETO PADRÃO
-- ============================================================
INSERT INTO public.projects (name, description)
VALUES ('DISC - Vanguardia', 'Projeto padrão de avaliações DISC')
ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('projects', 'disc_assessments')
ORDER BY table_name;
