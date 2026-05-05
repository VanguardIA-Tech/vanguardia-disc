# CLAUDE.md - Vanguardia DISC

Guia para assistentes de IA trabalhando neste repositório.

## Visão Geral do Projeto

Sistema de avaliação comportamental DISC (Dominância, Influência, Estabilidade, Conformidade) para análise de perfil de novos colaboradores da Vanguardia. Aplicação single-page (SPA) em vanilla HTML/CSS/JavaScript com persistência via Supabase (PostgreSQL).

**URLs de acesso:**
- Produção (Vercel): https://vanguardia-disc.vercel.app
- Domínio customizado: https://disc.vanguardiagrupo.com.br
- Repositório: https://github.com/VanguardIA-Tech/vanguardia-disc

## Estrutura de Arquivos

```
vanguardia-disc/
├── index.html      # Página única com todas as seções (home, avaliação, resultados, admin-login, admin, admin-view)
├── styles.css      # Estilos CSS com variáveis de branding e responsividade
├── app.js          # Lógica principal (~1021 linhas): navegação, formulários, API Supabase, gráficos, admin e projetos
├── questions.js    # 28 perguntas DISC (7 por dimensão) + dados dos 4 perfis comportamentais
├── logo.png        # Logo oficial da Vanguardia
├── database/       # Scripts do banco Supabase/PostgreSQL e MariaDB
├── backend/        # API PHP opcional para deploy Docker/MariaDB
├── Dockerfile      # Imagem PHP/Apache opcional
├── docker-compose.yml
├── vercel.json     # Configuração do deploy estático na Vercel
├── README.md       # Documentação do projeto
└── CLAUDE.md       # Este arquivo
```

**Não há:** package.json, node_modules, build tools, frameworks, TypeScript, testes automatizados, CI/CD, configs de lint.

## Arquitetura e Padrões

### Stack Tecnológica
| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML5 + CSS3 + Vanilla JS (sem frameworks) |
| Gráficos | Chart.js (CDN) |
| Exportação | SheetJS/XLSX (CDN) |
| Fonte | Google Fonts (Inter) |
| Banco de dados | Supabase (PostgreSQL via REST API) |
| Hospedagem | Vercel (auto-deploy via GitHub push) |
| Autenticação admin | sessionStorage (sessão de 2 horas) |

### Navegação SPA
- Páginas são `<div class="page" data-page="nome">` no index.html
- Navegação via `showPage(pageName)` que alterna classe `active`
- Páginas: `home`, `assessment`, `results`, `admin-login`, `admin`, `admin-view`

### Estado Global (app.js)
```javascript
currentQuestion    // Índice da pergunta atual (0-27)
answers            // Objeto { questionId: selectedOptionIndex }
candidateInfo      // { name, email, phone, position, department }
discChart          // Instância Chart.js (resultados candidato)
adminDiscChart     // Instância Chart.js (resultados admin)
isAdminLoggedIn    // Boolean de autenticação
allResults         // Cache de todas avaliações do Supabase
filteredResults    // Resultados filtrados por data
currentViewingResult // Resultado sendo visualizado no admin
allProjects        // Cache de projetos cadastrados
currentProjectId   // Projeto vindo de ?project=ID
adminFilterProjectId // Filtro de projeto no admin
```

### Comunicação com Supabase
- Wrapper customizado `supabaseRequest(endpoint, options)` usando `fetch()`
- Sem SDK do Supabase — chamadas REST diretas
- Tabela principal: `disc_assessments`
- Operações: INSERT (salvar avaliação), SELECT (listar), DELETE (remover)

### Sistema de Pontuação DISC
- 28 perguntas, 7 por dimensão (D, I, S, C)
- Cada opção distribui pontos (0-4) entre as 4 dimensões
- Scores finais convertidos em percentuais (0-100%)
- Perfil dominante = dimensão com maior pontuação

## Fluxo Principal da Aplicação

1. Candidato preenche formulário (nome, email, telefone, cargo, departamento)
2. Responde 28 perguntas com barra de progresso
3. Sistema calcula scores D/I/S/C em percentual
4. Resultados exibidos com gráfico radar + perfil detalhado
5. Dados salvos automaticamente no Supabase

## Painel Administrativo

- Login com credenciais fixas (hardcoded em app.js)
- Sessão de 2h via sessionStorage
- Funcionalidades: listar avaliações, filtrar por data/projeto, ver detalhes, excluir, exportar CSV/Excel, imprimir, criar/excluir projetos e copiar links únicos

## Convenções de Código

### JavaScript
- **Sem módulos ES6** — tudo no escopo global (window)
- Ordem de carregamento dos scripts: Chart.js → SheetJS → questions.js → app.js
- Funções de utilidade no final do app.js: `formatDateTime()`, `getDateString()`, `escapeHtml()`, `downloadFile()`
- Tratamento de erros via `try/catch` com `console.error()`
- Dados DISC definidos em `questions.js`: array `discQuestions` e objeto `profileData`

### CSS
- Variáveis CSS no `:root` para cores, sombras
- Cores DISC: D=#e74c3c (vermelho), I=#f39c12 (laranja), S=#27ae60 (verde), C=#3498db (azul)
- Cor primária da marca: #1e4b8e
- Breakpoint responsivo: 768px
- Estilos de impressão (`@media print`) incluídos

### HTML
- Idioma: português brasileiro (pt-BR)
- Formulários com validação HTML5 nativa (`required`)
- IDs descritivos em inglês: `candidate-form`, `question-container`, `admin-table-body`

## Banco de Dados — Tabela `disc_assessments`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | bigserial | PK, gerado automaticamente |
| project_id | bigint | FK opcional para `projects(id)` |
| candidate_name | text | Nome do candidato |
| candidate_email | text | Email |
| candidate_phone | text | Telefone (opcional) |
| candidate_position | text | Cargo pretendido (opcional) |
| candidate_department | text | Departamento (opcional) |
| score_d / score_i / score_s / score_c | integer | Pontuação 0-100 por dimensão |
| dominant_profile | text | Perfil predominante (D/I/S/C) |
| answers | jsonb | Respostas detalhadas |
| created_at | timestamp | Data/hora da avaliação |

## Deploy

- **Automático:** Push para `main` no GitHub → Vercel faz deploy
- **Manual:** `vercel --prod`
- Sem build step — arquivos estáticos servidos diretamente

## Avisos Importantes para Desenvolvimento

1. **Credenciais hardcoded:** Supabase URL/key e credenciais admin estão em `app.js` (linhas 1-16) e `README.md`. Tratar com cuidado ao fazer commits.
2. **Sem testes automatizados:** Qualquer alteração deve ser testada manualmente no navegador.
3. **Sem build/lint:** Não há processo de build, linting ou formatação automatizada.
4. **Scripts CDN:** Chart.js e SheetJS são carregados via CDN — sem controle de versão local.
5. **Escopo global:** Todas as funções e variáveis são globais — cuidado com colisões de nomes.
6. **Sem .env:** Não há separação de configuração por ambiente.
7. **Idioma misto:** Código (variáveis, funções) em inglês; textos exibidos ao usuário em português.
