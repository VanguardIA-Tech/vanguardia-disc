# Vanguardia DISC - Sistema de Avaliação Comportamental

Sistema de avaliação DISC completo para análise de perfil comportamental de novos colaboradores da Vanguardia.

## URLs de Acesso

| Serviço | URL |
|---------|-----|
| **Site (Vercel)** | https://vanguardia-disc.vercel.app |
| **Domínio personalizado** | https://disc.vanguardiagrupo.com.br |
| **Repositório GitHub** | https://github.com/VanguardIA-Tech/vanguardia-disc |

## Credenciais

### Painel Administrativo
- **URL:** Acessar pelo link "Área Administrativa" no rodapé do site
- **Usuário:** `admin`
- **Senha:** `Vanguardia@2024`

### Supabase (Banco de Dados)
- **Project URL:** `https://alwpwpufxwokruysmlln.supabase.co`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsd3B3cHVmeHdva3J1eXNtbGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjUzMzcsImV4cCI6MjA4NTkwMTMzN30.s0zW6cpjlC0m-s8wJNeVSssgXVMEZFVqc4ekgs-6l5Y`
- **Tabela:** `disc_assessments`

## Estrutura do Projeto

```
vanguardia-disc/
├── index.html      # Estrutura HTML (páginas: home, avaliação, resultados, admin)
├── styles.css      # Estilos CSS com branding Vanguardia
├── app.js          # Lógica principal + integração Supabase (v3.0)
├── questions.js    # 28 perguntas DISC + descrições de perfis
├── logo.png        # Logo oficial da Vanguardia
└── README.md       # Este arquivo
```

## Funcionalidades

### Para Candidatos
- Avaliação DISC com 28 perguntas (7 por dimensão)
- Resultados imediatos com gráfico radar
- Descrição detalhada do perfil comportamental
- Pontos fortes, áreas de melhoria e recomendações

### Para Administradores
- Login protegido
- Visualização de todas as avaliações
- Filtros por período (7 dias, 30 dias, 90 dias, todos)
- Exportação para Excel (.xlsx) e CSV
- Visualização detalhada de cada avaliação
- Exclusão de registros

## Tecnologias

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Banco de Dados:** Supabase (PostgreSQL)
- **Gráficos:** Chart.js
- **Exportação:** SheetJS (xlsx)
- **Hospedagem:** Vercel
- **Controle de Versão:** GitHub

## Deploy

O projeto está configurado para deploy automático no Vercel. Para fazer alterações:

1. Clone o repositório:
```bash
git clone https://github.com/VanguardIA-Tech/vanguardia-disc.git
```

2. Faça as alterações necessárias

3. Commit e push:
```bash
git add .
git commit -m "Descrição da alteração"
git push
```

4. O Vercel fará o deploy automaticamente (ou use `vercel --prod`)

## Estrutura do Banco de Dados

Tabela `disc_assessments`:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único |
| candidate_name | text | Nome do candidato |
| candidate_email | text | Email do candidato |
| candidate_position | text | Cargo pretendido |
| d_score | integer | Pontuação Dominância (0-100) |
| i_score | integer | Pontuação Influência (0-100) |
| s_score | integer | Pontuação Estabilidade (0-100) |
| c_score | integer | Pontuação Conformidade (0-100) |
| primary_profile | text | Perfil predominante |
| answers | jsonb | Respostas detalhadas |
| created_at | timestamp | Data/hora da avaliação |

## Metodologia DISC

- **D (Dominância):** Foco em resultados, decisões rápidas, desafios
- **I (Influência):** Foco em pessoas, comunicação, entusiasmo
- **S (Estabilidade):** Foco em cooperação, paciência, consistência
- **C (Conformidade):** Foco em qualidade, precisão, análise

## Suporte

Para dúvidas ou alterações, entre em contato com a equipe de TI da Vanguardia.
