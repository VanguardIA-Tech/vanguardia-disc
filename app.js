// DISC Assessment Application for Vanguardia
// Version 5.0 - PHP Backend + MariaDB + JWT Auth

// ==========================================
// API CONFIGURATION
// ==========================================
const API_BASE = '/api';

// ==========================================
// STATE MANAGEMENT
// ==========================================
let currentQuestion = 0;
let answers = {};
let candidateInfo = {};
let discChart = null;
let adminDiscChart = null;
let isAdminLoggedIn = false;
let currentViewingResult = null;
let filteredResults = null;
let allResults = [];
let allProjects = [];
let currentProjectId = null;   // set from URL param ?project=ID
let adminFilterProjectId = null;

// ==========================================
// URL PARAM: read project on load
// ==========================================
function readProjectFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('project');
    if (pid) {
        currentProjectId = parseInt(pid, 10);
    }
}

// ==========================================
// API FUNCTIONS (PHP Backend + MariaDB)
// ==========================================
function getAdminToken() {
    return sessionStorage.getItem('adminToken') || null;
}

async function apiRequest(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const headers = { 'Content-Type': 'application/json' };
    const token = getAdminToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `Erro ${response.status}`);
        }
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
}

async function saveToSupabase(result) {
    return await apiRequest('/assessments', {
        method: 'POST',
        body: JSON.stringify({
            project_id:           currentProjectId || null,
            candidate_name:       result.candidate.name,
            candidate_email:      result.candidate.email,
            candidate_phone:      result.candidate.phone || null,
            candidate_position:   result.candidate.position || null,
            candidate_department: result.candidate.department || null,
            score_d:              result.scores.D,
            score_i:              result.scores.I,
            score_s:              result.scores.S,
            score_c:              result.scores.C,
            dominant_profile:     result.dominantProfile,
            answers:              result.answers
        })
    });
}

async function fetchFromSupabase(projectId = null) {
    let path = '/assessments';
    if (projectId) path += `?project_id=${projectId}`;
    return await apiRequest(path);
}

async function deleteFromSupabase(id) {
    return await apiRequest(`/assessments/${id}`, { method: 'DELETE' });
}

async function deleteAllFromSupabase(projectId = null) {
    const path = projectId ? `/assessments?project_id=${projectId}` : '/assessments?all=1';
    return await apiRequest(path, { method: 'DELETE' });
}

// ==========================================
// PROJECTS API FUNCTIONS
// ==========================================
async function fetchProjects() {
    return await apiRequest('/projects');
}

async function createProject(name, description) {
    return await apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify({ name, description: description || null })
    });
}

async function deleteProject(id) {
    return await apiRequest(`/projects/${id}`, { method: 'DELETE' });
}

// ==========================================
// DATA FORMAT CONVERSION
// ==========================================
function convertSupabaseToAppFormat(record) {
    return {
        id: record.id,
        date: record.created_at,
        projectId: record.project_id,
        projectName: record.project_name || null,
        candidate: {
            name: record.candidate_name,
            email: record.candidate_email,
            phone: record.candidate_phone || '',
            position: record.candidate_position || '',
            department: record.candidate_department || ''
        },
        scores: {
            D: record.score_d,
            I: record.score_i,
            S: record.score_s,
            C: record.score_c
        },
        dominantProfile: record.dominant_profile,
        answers: record.answers || {}
    };
}

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    readProjectFromUrl();
    initNavigation();
    initCandidateForm();
    initAdminLogin();
    checkAdminSession();
});

// ==========================================
// NAVIGATION
// ==========================================
function initNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            showPage(page);
        });
    });
}

function showPage(pageName) {
    if (pageName === 'admin' && !isAdminLoggedIn) {
        pageName = 'admin-login';
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });

    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    if (pageName === 'admin' && isAdminLoggedIn) {
        loadAdminData();
    }
}

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================
function initAdminLogin() {
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();

    const username = document.getElementById('adminUser').value;
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('loginError');

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) throw new Error('Credenciais inválidas');

        const { token } = await res.json();
        isAdminLoggedIn = true;
        sessionStorage.setItem('adminToken', token);
        sessionStorage.setItem('adminLoginTime', Date.now().toString());
        errorDiv.classList.add('hidden');
        showPage('admin');
    } catch {
        errorDiv.classList.remove('hidden');
    }
}

