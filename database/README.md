# Configuração do Banco de Dados

## 1. Criar a tabela (OBRIGATÓRIO)

### Opção A: Supabase Dashboard
1. Acesse `http://localhost:8000` → SQL Editor
2. Cole o conteúdo de `setup.sql`
3. Execute

### Opção B: linha de comando (psql)
```bash
psql postgresql://postgres:SUA_SENHA@127.0.0.1:5432/postgres -f setup.sql
```

---

## 2. Manter banco sempre ativo

O Supabase self-hosted **não dorme** por padrão (ao contrário do Supabase cloud).
Mas para garantir que o PostgreSQL nunca pare:

### Verificar se está rodando
```bash
docker ps | grep supabase-db
```

### Keep-alive automático (opcional)
```bash
chmod +x keep_alive.sh

# Adicionar ao cron (pinga a cada 5 min):
crontab -e
# Adicione: */5 * * * * /caminho/para/keep_alive.sh
```

---

## 3. Estrutura da tabela `disc_assessments`

| Campo | Tipo | Descrição |
|---|---|---|
| id | BIGSERIAL | ID único |
| created_at | TIMESTAMPTZ | Data/hora do preenchimento |
| candidate_name | TEXT | Nome do candidato |
| candidate_email | TEXT | Email (indexado) |
| candidate_phone | TEXT | Telefone |
| candidate_position | TEXT | Cargo |
| candidate_department | TEXT | Departamento |
| score_d | INTEGER | Pontuação Dominância |
| score_i | INTEGER | Pontuação Influência |
| score_s | INTEGER | Pontuação Estabilidade |
| score_c | INTEGER | Pontuação Conformidade |
| dominant_profile | CHAR(1) | Perfil dominante (D/I/S/C) |
| answers | JSONB | Respostas completas |

---

## 4. Consultas úteis

```sql
-- Total de avaliações
SELECT COUNT(*) FROM disc_assessments;

-- Por perfil dominante
SELECT dominant_profile, COUNT(*) FROM disc_assessments GROUP BY dominant_profile;

-- Por departamento
SELECT candidate_department, dominant_profile, COUNT(*)
FROM disc_assessments
GROUP BY candidate_department, dominant_profile
ORDER BY candidate_department;

-- Histórico de uma pessoa
SELECT * FROM disc_assessments WHERE candidate_email = 'email@exemplo.com';
```
