// DISC Assessment Application for Vanguardia
// Version 2.0 - With Admin Authentication

// ==========================================
// CONFIGURATION
// ==========================================
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'Vanguardia@2024'  // Change this password!
};

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

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
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
    // Check admin access
    if (pageName === 'admin' && !isAdminLoggedIn) {
        pageName = 'admin-login';
    }

    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });

    // Update pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Load specific page data
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

function handleAdminLogin(e) {
    e.preventDefault();

    const username = document.getElementById('adminUser').value;
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('loginError');

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        isAdminLoggedIn = true;
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminLoginTime', Date.now().toString());
        errorDiv.classList.add('hidden');
        showPage('admin');
    } else {
        errorDiv.classList.remove('hidden');
    }
}

function checkAdminSession() {
    const loggedIn = sessionStorage.getItem('adminLoggedIn');
    const loginTime = sessionStorage.getItem('adminLoginTime');

    // Session expires after 2 hours
    if (loggedIn === 'true' && loginTime) {
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
    sessionStorage.removeItem('adminLoggedIn');
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

            // Hide form, show questions
            document.getElementById('candidate-form').classList.add('hidden');
            document.getElementById('questions-section').classList.remove('hidden');

            // Reset and start assessment
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

    // Update progress
    const progress = ((currentQuestion + 1) / discQuestions.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `Pergunta ${currentQuestion + 1} de ${discQuestions.length}`;

    // Render question
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

    // Update navigation buttons
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

    // Validate answer
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
function finishAssessment() {
    const scores = calculateScores();
    const result = {
        id: Date.now(),
        date: new Date().toISOString(),
        candidate: candidateInfo,
        scores: scores,
        dominantProfile: getDominantProfile(scores),
        answers: { ...answers }
    };

    // Save result
    saveResult(result);

    // Show results page
    showCandidateResults(result);
    showPage('results');

    // Reset form for next candidate
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

    // Convert to percentages
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
function saveResult(result) {
    let results = JSON.parse(localStorage.getItem('discResults') || '[]');
    results.push(result);
    localStorage.setItem('discResults', JSON.stringify(results));
}

function getAllResults() {
    return JSON.parse(localStorage.getItem('discResults') || '[]');
}

function deleteResultById(id) {
    let results = getAllResults();
    results = results.filter(r => r.id !== id);
    localStorage.setItem('discResults', JSON.stringify(results));
}

// ==========================================
// CANDIDATE RESULTS DISPLAY
// ==========================================
function showCandidateResults(result) {
    document.getElementById('no-results').classList.add('hidden');
    document.getElementById('results-content').classList.remove('hidden');

    // Header info
    document.getElementById('resultCandidateName').textContent = result.candidate.name;
    document.getElementById('resultDate').textContent = `Avaliação realizada em: ${formatDateTime(result.date)}`;

    // Scores
    document.getElementById('scoreD').textContent = `${result.scores.D}%`;
    document.getElementById('scoreI').textContent = `${result.scores.I}%`;
    document.getElementById('scoreS').textContent = `${result.scores.S}%`;
    document.getElementById('scoreC').textContent = `${result.scores.C}%`;

    // Profile info
    const profile = profileData[result.dominantProfile];
    document.getElementById('dominantProfile').textContent = profile.name;
    document.getElementById('profileDescription').textContent = profile.description;

    // Strengths
    const strengthsList = document.getElementById('strengths');
    strengthsList.innerHTML = profile.strengths.map(s => `<li>${s}</li>`).join('');

    // Improvements
    const improvementsList = document.getElementById('improvements');
    improvementsList.innerHTML = profile.improvements.map(i => `<li>${i}</li>`).join('');

    // Recommendations
    document.getElementById('recommendations').textContent = profile.recommendations;

    // Chart
    renderChart('discChart', result.scores, 'discChart');
}

function renderChart(canvasId, scores, chartVar) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    // Destroy existing chart if exists
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
                    max: 50,
                    ticks: {
                        stepSize: 10
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
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
}

// ==========================================
// ADMIN FUNCTIONS
// ==========================================
function loadAdminData() {
    const results = filteredResults || getAllResults();

    // Stats
    document.getElementById('totalAssessments').textContent = results.length;

    if (results.length > 0) {
        const avgScores = calculateAverages(results);
        document.getElementById('avgD').textContent = `${avgScores.D}%`;
        document.getElementById('avgI').textContent = `${avgScores.I}%`;
        document.getElementById('avgS').textContent = `${avgScores.S}%`;
        document.getElementById('avgC').textContent = `${avgScores.C}%`;

        // Show table, hide no data message
        document.getElementById('noDataMessage').classList.add('hidden');

        // Table
        const tbody = document.getElementById('assessmentsTable');
        tbody.innerHTML = [...results].reverse().map(result => `
            <tr>
                <td>${formatDateTime(result.date)}</td>
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
                    <button class="btn btn-secondary" onclick="viewResult(${result.id})">Ver</button>
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
    const results = getAllResults();
    const result = results.find(r => r.id === id);

    if (result) {
        currentViewingResult = result;
        showAdminResultView(result);
        showPage('admin-view');
    }
}

function showAdminResultView(result) {
    // Header info
    document.getElementById('adminResultCandidateName').textContent = result.candidate.name;
    document.getElementById('adminResultEmail').textContent = result.candidate.email;
    document.getElementById('adminResultDate').textContent = `Avaliação: ${formatDateTime(result.date)}`;

    // Scores
    document.getElementById('adminScoreD').textContent = `${result.scores.D}%`;
    document.getElementById('adminScoreI').textContent = `${result.scores.I}%`;
    document.getElementById('adminScoreS').textContent = `${result.scores.S}%`;
    document.getElementById('adminScoreC').textContent = `${result.scores.C}%`;

    // Profile info
    const profile = profileData[result.dominantProfile];
    document.getElementById('adminDominantProfile').textContent = profile.name;
    document.getElementById('adminProfileDescription').textContent = profile.description;

    // Strengths
    document.getElementById('adminStrengths').innerHTML = profile.strengths.map(s => `<li>${s}</li>`).join('');

    // Improvements
    document.getElementById('adminImprovements').innerHTML = profile.improvements.map(i => `<li>${i}</li>`).join('');

    // Recommendations
    document.getElementById('adminRecommendations').textContent = profile.recommendations;

    // Chart
    renderChart('adminDiscChart', result.scores, 'adminDiscChart');
}

function deleteResult() {
    if (currentViewingResult && confirm('Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.')) {
        deleteResultById(currentViewingResult.id);
        currentViewingResult = null;
        showPage('admin');
    }
}

function printAdminResults() {
    window.print();
}

// ==========================================
// FILTERS
// ==========================================
function applyFilters() {
    const startDate = document.getElementById('filterDateStart').value;
    const endDate = document.getElementById('filterDateEnd').value;

    let results = getAllResults();

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
    filteredResults = null;
    loadAdminData();
}

function refreshData() {
    filteredResults = null;
    clearFilters();
    loadAdminData();
    alert('Dados atualizados!');
}

// ==========================================
// EXPORT FUNCTIONS
// ==========================================
function exportToCSV() {
    const results = filteredResults || getAllResults();
    if (results.length === 0) {
        alert('Não há dados para exportar.');
        return;
    }

    let csv = 'Data/Hora,Nome,Email,Telefone,Cargo,Departamento,D%,I%,S%,C%,Perfil Dominante,Descricao do Perfil\n';

    results.forEach(r => {
        const profile = profileData[r.dominantProfile];
        csv += `"${formatDateTime(r.date)}",`;
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

function exportToExcel() {
    const results = filteredResults || getAllResults();
    if (results.length === 0) {
        alert('Não há dados para exportar.');
        return;
    }

    // Prepare data for Excel
    const data = results.map(r => {
        const profile = profileData[r.dominantProfile];
        return {
            'Data/Hora': formatDateTime(r.date),
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

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Avaliações DISC');

    // Auto-width columns
    const colWidths = Object.keys(data[0]).map(key => ({
        wch: Math.max(key.length, ...data.map(row => String(row[key]).length))
    }));
    ws['!cols'] = colWidths;

    // Download
    XLSX.writeFile(wb, `vanguardia_disc_${getDateString()}.xlsx`);
}

function clearAllData() {
    if (confirm('ATENÇÃO: Você está prestes a apagar TODOS os dados das avaliações.\n\nEsta ação NÃO pode ser desfeita!\n\nDeseja continuar?')) {
        if (confirm('Confirmação final: Tem certeza absoluta?')) {
            localStorage.removeItem('discResults');
            filteredResults = null;
            loadAdminData();
            alert('Todos os dados foram apagados.');
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