function checkAdminSession() {
    const token = sessionStorage.getItem('adminToken');
    const loginTime = sessionStorage.getItem('adminLoginTime');

    if (token && loginTime) {
        const elapsed = Date.now() - parseInt(loginTime);
        const twoHours = 2 * 60 * 60 * 1000;

        if (elapsed < twoHours) {
            isAdminLoggedIn = true;
        } else {
            adminLogout();
        }
    }
}

function adminLogout() {
    isAdminLoggedIn = false;
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminLoginTime');
    document.getElementById('adminLoginForm').reset();
    showPage('home');
}

// ==========================================
// CANDIDATE FORM
// ==========================================
function initCandidateForm() {
    const form = document.getElementById('candidateInfoForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            candidateInfo = {
                name: document.getElementById('candidateName').value,
                email: document.getElementById('candidateEmail').value,
                phone: document.getElementById('candidatePhone').value || '',
                position: document.getElementById('candidatePosition').value || '',
                department: document.getElementById('candidateDepartment').value || ''
            };

            document.getElementById('candidate-form').classList.add('hidden');
            document.getElementById('questions-section').classList.remove('hidden');

            currentQuestion = 0;
            answers = {};
            renderQuestion();
        });
    }
}

// ==========================================
// QUESTIONS
// ==========================================
function renderQuestion() {
    const question = discQuestions[currentQuestion];
    const container = document.getElementById('question-container');

    const progress = ((currentQuestion + 1) / discQuestions.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `Pergunta ${currentQuestion + 1} de ${discQuestions.length}`;

    container.innerHTML = `
        <p class="question-text">${question.text}</p>
        <div class="options-container">
            ${question.options.map((option, index) => `
                <label class="option-label">
                    <input type="radio"
                           name="question-${question.id}"
                           value="${index}"
                           ${answers[question.id] === index ? 'checked' : ''}
                           onchange="selectAnswer(${question.id}, ${index})">
                    <span class="option-indicator"></span>
                    <span class="option-text">${option.text}</span>
                </label>
            `).join('')}
        </div>
    `;

    document.getElementById('prevBtn').disabled = currentQuestion === 0;

    const nextBtn = document.getElementById('nextBtn');
    if (currentQuestion === discQuestions.length - 1) {
        nextBtn.textContent = 'Finalizar ✓';
    } else {
        nextBtn.textContent = 'Próxima →';
    }
}

function selectAnswer(questionId, optionIndex) {
    answers[questionId] = optionIndex;
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion();
    }
}

function nextQuestion() {
    const question = discQuestions[currentQuestion];

    if (answers[question.id] === undefined) {
        alert('Por favor, selecione uma opção antes de continuar.');
        return;
    }

    if (currentQuestion < discQuestions.length - 1) {
        currentQuestion++;
        renderQuestion();
    } else {
        finishAssessment();
    }
}

// ==========================================
// FINISH AND CALCULATE RESULTS
// ==========================================
async function finishAssessment() {
    const scores = calculateScores();
    const result = {
        id: Date.now(),
        date: new Date().toISOString(),
        candidate: candidateInfo,
        scores: scores,
        dominantProfile: getDominantProfile(scores),
        answers: { ...answers }
    };

    const nextBtn = document.getElementById('nextBtn');
    nextBtn.disabled = true;
    nextBtn.textContent = 'Salvando...';

    try {
        await saveToSupabase(result);
        console.log('Resultado salvo no Supabase com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar no Supabase:', error);
    }

    showCandidateResults(result);
    showPage('results');
    resetAssessmentForm();
}

function calculateScores() {
    let totals = { D: 0, I: 0, S: 0, C: 0 };

    discQuestions.forEach(question => {
        if (answers[question.id] !== undefined) {
            const selectedOption = question.options[answers[question.id]];
            totals.D += selectedOption.score.D;
            totals.I += selectedOption.score.I;
            totals.S += selectedOption.score.S;
            totals.C += selectedOption.score.C;
        }
    });

    const total = totals.D + totals.I + totals.S + totals.C;
    return {
        D: Math.round((totals.D / total) * 100),
        I: Math.round((totals.I / total) * 100),
        S: Math.round((totals.S / total) * 100),
        C: Math.round((totals.C / total) * 100)
    };
}

