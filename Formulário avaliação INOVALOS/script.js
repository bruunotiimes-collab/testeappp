/**
 * INOVA LOS - Formulário de Avaliação Premium
 * Integração: Netlify Functions + Firebase Cloud Firestore
 */

// Endpoint da Netlify Function
const API_ENDPOINT = '/.netlify/functions/salvar';

// Lista de ideias
const IDEAS_LIST = [
    { id: 1, titulo: "MASCOTE GRUPO LOS" },
    { id: 2, titulo: "ADESIVAR PORTA DOS BANHEIROS" },
    { id: 3, titulo: "PROJETO DE PREVENÇÃO DE ACIDENTES: ILUMINAÇÃO DE EMERGÊNCIA EM CASO DE FALTA DE ENERGIA" },
    { id: 4, titulo: "MELHORIA NO BANHEIRO FEMININO" },
    { id: 5, titulo: "MOMENTO EMPRESA" },
    { id: 6, titulo: "COMUNICAÇÃO ALTA DIREÇÃO COM OPERAÇÕES" },
    { id: 7, titulo: "A SUA FALTA DE LANCHINHO ACABOU, POIS MARKET4U CHEGOU!" },
    { id: 8, titulo: "OPORTUNIDADE DE PARTICIAÇÃO NO WORKSHOP" },
    { id: 9, titulo: "GYMPASS/WELLHUB - INCENTIVO AO BEM-ESTAR E QUALIDADE" },
    { id: 10, titulo: "LOS SUSTENTÁVEL - ADUBANDO E REFLORESTANDO" },
    { id: 11, titulo: "SOS PSICÓLOGO" },
    { id: 12, titulo: "SECADOR DE MÃOS NO BANHEIRO" },
    { id: 13, titulo: "PATROCÍNIO ESPORTIVO GRUPO LOS" }
];

const EVALUATION_CRITERIA = [
    { id: "clareza", label: "Clareza", key: "clareza" },
    { id: "grauInovacao", label: "Grau de inovação", key: "grauInovacao" },
    { id: "viabilidade", label: "Viabilidade de implementação", key: "viabilidade" },
    { id: "alinhamento", label: "Alinhamento com os valores do Grupo LOS", key: "alinhamento" },
    { id: "impactoEmpresa", label: "Impacto para empresa", key: "impactoEmpresa" },
    { id: "impactoColaborador", label: "Impacto na experiência do colaborador", key: "impactoColaborador" },
    { id: "impactoClientes", label: "Impacto na experiência dos clientes", key: "impactoClientes" },
    { id: "escalabilidade", label: "Escalabilidade da ideia", key: "escalabilidade" },
    { id: "sustentabilidade", label: "Sustentabilidade e impacto ambiental", key: "sustentabilidade" },
    { id: "maturidade", label: "Nível de maturidade da ideia", key: "maturidade" },
    { id: "engajamento", label: "Engajamento e protagonismo e dedicação do colaborador proponente", key: "engajamento" }
];

const RATING_SCALE = [1, 2, 3, 4, 5];

let currentSection = 1;
const totalSections = 3;

// ===================================
// INICIALIZAÇÃO
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    populateIdeasDropdown();
    generateRatingTable();
    setupEventListeners();
    updateProgress();

    // Animação de entrada suave
    document.querySelector('.container').style.opacity = '0';
    setTimeout(() => {
        document.querySelector('.container').style.transition = 'opacity 1s ease';
        document.querySelector('.container').style.opacity = '1';
    }, 100);
}

// ===================================
// NAVEGAÇÃO & UI
// ===================================

function nextSection(fromSection) {
    if (!validateSection(fromSection)) {
        shakeElement(`section${fromSection}`);
        return;
    }

    if (fromSection < totalSections) {
        navigateToSection(fromSection + 1);
    }
}

function prevSection(fromSection) {
    if (fromSection > 1) {
        navigateToSection(fromSection - 1);
    }
}

function navigateToSection(sectionNumber) {
    document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`section${sectionNumber}`).classList.add('active');
    currentSection = sectionNumber;
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const steps = document.querySelectorAll('.step');

    const percentage = ((currentSection - 1) / (totalSections - 1)) * 100;
    progressFill.style.width = `${percentage}%`;

    steps.forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        if (stepNum === currentSection) step.classList.add('active');
        else if (stepNum < currentSection) step.classList.add('completed');
    });
}

function shakeElement(id) {
    const el = document.getElementById(id);
    el.style.animation = 'none';
    el.offsetHeight; // trigger reflow
    el.style.animation = 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both';
}

// ===================================
// VALIDAÇÃO & COLETA
// ===================================

