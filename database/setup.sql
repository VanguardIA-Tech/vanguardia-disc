-- VANGUARDIA DISC - Setup do banco de dados
-- Execute no SQL Editor do Supabase (schema: disc_vanguardia)

-- ============================================================
-- SCHEMA
-- ============================================================
CREATE SCHEMA IF NOT EXISTS disc_vanguardia;

-- ============================================================
-- TABELA: projects
-- ============================================================
CREATE TABLE IF NOT EXISTS disc_vanguardia.projects (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- ============================================================
-- TABELA: disc_assessments
-- ============================================================
CREATE TABLE IF NOT EXISTS disc_vanguardia.disc_assessments (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    project_id BIGINT REFERENCES disc_vanguardia.projects(id),
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
CREATE INDEX IF NOT EXISTS idx_disc_email      ON disc_vanguardia.disc_assessments(candidate_email);
CREATE INDEX IF NOT EXISTS idx_disc_created    ON disc_vanguardia.disc_assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disc_profile    ON disc_vanguardia.disc_assessments(dominant_profile);
CREATE INDEX IF NOT EXISTS idx_disc_project    ON disc_vanguardia.disc_assessments(project_id);

-- ============================================================
-- RLS: projects
-- ============================================================
ALTER TABLE disc_vanguardia.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proj_anon_select" ON disc_vanguardia.projects FOR SELECT TO anon USING (true);
CREATE POLICY "proj_anon_insert" ON disc_vanguardia.projects FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "proj_anon_update" ON disc_vanguardia.projects FOR UPDATE TO anon USING (true);
CREATE POLICY "proj_anon_delete" ON disc_vanguardia.projects FOR DELETE TO anon USING (true);

-- ============================================================
-- RLS: disc_assessments
-- ============================================================
ALTER TABLE disc_vanguardia.disc_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert"     ON disc_vanguardia.disc_assessments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_all" ON disc_vanguardia.disc_assessments FOR SELECT TO anon USING (true);
CREATE POLICY "anon_delete"     ON disc_vanguardia.disc_assessments FOR DELETE TO anon USING (true);

-- ============================================================
-- PROJETO PADRÃO
-- ============================================================
INSERT INTO disc_vanguardia.projects (name, description)
VALUES ('DISC - Vanguardia', 'Projeto padrão de avaliações DISC')
ON CONFLICT DO NOTHING;

-- ============================================================
-- MIGRAÇÃO: adicionar project_id se tabela já existia
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'disc_vanguardia'
          AND table_name   = 'disc_assessments'
          AND column_name  = 'project_id'
    ) THEN
        ALTER TABLE disc_vanguardia.disc_assessments
            ADD COLUMN project_id BIGINT REFERENCES disc_vanguardia.projects(id);
        CREATE INDEX idx_disc_project ON disc_vanguardia.disc_assessments(project_id);
    END IF;
END
$$;

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'disc_vanguardia'
ORDER BY table_name;