function getDominantProfile(scores) {
    let max = 0;
    let dominant = 'D';

    Object.entries(scores).forEach(([profile, score]) => {
        if (score > max) {
            max = score;
            dominant = profile;
        }
    });

    return dominant;
}

// ==========================================
// STORAGE
// ==========================================
async function getAllResults() {
    try {
        const data = await fetchFromSupabase(adminFilterProjectId);
        allResults = data.map(convertSupabaseToAppFormat);
        return allResults;
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        return [];
    }
}

async function deleteResultById(id) {
    try {
        await deleteFromSupabase(id);
        allResults = allResults.filter(r => r.id !== id);
    } catch (error) {
        console.error('Erro ao excluir:', error);
        throw error;
    }
}

// ==========================================
// CANDIDATE RESULTS DISPLAY
// ==========================================
function showCandidateResults(result) {
    document.getElementById('no-results').classList.add('hidden');
    document.getElementById('results-content').classList.remove('hidden');

    document.getElementById('resultCandidateName').textContent = result.candidate.name;
    document.getElementById('resultDate').textContent = `Avaliação realizada em: ${formatDateTime(result.date)}`;

    document.getElementById('scoreD').textContent = `${result.scores.D}%`;
    document.getElementById('scoreI').textContent = `${result.scores.I}%`;
    document.getElementById('scoreS').textContent = `${result.scores.S}%`;
    document.getElementById('scoreC').textContent = `${result.scores.C}%`;

    const profile = profileData[result.dominantProfile];
    document.getElementById('dominantProfile').textContent = profile.name;
    document.getElementById('profileDescription').textContent = profile.description;

    document.getElementById('strengths').innerHTML = profile.strengths.map(s => `<li>${s}</li>`).join('');
    document.getElementById('improvements').innerHTML = profile.improvements.map(i => `<li>${i}</li>`).join('');
    document.getElementById('recommendations').textContent = profile.recommendations;

    renderChart('discChart', result.scores, 'discChart');
}