function validateSection(sectionNumber) {
    clearErrors();
    let isValid = true;

    if (sectionNumber === 1) {
        if (!checkField('nomeAvaliador', 'Informe seu nome completo')) isValid = false;
        if (!checkField('funcaoAvaliador', 'Informe sua função')) isValid = false;
        if (!checkField('areaAvaliador', 'Informe sua área ou setor')) isValid = false;
    } else if (sectionNumber === 2) {
        if (!checkField('tituloIdeia', 'Selecione uma ideia para avaliar')) isValid = false;
        if (!checkField('setorIdealizador', 'Informe o setor de origem da ideia')) isValid = false;
    } else if (sectionNumber === 3) {
        const unrated = [];
        EVALUATION_CRITERIA.forEach(c => {
            const checked = document.querySelector(`input[name="${c.id}"]:checked`);
            if (!checked) {
                unrated.push(c.label);
                document.querySelector(`tr[data-criteria="${c.id}"]`).classList.add('error');
            }
        });

        if (unrated.length > 0) {
            isValid = false;
            alert(`Por favor, avalie todos os critérios antes de enviar.\nFaltam ${unrated.length} critério(s).`);
        }
    }
    return isValid;
}

function checkField(id, msg) {
    const el = document.getElementById(id);
    if (!el.value.trim()) {
        el.classList.add('error');
        const err = document.getElementById(`${id}Error`);
        if (err) err.textContent = msg;
        return false;
    }
    return true;
}

function clearErrors() {
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
}

// ===================================
// DINÂMICA DO FORMULÁRIO
// ===================================

function populateIdeasDropdown() {
    const select = document.getElementById('tituloIdeia');
    IDEAS_LIST.forEach(idea => {
        const option = document.createElement('option');
        option.value = idea.id;
        option.textContent = `${idea.id}. ${idea.titulo}`;
        select.appendChild(option);
    });
}

function generateRatingTable() {
    const tbody = document.getElementById('ratingTableBody');
    tbody.innerHTML = '';

    EVALUATION_CRITERIA.forEach(c => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-criteria', c.id);

        const tdLabel = document.createElement('td');
        tdLabel.textContent = c.label;
        tr.appendChild(tdLabel);

        RATING_SCALE.forEach(val => {
            const td = document.createElement('td');
            td.innerHTML = `
                <label class="rating-radio">
                    <input type="radio" name="${c.id}" value="${val}" required>
                    <span class="radio-custom"></span>
                </label>
            `;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// ===================================
// SUBMISSÃO
// ===================================

function setupEventListeners() {
    const form = document.getElementById('avaliacaoForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (validateSection(3)) {
            await submitData();
        }
    });
}

async function submitData() {
    const btn = document.getElementById('submitBtn');
    const originalContent = btn.innerHTML;

    // Loading State
    btn.disabled = true;
    btn.innerHTML = `
        <svg class="spinner" width="20" height="20" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="white" stroke-width="4" stroke-dasharray="31.4 31.4"></circle>
        </svg>
        Enviando para a nuvem...
    `;

    const payload = collectData();

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            showSuccessModal();
        } else {
            throw new Error(result.error || 'Erro ao salvar dados');
        }
    } catch (err) {
        console.error('Submission error:', err);
        alert(`Erro ao enviar: ${err.message}\n\nVerifique sua conexão e tente novamente.`);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalContent;
    }
}

function collectData() {
    const idIdeia = parseInt(document.getElementById('tituloIdeia').value);
    const ideia = IDEAS_LIST.find(i => i.id === idIdeia);

    const avaliacoes = {};
    let totalScore = 0;
    let count = 0;

    EVALUATION_CRITERIA.forEach(c => {
        const val = parseInt(document.querySelector(`input[name="${c.id}"]:checked`).value);
        avaliacoes[c.id] = { label: c.label, valor: val };
        totalScore += val;
        count++;
    });

    return {
        avaliador: {
            nome: document.getElementById('nomeAvaliador').value.trim(),
            funcao: document.getElementById('funcaoAvaliador').value.trim(),
            area: document.getElementById('areaAvaliador').value.trim()
        },
        ideia: {
            id: idIdeia,
            titulo: ideia ? ideia.titulo : 'N/A',
            setorIdealizador: document.getElementById('setorIdealizador').value.trim()
        },
        avaliacoes: avaliacoes,
        mediaGeral: (totalScore / count).toFixed(2)
    };
}

// ===================================
// HELPERS & MODAIS
// ===================================

function showSuccessModal() {
    document.getElementById('successModal').classList.add('active');
}

function resetForm() {
    window.location.reload();
}

// Expõe para o HTML
window.nextSection = nextSection;
window.prevSection = prevSection;
window.resetForm = resetForm;
