// DISC Assessment Application for Vanguardia

// State management
let currentQuestion = 0;
let answers = {};
let candidateInfo = {};
let discChart = null;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initCandidateForm();
    loadAdminData();
});

// Navigation
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
    document.getElementById(`page-${pageName}`).classList.add('active');

    // Load specific page data
    if (pageName === 'admin') {
        loadAdminData();
    } else if (pageName === 'results') {
        loadLastResult();
    }
}

// Candidate Form
function initCandidateForm() {
    document.getElementById('candidateInfoForm').addEventListener('submit', (e) => {
        e.preventDefault();

        candidateInfo = {
            name: document.getElementById('candidateName').value,
            email: document.getElementById('candidateEmail').value,
            position: document.getElementById('candidatePosition').value,
            department: document.getElementById('candidateDepartment').value
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

// Questions
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

// Finish and Calculate Results
function finishAssessment() {
    const scores = calculateScores();
    const result = {
        id: Date.now(),
        date: new Date().toISOString(),
        candidate: candidateInfo,
        scores: scores,
        dominantProfile: getDominantProfile(scores)
    };

    // Save result
    saveResult(result);

    // Show results page
    showResults(result);
    showPage('results');

    // Reset form
    resetAssessment();
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

// Storage
function saveResult(result) {
    let results = JSON.parse(localStorage.getItem('discResults') || '[]');
    results.push(result);
    localStorage.setItem('discResults', JSON.stringify(results));
    localStorage.setItem('lastResult', JSON.stringify(result));
}

function getAllResults() {
    return JSON.parse(localStorage.getItem('discResults') || '[]');
}

function getLastResult() {
    return JSON.parse(localStorage.getItem('lastResult') || 'null');
}

// Display Results
function showResults(result) {
    document.getElementById('no-results').classList.add('hidden');
    document.getElementById('results-content').classList.remove('hidden');

    // Header info
    document.getElementById('resultCandidateName').textContent = result.candidate.name;
    document.getElementById('resultDate').textContent = `Avaliação realizada em: ${new Date(result.date).toLocaleDateString('pt-BR')}`;

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
    renderChart(result.scores);
}

function loadLastResult() {
    const result = getLastResult();
    if (result) {
        showResults(result);
    } else {
        document.getElementById('no-results').classList.remove('hidden');
        document.getElementById('results-content').classList.add('hidden');
    }
}

function renderChart(scores) {
    const ctx = document.getElementById('discChart').getContext('2d');

    if (discChart) {
        discChart.destroy();
    }

    discChart = new Chart(ctx, {
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
}

// Reset
function resetAssessment() {
    currentQuestion = 0;
    answers = {};
    candidateInfo = {};

    document.getElementById('candidateInfoForm').reset();
    document.getElementById('candidate-form').classList.remove('hidden');
    document.getElementById('questions-section').classList.add('hidden');
}

// Admin Functions
function loadAdminData() {
    const results = getAllResults();

    // Stats
    document.getElementById('totalAssessments').textContent = results.length;

    if (results.length > 0) {
        const avgScores = calculateAverages(results);
        document.getElementById('avgD').textContent = `${avgScores.D}%`;
        document.getElementById('avgI').textContent = `${avgScores.I}%`;
        document.getElementById('avgS').textContent = `${avgScores.S}%`;
        document.getElementById('avgC').textContent = `${avgScores.C}%`;
    }

    // Table
    const tbody = document.getElementById('assessmentsTable');
    tbody.innerHTML = results.reverse().map(result => `
        <tr>
            <td>${new Date(result.date).toLocaleDateString('pt-BR')}</td>
            <td>${result.candidate.name}</td>
            <td>${result.candidate.email}</td>
            <td>${result.candidate.position || '-'}</td>
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
}

function calculateAverages(results) {
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
        showResults(result);
        showPage('results');
    }
}

function exportToCSV() {
    const results = getAllResults();
    if (results.length === 0) {
        alert('Não há dados para exportar.');
        return;
    }

    let csv = 'Data,Nome,Email,Cargo,Departamento,D%,I%,S%,C%,Perfil Dominante\n';

    results.forEach(r => {
        csv += `${new Date(r.date).toLocaleDateString('pt-BR')},`;
        csv += `"${r.candidate.name}",`;
        csv += `"${r.candidate.email}",`;
        csv += `"${r.candidate.position || ''}",`;
        csv += `"${r.candidate.department || ''}",`;
        csv += `${r.scores.D},${r.scores.I},${r.scores.S},${r.scores.C},`;
        csv += `${profileData[r.dominantProfile].name}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `vanguardia_disc_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

function clearAllData() {
    if (confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
        localStorage.removeItem('discResults');
        localStorage.removeItem('lastResult');
        loadAdminData();
        alert('Dados apagados com sucesso.');
    }
}

// Print and PDF
function printResults() {
    window.print();
}

function downloadPDF() {
    alert('Para gerar o PDF, use a função de impressão (Ctrl+P) e selecione "Salvar como PDF".');
    window.print();
}