function renderChart(canvasId, scores, chartVar) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    if (chartVar === 'discChart' && discChart) {
        discChart.destroy();
    } else if (chartVar === 'adminDiscChart' && adminDiscChart) {
        adminDiscChart.destroy();
    }

    const newChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Dominância (D)', 'Influência (I)', 'Estabilidade (S)', 'Conformidade (C)'],
            datasets: [{
                label: 'Perfil DISC',
                data: [scores.D, scores.I, scores.S, scores.C],
                backgroundColor: 'rgba(30, 75, 142, 0.2)',
                borderColor: '#1e4b8e',
                borderWidth: 2,
                pointBackgroundColor: ['#e74c3c', '#f39c12', '#27ae60', '#3498db'],
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: ['#e74c3c', '#f39c12', '#27ae60', '#3498db'],
                pointRadius: 6
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { stepSize: 20 }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    if (chartVar === 'discChart') {
        discChart = newChart;
    } else {
        adminDiscChart = newChart;
    }
}

// ==========================================
// RESET
// ==========================================
function resetAssessmentForm() {
    currentQuestion = 0;
    answers = {};
    candidateInfo = {};

    document.getElementById('candidateInfoForm').reset();
    document.getElementById('candidate-form').classList.remove('hidden');
    document.getElementById('questions-section').classList.add('hidden');

    const nextBtn = document.getElementById('nextBtn');
    nextBtn.disabled = false;
    nextBtn.textContent = 'Próxima →';
}

// ==========================================
// ADMIN FUNCTIONS
// ==========================================
async function loadAdminData() {
    document.getElementById('totalAssessments').textContent = '...';

    try {
        await loadProjectsFilter();

        const results = filteredResults || await getAllResults();

        document.getElementById('totalAssessments').textContent = results.length;

        if (results.length > 0) {
            const avgScores = calculateAverages(results);
            document.getElementById('avgD').textContent = `${avgScores.D}%`;
            document.getElementById('avgI').textContent = `${avgScores.I}%`;
            document.getElementById('avgS').textContent = `${avgScores.S}%`;
            document.getElementById('avgC').textContent = `${avgScores.C}%`;

            document.getElementById('noDataMessage').classList.add('hidden');

            const tbody = document.getElementById('assessmentsTable');
            tbody.innerHTML = results.map(result => `
                <tr>
                    <td>${formatDateTime(result.date)}</td>
                    <td><span class="project-badge">${escapeHtml(result.projectName || '—')}</span></td>
                    <td>${escapeHtml(result.candidate.name)}</td>
                    <td>${escapeHtml(result.candidate.email)}</td>
                    <td>${escapeHtml(result.candidate.phone || '-')}</td>
                    <td>${escapeHtml(result.candidate.position || '-')}</td>
                    <td>${escapeHtml(result.candidate.department || '-')}</td>
                    <td>${result.scores.D}%</td>
                    <td>${result.scores.I}%</td>
                    <td>${result.scores.S}%</td>
                    <td>${result.scores.C}%</td>
                    <td>${profileData[result.dominantProfile].name}</td>
                    <td>
                        <button class="btn btn-secondary btn-small" onclick="viewResult(${result.id})">Ver</button>
                    </td>
                </tr>
            `).join('');
        } else {
            document.getElementById('avgD').textContent = '0%';
            document.getElementById('avgI').textContent = '0%';
            document.getElementById('avgS').textContent = '0%';
            document.getElementById('avgC').textContent = '0%';
            document.getElementById('assessmentsTable').innerHTML = '';
            document.getElementById('noDataMessage').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        document.getElementById('totalAssessments').textContent = 'Erro';
        document.getElementById('noDataMessage').classList.remove('hidden');
        document.getElementById('noDataMessage').textContent = 'Erro ao carregar dados. Tente novamente.';
    }
}

// ==========================================
// PROJECT MANAGEMENT
// ==========================================
async function loadProjectsFilter() {
    try {
        allProjects = await fetchProjects();
        renderProjectsFilter();
        renderProjectsManager();
    } catch (e) {
        console.error('Erro ao carregar projetos:', e);
    }
}

function renderProjectsFilter() {
    const sel = document.getElementById('filterProject');
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = '<option value="">Todos os projetos</option>' +
        allProjects.map(p => `<option value="${p.id}" ${String(p.id) === current ? 'selected' : ''}>${escapeHtml(p.name)}</option>`).join('');
}

function renderProjectsManager() {
    const container = document.getElementById('projectsList');
    if (!container) return;

    if (allProjects.length === 0) {
        container.innerHTML = '<p class="no-data-message">Nenhum projeto criado ainda.</p>';
        return;
    }

    const baseUrl = window.location.origin + window.location.pathname;
    container.innerHTML = allProjects.map(p => `
        <div class="project-item">
            <div class="project-item-info">
                <strong>${escapeHtml(p.name)}</strong>
                ${p.description ? `<span class="project-desc">${escapeHtml(p.description)}</span>` : ''}
                <span class="project-link-text">${baseUrl}?project=${p.id}</span>
            </div>
            <div class="project-item-actions">
                <button class="btn btn-secondary btn-small" onclick="copyProjectLink(${p.id})">Copiar Link</button>
                <button class="btn btn-danger btn-small" onclick="removeProject(${p.id})">Excluir</button>
            </div>
        </div>
    `).join('');
}

function copyProjectLink(projectId) {
    const baseUrl = window.location.origin + window.location.pathname;
    const link = `${baseUrl}?project=${projectId}`;
    navigator.clipboard.writeText(link).then(() => {
        alert('Link copiado:\n' + link);
    }).catch(() => {
        prompt('Copie o link abaixo:', link);
    });
}

async function handleCreateProject(e) {
    e.preventDefault();
    const name = document.getElementById('newProjectName').value.trim();
    const desc = document.getElementById('newProjectDesc').value.trim();
    if (!name) return;

    try {
        await createProject(name, desc);
        document.getElementById('newProjectName').value = '';
        document.getElementById('newProjectDesc').value = '';
        await loadProjectsFilter();
    } catch (err) {
        alert('Erro ao criar projeto: ' + err.message);
    }
}

async function removeProject(id) {
    if (!confirm('Excluir este projeto? As avaliações vinculadas NÃO serão apagadas.')) return;
    try {
        await deleteProject(id);
        await loadProjectsFilter();
    } catch (err) {
        alert('Erro ao excluir projeto: ' + err.message);
    }
}

function calculateAverages(results) {
    if (results.length === 0) return { D: 0, I: 0, S: 0, C: 0 };

    const totals = { D: 0, I: 0, S: 0, C: 0 };

    results.forEach(r => {
        totals.D += r.scores.D;
        totals.I += r.scores.I;
        totals.S += r.scores.S;
        totals.C += r.scores.C;
    });

    return {
        D: Math.round(totals.D / results.length),
        I: Math.round(totals.I / results.length),
        S: Math.round(totals.S / results.length),
        C: Math.round(totals.C / results.length)
    };
}

function viewResult(id) {
    const result = allResults.find(r => r.id === id);

    if (result) {
        currentViewingResult = result;
        showAdminResultView(result);
        showPage('admin-view');
    }
}

function showAdminResultView(result) {
    document.getElementById('adminResultCandidateName').textContent = result.candidate.name;
    document.getElementById('adminResultEmail').textContent = result.candidate.email;
    document.getElementById('adminResultDate').textContent = `Avaliação: ${formatDateTime(result.date)}`;

    document.getElementById('adminScoreD').textContent = `${result.scores.D}%`;
    document.getElementById('adminScoreI').textContent = `${result.scores.I}%`;
    document.getElementById('adminScoreS').textContent = `${result.scores.S}%`;
    document.getElementById('adminScoreC').textContent = `${result.scores.C}%`;

    const profile = profileData[result.dominantProfile];
    document.getElementById('adminDominantProfile').textContent = profile.name;
    document.getElementById('adminProfileDescription').textContent = profile.description;

    document.getElementById('adminStrengths').innerHTML = profile.strengths.map(s => `<li>${s}</li>`).join('');
    document.getElementById('adminImprovements').innerHTML = profile.improvements.map(i => `<li>${i}</li>`).join('');
    document.getElementById('adminRecommendations').textContent = profile.recommendations;

    renderChart('adminDiscChart', result.scores, 'adminDiscChart');
}

async function deleteResult() {
    if (currentViewingResult && confirm('Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.')) {
        try {
            await deleteResultById(currentViewingResult.id);
            currentViewingResult = null;
            filteredResults = null;
            showPage('admin');
        } catch (error) {
            alert('Erro ao excluir a avaliação. Tente novamente.');
        }
    }
}

// ==========================================
// PDF EXPORT
// ==========================================
function printAdminResults() {
    const result = currentViewingResult;
    if (!result) return;

    const profile = profileData[result.dominantProfile];
    const canvas = document.getElementById('adminDiscChart');
    const chartImage = canvas ? canvas.toDataURL('image/png') : null;

    const profileColors = { D: '#e74c3c', I: '#f39c12', S: '#27ae60', C: '#3498db' };
    const profileColor = profileColors[result.dominantProfile] || '#1e4b8e';

    const printWindow = window.open('', '_blank', 'width=900,height=750');
    printWindow.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatório DISC - ${result.candidate.name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; color: #333; background: #fff; }
  .page { max-width: 800px; margin: 0 auto; padding: 32px; }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #1e4b8e; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { color: #1e4b8e; font-size: 22px; }
  .header .date { font-size: 12px; color: #888; text-align: right; }
  .candidate-info { background: #f5f7fa; border-radius: 8px; padding: 16px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .candidate-info h2 { grid-column: 1/-1; font-size: 18px; color: #1e4b8e; margin-bottom: 4px; }
  .info-item { font-size: 13px; } .info-item span { color: #666; }
  .scores-row { display: flex; gap: 12px; margin-bottom: 24px; }
  .score-box { flex: 1; text-align: center; border-radius: 8px; padding: 14px 8px; }
  .score-box.D { background: #fdecea; border: 2px solid #e74c3c; }
  .score-box.I { background: #fef9ec; border: 2px solid #f39c12; }
  .score-box.S { background: #eafaf1; border: 2px solid #27ae60; }
  .score-box.C { background: #eaf4fb; border: 2px solid #3498db; }
  .score-letter { font-size: 24px; font-weight: 700; }
  .score-box.D .score-letter { color: #e74c3c; }
  .score-box.I .score-letter { color: #f39c12; }
  .score-box.S .score-letter { color: #27ae60; }
  .score-box.C .score-letter { color: #3498db; }
  .score-pct { font-size: 20px; font-weight: 600; }
  .score-name { font-size: 11px; color: #666; margin-top: 4px; }
  .chart-section { text-align: center; margin-bottom: 24px; }
  .chart-section img { max-width: 320px; height: auto; }
  .profile-banner { background: ${profileColor}; color: #fff; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; }
  .profile-banner h3 { font-size: 16px; margin-bottom: 4px; opacity: 0.85; }
  .profile-banner p { font-size: 14px; line-height: 1.5; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .section-box h4 { font-size: 13px; font-weight: 700; color: #1e4b8e; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 8px; }
  .section-box ul { padding-left: 18px; font-size: 13px; line-height: 1.7; }
  .recs-box { background: #f5f7fa; border-radius: 8px; padding: 14px; font-size: 13px; line-height: 1.6; }
  .recs-box h4 { font-size: 13px; font-weight: 700; color: #1e4b8e; margin-bottom: 6px; }
  .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 11px; color: #aaa; text-align: center; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <h1>Relatório de Avaliação DISC</h1>
      <div style="font-size:13px;color:#666;margin-top:4px;">Vanguardia Grupo</div>
    </div>
    <div class="date">
      ${formatDateTime(result.date)}
      ${result.projectName ? `<br>Projeto: ${result.projectName}` : ''}
    </div>
  </div>

  <div class="candidate-info">
    <h2>${result.candidate.name}</h2>
    ${result.candidate.email ? `<div class="info-item"><span>E-mail:</span> ${result.candidate.email}</div>` : ''}
    ${result.candidate.phone ? `<div class="info-item"><span>Telefone:</span> ${result.candidate.phone}</div>` : ''}
    ${result.candidate.position ? `<div class="info-item"><span>Cargo:</span> ${result.candidate.position}</div>` : ''}
    ${result.candidate.department ? `<div class="info-item"><span>Departamento:</span> ${result.candidate.department}</div>` : ''}
  </div>

  <div class="scores-row">
    <div class="score-box D"><div class="score-letter">D</div><div class="score-pct">${result.scores.D}%</div><div class="score-name">Dominância</div></div>
    <div class="score-box I"><div class="score-letter">I</div><div class="score-pct">${result.scores.I}%</div><div class="score-name">Influência</div></div>
    <div class="score-box S"><div class="score-letter">S</div><div class="score-pct">${result.scores.S}%</div><div class="score-name">Estabilidade</div></div>
    <div class="score-box C"><div class="score-letter">C</div><div class="score-pct">${result.scores.C}%</div><div class="score-name">Conformidade</div></div>
  </div>

  ${chartImage ? `<div class="chart-section"><img src="${chartImage}" alt="Gráfico DISC"></div>` : ''}

  <div class="profile-banner">
    <h3>Perfil Predominante: ${profile.name}</h3>
    <p>${profile.description}</p>
  </div>

  <div class="two-col">
    <div class="section-box">
      <h4>Pontos Fortes</h4>
      <ul>${profile.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
    </div>
    <div class="section-box">
      <h4>Áreas de Desenvolvimento</h4>
      <ul>${profile.improvements.map(i => `<li>${i}</li>`).join('')}</ul>
    </div>
  </div>

  <div class="recs-box">
    <h4>Recomendações para o Ambiente de Trabalho</h4>
    <p>${profile.recommendations}</p>
  </div>

  <div class="footer">Vanguardia Grupo &bull; Sistema de Avaliação DISC &bull; Gerado em ${formatDateTime(new Date().toISOString())}</div>
</div>
<script>window.onload = function() { setTimeout(function(){ window.print(); }, 400); }<\/script>
</body></html>`);
    printWindow.document.close();
}

// ==========================================
// FILTERS
// ==========================================
async function applyFilters() {
    const startDate = document.getElementById('filterDateStart').value;
    const endDate = document.getElementById('filterDateEnd').value;
    const projectSel = document.getElementById('filterProject');
    adminFilterProjectId = projectSel && projectSel.value ? parseInt(projectSel.value) : null;

    let results = await getAllResults();

    if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        results = results.filter(r => new Date(r.date) >= start);
    }

    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        results = results.filter(r => new Date(r.date) <= end);
    }

    filteredResults = results;
    loadAdminData();
}

function clearFilters() {
    document.getElementById('filterDateStart').value = '';
    document.getElementById('filterDateEnd').value = '';
    const projectSel = document.getElementById('filterProject');
    if (projectSel) projectSel.value = '';
    adminFilterProjectId = null;
    filteredResults = null;
    loadAdminData();
}

async function refreshData() {
    filteredResults = null;
    adminFilterProjectId = null;
    document.getElementById('filterDateStart').value = '';
    document.getElementById('filterDateEnd').value = '';
    const projectSel = document.getElementById('filterProject');
    if (projectSel) projectSel.value = '';
    await loadAdminData();
    alert('Dados atualizados!');
}

// ==========================================
// EXPORT FUNCTIONS
// ==========================================
async function exportToCSV() {
    const results = filteredResults || await getAllResults();
    if (results.length === 0) {
        alert('Não há dados para exportar.');
        return;
    }

    let csv = 'Data/Hora,Projeto,Nome,Email,Telefone,Cargo,Departamento,D%,I%,S%,C%,Perfil Dominante,Descricao do Perfil\n';

    results.forEach(r => {
        const profile = profileData[r.dominantProfile];
        csv += `"${formatDateTime(r.date)}",`;
        csv += `"${r.projectName || ''}",`;
        csv += `"${r.candidate.name}",`;
        csv += `"${r.candidate.email}",`;
        csv += `"${r.candidate.phone || ''}",`;
        csv += `"${r.candidate.position || ''}",`;
        csv += `"${r.candidate.department || ''}",`;
        csv += `${r.scores.D},${r.scores.I},${r.scores.S},${r.scores.C},`;
        csv += `"${profile.name}",`;
        csv += `"${profile.description.replace(/"/g, '""')}"\n`;
    });

    downloadFile(csv, `vanguardia_disc_${getDateString()}.csv`, 'text/csv;charset=utf-8;');
}

async function exportToExcel() {
    const results = filteredResults || await getAllResults();
    if (results.length === 0) {
        alert('Não há dados para exportar.');
        return;
    }

    const data = results.map(r => {
        const profile = profileData[r.dominantProfile];
        return {
            'Data/Hora': formatDateTime(r.date),
            'Projeto': r.projectName || '',
            'Nome': r.candidate.name,
            'Email': r.candidate.email,
            'Telefone': r.candidate.phone || '',
            'Cargo': r.candidate.position || '',
            'Departamento': r.candidate.department || '',
            'Dominância (D)': `${r.scores.D}%`,
            'Influência (I)': `${r.scores.I}%`,
            'Estabilidade (S)': `${r.scores.S}%`,
            'Conformidade (C)': `${r.scores.C}%`,
            'Perfil Dominante': profile.name,
            'Descrição': profile.description,
            'Pontos Fortes': profile.strengths.join('; '),
            'Áreas de Desenvolvimento': profile.improvements.join('; '),
            'Recomendações': profile.recommendations
        };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Avaliações DISC');

    const colWidths = Object.keys(data[0]).map(key => ({
        wch: Math.max(key.length, ...data.map(row => String(row[key]).length))
    }));
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `vanguardia_disc_${getDateString()}.xlsx`);
}

async function clearAllData() {
    const scope = adminFilterProjectId
        ? `do projeto "${allProjects.find(p => p.id === adminFilterProjectId)?.name || adminFilterProjectId}"`
        : 'de TODOS os projetos';
    if (confirm(`ATENÇÃO: Você está prestes a apagar TODAS as avaliações ${scope}.\n\nEsta ação NÃO pode ser desfeita!\n\nDeseja continuar?`)) {
        if (confirm('Confirmação final: Tem certeza absoluta?')) {
            try {
                await deleteAllFromSupabase(adminFilterProjectId);
                allResults = [];
                filteredResults = null;
                loadAdminData();
                alert('Dados apagados.');
            } catch (error) {
                alert('Erro ao apagar dados. Tente novamente.');
            }
        }
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getDateString() {
    return new Date().toISOString().split('T')[0];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}
