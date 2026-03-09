-- VANGUARDIA DISC - Criação do banco de dados
-- Execute este script no Supabase SQL Editor
-- ou via psql: psql postgresql://postgres:SENHA@127.0.0.1:5432/postgres -f setup.sql

-- ============================================================
-- TABELA PRINCIPAL: disc_assessments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.disc_assessments (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Dados do candidato
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    candidate_phone TEXT,
    candidate_position TEXT,
    candidate_department TEXT,

    -- Pontuações DISC
    score_d INTEGER NOT NULL DEFAULT 0,
    score_i INTEGER NOT NULL DEFAULT 0,
    score_s INTEGER NOT NULL DEFAULT 0,
    score_c INTEGER NOT NULL DEFAULT 0,

    -- Perfil dominante (D, I, S ou C)
    dominant_profile CHAR(1) NOT NULL,

    -- Respostas completas em JSON
    answers JSONB
);

-- ============================================================
-- ÍNDICES para performance em consultas
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_disc_email ON public.disc_assessments(candidate_email);
CREATE INDEX IF NOT EXISTS idx_disc_created ON public.disc_assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disc_profile ON public.disc_assessments(dominant_profile);
CREATE INDEX IF NOT EXISTS idx_disc_department ON public.disc_assessments(candidate_department);

-- ============================================================
-- PERMISSÕES: liberar acesso para anon key (leitura e escrita)
-- ============================================================
ALTER TABLE public.disc_assessments ENABLE ROW LEVEL SECURITY;

-- Permite anon inserir (candidato preenche o formulário)
CREATE POLICY "anon_insert" ON public.disc_assessments
    FOR INSERT TO anon WITH CHECK (true);

-- Permite anon ler apenas seus próprios registros por email (opcional)
-- Para simplificar: permite leitura total via service_role (admin)
CREATE POLICY "service_select_all" ON public.disc_assessments
    FOR SELECT TO service_role USING (true);

CREATE POLICY "service_delete" ON public.disc_assessments
    FOR DELETE TO service_role USING (true);

-- Para o painel admin funcionar com anon key, libere leitura:
CREATE POLICY "anon_select_all" ON public.disc_assessments
    FOR SELECT TO anon USING (true);

CREATE POLICY "anon_delete" ON public.disc_assessments
    FOR DELETE TO anon USING (true);

-- ============================================================
-- VERIFICAÇÃO: listar tabelas criadas
-- ============================================================
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'disc_assessments'
ORDER BY ordinal_position;
