-- ============================================================
-- VANGUARDIA DISC - Schema MariaDB
-- Execute no MariaDB da VPS
-- ============================================================

CREATE DATABASE IF NOT EXISTS disc_vanguardia
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE disc_vanguardia;

-- ─── USUÁRIO DA APLICAÇÃO ────────────────────────────────────
-- Ajuste a senha antes de executar
CREATE USER IF NOT EXISTS 'disc_user'@'%' IDENTIFIED BY 'DiscVanguardia@2024';
GRANT ALL PRIVILEGES ON disc_vanguardia.* TO 'disc_user'@'%';
FLUSH PRIVILEGES;

-- ─── TABELA: projects ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    is_active   TINYINT(1) DEFAULT 1 NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── TABELA: disc_assessments ────────────────────────────────
CREATE TABLE IF NOT EXISTS disc_assessments (
    id                   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at           DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    project_id           BIGINT UNSIGNED,
    candidate_name       VARCHAR(255) NOT NULL,
    candidate_email      VARCHAR(255) NOT NULL,
    candidate_phone      VARCHAR(50),
    candidate_position   VARCHAR(255),
    candidate_department VARCHAR(255),
    score_d              SMALLINT NOT NULL DEFAULT 0,
    score_i              SMALLINT NOT NULL DEFAULT 0,
    score_s              SMALLINT NOT NULL DEFAULT 0,
    score_c              SMALLINT NOT NULL DEFAULT 0,
    dominant_profile     CHAR(1) NOT NULL,
    answers              JSON,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── ÍNDICES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_email   ON disc_assessments(candidate_email);
CREATE INDEX IF NOT EXISTS idx_created ON disc_assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile ON disc_assessments(dominant_profile);
CREATE INDEX IF NOT EXISTS idx_project ON disc_assessments(project_id);

-- ─── PROJETO PADRÃO ──────────────────────────────────────────
INSERT IGNORE INTO projects (id, name, description)
VALUES (1, 'DISC - Vanguardia', 'Projeto padrão de avaliações DISC');

-- ─── VERIFICAÇÃO ─────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'disc_vanguardia'
ORDER BY table_name;
