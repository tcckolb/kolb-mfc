/* =====================================================================
   Kolb-MFC – app.js (arquivo único)
   Aplicativo para personalização do ensino na preceptoria em
   Medicina de Família e Comunidade.

   Este arquivo reúne, em ordem:
     1. Configuração do Firebase (opcional)
     2. Questionário e recomendações (antigo kolb.js)
     3. Cálculo dos escores e do estilo
     4. Interface (antigo app.js)
     5. Registro do Service Worker (PWA)

   Observação: o questionário é autoral, baseado no modelo de
   aprendizagem experiencial de Kolb (1984). Não é o Learning Style
   Inventory (LSI) oficial, que é protegido por direitos autorais.
   ===================================================================== */

/* ---------------------------------------------------------------------
   1. FIREBASE (OPCIONAL)
   Enquanto apiKey for "SUA_API_KEY", o app salva tudo apenas no próprio
   aparelho (localStorage) e não envia dados para lugar nenhum.
   Para usar o Firebase, preencha os campos abaixo com os dados do seu
   projeto (Console do Firebase > Configurações do projeto > Seus apps).
   --------------------------------------------------------------------- */
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    databaseURL: "SUA_DATABASE_URL",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};
const FIREBASE_SDK_VERSION = "9.10.0";

/* ---------------------------------------------------------------------
   2. QUESTIONÁRIO E RECOMENDAÇÕES
   EC = Experiência Concreta | OR = Observação Reflexiva
   CA = Conceituação Abstrata | EA = Experimentação Ativa
   --------------------------------------------------------------------- */
// js/kolb.js
// Questionário autoral baseado no modelo de aprendizagem experiencial de Kolb (1984).
// Não é o Learning Style Inventory (LSI) oficial, que é protegido por direitos autorais.
// EC = Experiência Concreta | OR = Observação Reflexiva | CA = Conceituação Abstrata | EA = Experimentação Ativa

const KOLB_MODES = {EC: 'Experiência Concreta', OR: 'Observação Reflexiva', CA: 'Conceituação Abstrata', EA: 'Experimentação Ativa'};

const KOLB_QUESTIONS = [
    {
        question: "Quando atendo um caso novo na unidade de saúde, aprendo melhor...",
        options: [
            { text: "envolvendo-me diretamente com a pessoa e com a sua história", type: 'EC' },
            { text: "observando com calma antes de agir", type: 'OR' },
            { text: "relacionando o caso a conceitos e diretrizes", type: 'CA' },
            { text: "testando condutas e acompanhando o resultado", type: 'EA' }
        ]
    },
    {
        question: "Nas discussões de caso com o preceptor, prefiro...",
        options: [
            { text: "compartilhar minhas impressões sobre o encontro com o paciente", type: 'EC' },
            { text: "ouvir diferentes pontos de vista antes de opinar", type: 'OR' },
            { text: "analisar o raciocínio clínico de forma lógica", type: 'CA' },
            { text: "definir logo um plano de ação", type: 'EA' }
        ]
    },
    {
        question: "Aprendo com mais facilidade quando...",
        options: [
            { text: "posso confiar na vivência e na intuição", type: 'EC' },
            { text: "tenho tempo para pensar sobre o que aconteceu", type: 'OR' },
            { text: "consigo explicar o porquê das coisas", type: 'CA' },
            { text: "posso praticar imediatamente", type: 'EA' }
        ]
    },
    {
        question: "Diante de uma situação complexa no território (por exemplo, uma família em vulnerabilidade)...",
        options: [
            { text: "aproximo-me das pessoas envolvidas", type: 'EC' },
            { text: "observo a dinâmica antes de intervir", type: 'OR' },
            { text: "busco um referencial teórico que ajude a compreender", type: 'CA' },
            { text: "proponho ações concretas e acompanho os efeitos", type: 'EA' }
        ]
    },
    {
        question: "Ao estudar um tema clínico...",
        options: [
            { text: "parto de um paciente que atendi", type: 'EC' },
            { text: "leio e registro minhas reflexões", type: 'OR' },
            { text: "estudo revisões e protocolos de forma sistemática", type: 'CA' },
            { text: "procuro aplicações práticas imediatas", type: 'EA' }
        ]
    },
    {
        question: "Em atividades de educação em saúde com grupos...",
        options: [
            { text: "valorizo o contato e a troca com os participantes", type: 'EC' },
            { text: "observo como o grupo reage", type: 'OR' },
            { text: "planejo a atividade com base em evidências", type: 'CA' },
            { text: "gosto de experimentar dinâmicas novas", type: 'EA' }
        ]
    },
    {
        question: "Quando recebo feedback...",
        options: [
            { text: "presto atenção em como me senti", type: 'EC' },
            { text: "reflito sobre ele com calma depois", type: 'OR' },
            { text: "procuro entender os critérios utilizados", type: 'CA' },
            { text: "tento fazer diferente já no próximo atendimento", type: 'EA' }
        ]
    },
    {
        question: "Eu me descreveria como alguém...",
        options: [
            { text: "receptivo e sensível", type: 'EC' },
            { text: "observador e cuidadoso", type: 'OR' },
            { text: "racional e analítico", type: 'CA' },
            { text: "prático e orientado a resultados", type: 'EA' }
        ]
    },
    {
        question: "Diante de um procedimento que nunca realizei (por exemplo, inserção de DIU)...",
        options: [
            { text: "prefiro fazê-lo junto com alguém experiente", type: 'EC' },
            { text: "assisto algumas vezes antes de tentar", type: 'OR' },
            { text: "estudo a técnica e a anatomia em detalhe", type: 'CA' },
            { text: "treino em simulador e faço assim que possível", type: 'EA' }
        ]
    },
    {
        question: "Nas reuniões de equipe...",
        options: [
            { text: "valorizo as relações e o clima do grupo", type: 'EC' },
            { text: "escuto mais do que falo", type: 'OR' },
            { text: "organizo ideias e argumentos", type: 'CA' },
            { text: "foco em tarefas e encaminhamentos", type: 'EA' }
        ]
    },
    {
        question: "Aprendo melhor por meio de...",
        options: [
            { text: "experiências reais e vínculos", type: 'EC' },
            { text: "observação e registros reflexivos", type: 'OR' },
            { text: "aulas, leituras e mapas conceituais", type: 'CA' },
            { text: "desafios práticos e projetos", type: 'EA' }
        ]
    },
    {
        question: "Ao final de um turno, sinto que aprendi quando...",
        options: [
            { text: "vivi algo significativo com os pacientes", type: 'EC' },
            { text: "pensei sobre o que aconteceu", type: 'OR' },
            { text: "compreendi um conceito novo", type: 'CA' },
            { text: "consegui resolver um problema", type: 'EA' }
        ]
    }
];

const KOLB_STYLES = {
    "Divergente": {
        "modes": "EC + OR",
        "description": "Aprende a partir de situações concretas observadas sob diferentes perspectivas; valoriza a escuta, o vínculo e a geração de ideias.",
        "preferred": [
            "Discussão de casos em pequenos grupos",
            "Observação de consultas seguida de debriefing",
            "Construção reflexiva de genograma e ecomapa",
            "Portfólio ou diário reflexivo"
        ],
        "develop": [
            "Tomada de decisão clínica com prazo definido",
            "Aplicação de protocolos e diretrizes em casos reais",
            "Consultas com maior autonomia e supervisão direta"
        ],
        "feedback": "Descritivo e exploratório, focado em múltiplas perspectivas e na relação com o paciente."
    },
    "Assimilador": {
        "modes": "CA + OR",
        "description": "Aprende organizando informações em modelos lógicos e consistentes; valoriza a fundamentação teórica e a análise.",
        "preferred": [
            "Leitura dirigida e estudo de diretrizes",
            "Clube de revista e discussão de evidências",
            "Mapas conceituais sobre temas do currículo",
            "Sessões de raciocínio clínico estruturado"
        ],
        "develop": [
            "Atendimentos supervisionados com execução ativa",
            "Simulação e role-play de comunicação clínica",
            "Visitas domiciliares e ações no território"
        ],
        "feedback": "Analítico e detalhado, focado na lógica do raciocínio e na conexão com a teoria."
    },
    "Convergente": {
        "modes": "CA + EA",
        "description": "Aprende aplicando ideias à solução de problemas práticos; valoriza decisões objetivas e procedimentos.",
        "preferred": [
            "Casos-problema com tomada de decisão",
            "Microensino no estilo preceptor-minuto",
            "Treino de procedimentos com simulação",
            "Elaboração e uso de fluxogramas assistenciais"
        ],
        "develop": [
            "Abordagem centrada na pessoa e escuta ampliada",
            "Discussão de casos com foco em aspectos psicossociais",
            "Registro reflexivo sobre o encontro clínico"
        ],
        "feedback": "Pragmático e direto, focado na aplicação correta e na solução encontrada."
    },
    "Acomodador": {
        "modes": "EC + EA",
        "description": "Aprende fazendo e se envolvendo em experiências novas; valoriza a ação, a iniciativa e a adaptação ao contexto.",
        "preferred": [
            "Aprendizagem em serviço com autonomia progressiva",
            "Visitas domiciliares e projetos de intervenção no território",
            "Simulação e treino prático",
            "Atividades coletivas e de educação em saúde"
        ],
        "develop": [
            "Leitura dirigida e fundamentação teórica dos casos",
            "Portfólio ou diário reflexivo",
            "Discussão estruturada do raciocínio clínico"
        ],
        "feedback": "Descritivo e focado na ação, valorizando a iniciativa e a experimentação."
    }
};

/* ---------------------------------------------------------------------
   3. CÁLCULO DOS ESCORES E DO ESTILO
   answers: lista com 12 objetos do tipo { EC: 4, OR: 2, CA: 1, EA: 3 }
   Cada modo soma de 12 a 48 pontos. O estilo vem do cruzamento dos
   eixos CA − EC (percepção) e EA − OR (processamento), corte em zero.
   --------------------------------------------------------------------- */
function calculateKolbScores(answers) {
    const scores = { EC: 0, OR: 0, CA: 0, EA: 0 };
    answers.forEach(set => {
        Object.keys(scores).forEach(m => { scores[m] += Number(set[m]) || 0; });
    });
    return scores;
}

function getKolbStyle(scores) {
    const ca_ec = scores.CA - scores.EC;
    const ea_or = scores.EA - scores.OR;
    let name;
    if (ca_ec >= 0) name = ea_or >= 0 ? "Convergente" : "Assimilador";
    else name = ea_or >= 0 ? "Acomodador" : "Divergente";
    return { name, scores, axes: { ca_ec, ea_or }, ...KOLB_STYLES[name] };
}

/* Verifica se a questão usa 1, 2, 3 e 4 uma única vez */
function isValidRanking(set) {
    const values = Object.values(set).map(Number).sort();
    return values.join(",") === "1,2,3,4";
}

/* ---------------------------------------------------------------------
   ARMAZENAMENTO: aparelho (sempre) + Firebase (se configurado)
   --------------------------------------------------------------------- */
const STORAGE_KEY = "kolbmfc_residentes";
let database = null;

function firebaseConfigured() {
    return firebaseConfig.apiKey && firebaseConfig.apiKey !== "SUA_API_KEY";
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src; s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
    });
}

async function initFirebase() {
    if (!firebaseConfigured()) return;
    try {
        const base = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}`;
        await loadScript(`${base}/firebase-app-compat.js`);
        await loadScript(`${base}/firebase-database-compat.js`);
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
    } catch (err) {
        console.warn("Firebase indisponível; usando apenas o armazenamento do aparelho.", err);
        database = null;
    }
}

function readLocal() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
}

function writeLocal(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); return true; }
    catch (e) { return false; }
}

/* Salva (ou atualiza) o registro do residente: dados, estilo, escores e plano */
async function saveRecord(rec) {
    const list = readLocal().filter(p => p.id !== rec.id);
    list.unshift(rec);
    const okLocal = writeLocal(list);
    let okCloud = null;
    if (database) {
        try { await database.ref(`residentes/${rec.id}`).set(rec); okCloud = true; }
        catch (err) { console.error("Erro ao salvar no Firebase:", err); okCloud = false; }
    }
    return { okLocal, okCloud };
}


/* ---------------------------------------------------------------------
   4. INTERFACE
   Fluxo: Início > Dados do residente > Questionário > Resultado
          > Plano de ensino > Residentes salvos
   O residente e o estilo são salvos assim que o resultado é calculado;
   o plano de ensino é salvo no mesmo registro.
   --------------------------------------------------------------------- */
let currentView = "home-view";
let chartInstance = null;
let current = null;       // registro em edição: { id, student, style, scores, axes, plan }

const $ = id => document.getElementById(id);

function changeView(viewId) {
    $(currentView).classList.remove("active-view");
    $(viewId).classList.add("active-view");
    currentView = viewId;
    window.scrollTo(0, 0);
}

function escapeHtml(t) {
    return String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function dataBR(iso) { return iso ? iso.split("-").reverse().join("/") : ""; }
function hoje() { return new Date().toISOString().slice(0, 10); }
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
}

/* ---------- Questionário ---------- */
function populateQuestions() {
    const container = $("questions-container");
    container.innerHTML = "";
    KOLB_QUESTIONS.forEach((q, qIndex) => {
        const div = document.createElement("div");
        div.className = "question p-4 border border-gray-200 rounded-lg";
        div.dataset.qindex = qIndex;
        let html = `
            <div class="flex justify-between items-end gap-4 mb-4">
                <p class="font-semibold">${qIndex + 1}. ${escapeHtml(q.question)}</p>
                <div class="hidden md:flex gap-2 text-xs font-medium text-gray-500 text-center shrink-0">
                    <span class="w-10">1<br>menos</span><span class="w-10">2</span><span class="w-10">3</span><span class="w-10">4<br>mais</span>
                </div>
            </div>
            <div class="space-y-4">`;
        shuffle(q.options).forEach(opt => {
            html += `
                <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-2 sm:gap-4">
                    <span class="text-gray-800">${escapeHtml(opt.text)}</span>
                    <div class="radio-group" role="radiogroup" aria-label="${escapeHtml(opt.text)}">
                        ${[1, 2, 3, 4].map(rank => `
                            <span>
                                <input type="radio" id="q${qIndex}_${opt.type}_${rank}" name="q${qIndex}_${opt.type}" value="${rank}"
                                       data-qindex="${qIndex}" data-rank="${rank}" data-key="${opt.type}">
                                <label for="q${qIndex}_${opt.type}_${rank}">${rank}</label>
                            </span>`).join("")}
                    </div>
                </div>`;
        });
        html += `</div>`;
        div.innerHTML = html;
        container.appendChild(div);
    });
    updateProgress();
}

function questionAnswers(qIndex) {
    const set = {};
    document.querySelectorAll(`input[data-qindex="${qIndex}"]:checked`).forEach(r => { set[r.dataset.key] = Number(r.value); });
    return set;
}

function questionIsValid(qIndex) {
    const set = questionAnswers(qIndex);
    return Object.keys(set).length === 4 && isValidRanking(set);
}

/* Ao marcar um número, desmarca o mesmo número em outra afirmação
   e, se faltar só uma, marca automaticamente o número restante. */
function handleRadioChange(radio) {
    const { qindex, rank, key } = radio.dataset;
    document.querySelectorAll(`input[data-qindex="${qindex}"][data-rank="${rank}"]`).forEach(r => {
        if (r.dataset.key !== key) r.checked = false;
    });
    const set = questionAnswers(qindex);
    const keys = KOLB_QUESTIONS[qindex].options.map(o => o.type);
    const missing = keys.filter(k => !(k in set));
    if (missing.length === 1) {
        const used = Object.values(set);
        const free = [1, 2, 3, 4].find(n => !used.includes(n));
        $(`q${qindex}_${missing[0]}_${free}`).checked = true;
    }
    const box = radio.closest(".question");
    box.classList.toggle("complete", questionIsValid(qindex));
    box.classList.remove("invalid");
    updateProgress();
}

function updateProgress() {
    const done = KOLB_QUESTIONS.filter((_, i) => questionIsValid(i)).length;
    $("progress-bar").style.width = `${(done / KOLB_QUESTIONS.length) * 100}%`;
    $("progress-text").textContent = `${done} de ${KOLB_QUESTIONS.length} situações respondidas`;
}

/* ---------- Resultado ---------- */
function showResult(record, isExample) {
    const r = getKolbStyle(record.scores);
    $("example-flag").classList.toggle("hidden", !isExample);
    $("result-name").textContent = record.student.name;
    $("result-saved").textContent = isExample ? "" : `Residente e estilo salvos em ${dataBR(record.createdAt.slice(0, 10))}.`;
    $("learning-style-result").textContent = r.name;
    $("style-description").textContent = r.description;
    $("score-bars").innerHTML = Object.keys(KOLB_MODES).map(m => `
        <li>
            <div class="flex justify-between text-sm"><span><strong>${m}</strong> · ${KOLB_MODES[m]}</span><span class="font-semibold tabular-nums">${r.scores[m]}</span></div>
            <div class="bar-track mt-1"><div class="bar-fill mode-${m}" style="width:${(r.scores[m] / 48) * 100}%"></div></div>
        </li>`).join("");
    $("rec-preferred").innerHTML = r.preferred.map(x => `<li>${escapeHtml(x)}</li>`).join("");
    $("rec-develop").innerHTML = r.develop.map(x => `<li>${escapeHtml(x)}</li>`).join("");
    $("rec-feedback").textContent = r.feedback;
    changeView("results-view");
    createChart(r.axes.ea_or, r.axes.ca_ec);
}

/* Gráfico de quadrantes: eixo X = EA − OR (reflexão ⟷ ação),
   eixo Y = CA − EC (experiência ⟷ conceituação). */
function createChart(x, y) {
    if (typeof Chart === "undefined") return;   // sem internet na primeira visita
    const ctx = $("kolb-chart").getContext("2d");
    if (chartInstance) chartInstance.destroy();
    const zeroLine = c => (c.tick.value === 0 ? "rgba(0,0,0,.45)" : "rgba(0,0,0,.08)");
    chartInstance = new Chart(ctx, {
        type: "scatter",
        data: { datasets: [{ label: "Residente", data: [{ x, y }], backgroundColor: "rgb(13,148,136)", pointRadius: 10, pointHoverRadius: 13 }] },
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            scales: {
                x: { min: -36, max: 36, ticks: { stepSize: 12 }, title: { display: true, text: "Reflexão ⟷ Ação (EA − OR)" }, grid: { color: zeroLine } },
                y: { min: -36, max: 36, ticks: { stepSize: 12 }, title: { display: true, text: "Experiência ⟷ Conceituação (CA − EC)" }, grid: { color: zeroLine } }
            },
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: c => ` EA − OR: ${c.parsed.x} | CA − EC: ${c.parsed.y}` } }
            }
        },
        plugins: [{
            id: "quadrantes",
            beforeDraw(chart) {
                const { ctx, chartArea: { left, top, right, bottom }, scales: { x, y } } = chart;
                const xc = x.getPixelForValue(0), yc = y.getPixelForValue(0);
                ctx.save();
                ctx.fillStyle = "rgba(107,114,128,.7)";
                ctx.font = "600 12px Inter, sans-serif";
                // Nomes nos cantos externos, para não cobrir o ponto do residente
                ctx.textBaseline = "middle";
                ctx.textAlign = "right";
                ctx.fillText("Convergente", right - 6, top + 12);
                ctx.fillText("Acomodador", right - 6, bottom - 12);
                ctx.textAlign = "left";
                ctx.fillText("Assimilador", left + 6, top + 12);
                ctx.fillText("Divergente", left + 6, bottom - 12);
                ctx.restore();
            }
        }]
    });
}

/* ---------- Plano de ensino ---------- */
function openPlan() {
    const r = getKolbStyle(current.scores);
    const p = current.plan || {};
    const s = current.student;
    $("plan-summary").textContent = `${s.name} (${s.year})${s.preceptor ? ` · Preceptor(a): ${s.preceptor}` : ""}${s.unit ? ` · ${s.unit}` : ""} · Estilo: ${r.name} (EC ${r.scores.EC}, OR ${r.scores.OR}, CA ${r.scores.CA}, EA ${r.scores.EA})`;
    $("plan-date").value = p.planDate || hoje();
    $("review-date").value = p.reviewDate || "";
    $("competencies").value = p.competencies || "";
    $("goals").value = p.goals || "";
    $("settings").value = p.settings || "";
    $("feedback-plan").value = p.feedback || `Feedback sugerido: ${r.feedback}`;
    const chosen = p.strategies || [];
    $("strategies").innerHTML = [["Métodos preferenciais", r.preferred], ["Para completar o ciclo", r.develop]].map(([t, list]) => `
        <div class="border border-gray-200 rounded-lg p-3">
            <p class="font-medium text-teal-700 mb-2">${t}</p>
            ${list.map(x => `<label class="flex gap-2 items-start mb-2 font-normal"><input type="checkbox" name="strategy" value="${escapeHtml(x)}" class="mt-1 accent-teal-600" ${chosen.includes(x) ? "checked" : ""}> <span>${escapeHtml(x)}</span></label>`).join("")}
        </div>`).join("");
    $("plan-msg").textContent = "";
    changeView("plan-view");
}

/* ---------- Residentes salvos ---------- */
function listSaved() {
    const list = readLocal();
    $("saved-list").innerHTML = list.length ? list.map(rec => `
        <li class="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
                <p class="font-semibold">${escapeHtml(rec.student.name)} <span class="text-gray-500 font-normal">(${escapeHtml(rec.student.year)})</span></p>
                <p class="text-sm"><span class="inline-block bg-teal-50 text-teal-800 font-semibold rounded-full px-2 py-0.5 mr-1">${escapeHtml(rec.style)}</span>
                EC ${rec.scores.EC} · OR ${rec.scores.OR} · CA ${rec.scores.CA} · EA ${rec.scores.EA}</p>
                <p class="text-xs text-gray-500 mt-1">Questionário em ${dataBR(rec.createdAt.slice(0, 10))} · ${rec.plan ? `plano salvo${rec.plan.reviewDate ? `, revisão em ${dataBR(rec.plan.reviewDate)}` : ""}` : "sem plano ainda"}</p>
            </div>
            <div class="flex gap-2 shrink-0">
                <button type="button" class="btn-primary !py-2 !px-4" data-open="${rec.id}">Abrir</button>
                <button type="button" class="btn-secondary !py-2 !px-4" data-delete="${rec.id}">Excluir</button>
            </div>
        </li>`).join("") : `<li class="text-gray-500">Nenhum residente salvo neste aparelho ainda.</li>`;
}

/* ---------- Eventos ---------- */
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => changeView(b.dataset.go)));

    $("storage-mode").textContent = firebaseConfigured()
        ? "Os dados são salvos neste aparelho e no Firebase configurado pela residência."
        : "Os dados ficam apenas neste aparelho. Nada é enviado para a internet.";

    $("register-form").addEventListener("submit", e => {
        e.preventDefault();
        current = {
            id: `residente_${Date.now()}`,
            student: {
                name: $("student-name").value.trim(),
                year: $("student-year").value,
                preceptor: $("preceptor-name").value.trim(),
                unit: $("unit-name").value.trim()
            }
        };
        populateQuestions();
        $("error-message").style.display = "none";
        changeView("test-view");
    });

    $("questions-container").addEventListener("change", e => {
        if (e.target.matches('input[type="radio"]')) handleRadioChange(e.target);
    });

    $("kolb-form").addEventListener("submit", async e => {
        e.preventDefault();
        const err = $("error-message");
        const invalid = KOLB_QUESTIONS.map((_, i) => i).filter(i => !questionIsValid(i));
        if (invalid.length) {
            invalid.forEach(i => document.querySelector(`.question[data-qindex="${i}"]`).classList.add("invalid"));
            err.textContent = `Faltam ${invalid.length} situação(ões): ${invalid.map(i => i + 1).join(", ")}. Em cada uma, use os números 1, 2, 3 e 4 exatamente uma vez.`;
            err.style.display = "block";
            document.querySelector(`.question[data-qindex="${invalid[0]}"]`).scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        err.style.display = "none";
        const answers = KOLB_QUESTIONS.map((_, i) => questionAnswers(i));
        const r = getKolbStyle(calculateKolbScores(answers));
        const now = new Date().toISOString();
        current = { ...current, style: r.name, scores: r.scores, axes: r.axes, answers, createdAt: current.createdAt || now, updatedAt: now };
        await saveRecord(current);
        showResult(current, false);
    });

    $("example-btn").addEventListener("click", () => {
        /* Respostas simuladas apenas para demonstração (não são salvas) */
        const pats = [["EC", "EA", "OR", "CA"], ["EA", "EC", "CA", "OR"], ["EC", "OR", "EA", "CA"], ["EA", "CA", "EC", "OR"]];
        const answers = KOLB_QUESTIONS.map((_, i) => { const set = {}; pats[i % 4].forEach((m, k) => { set[m] = 4 - k; }); return set; });
        const r = getKolbStyle(calculateKolbScores(answers));
        current = { id: null, example: true, student: { name: "Residente exemplo", year: "R1", preceptor: "", unit: "" }, style: r.name, scores: r.scores, axes: r.axes, createdAt: new Date().toISOString() };
        showResult(current, true);
    });

    $("retake-btn").addEventListener("click", () => {
        if (current.example) { changeView("register-view"); return; }
        populateQuestions(); changeView("test-view");
    });
    $("plan-btn").addEventListener("click", openPlan);

    $("plan-form").addEventListener("submit", async e => {
        e.preventDefault();
        current.plan = {
            planDate: $("plan-date").value,
            reviewDate: $("review-date").value,
            competencies: $("competencies").value,
            goals: $("goals").value,
            strategies: [...document.querySelectorAll('input[name="strategy"]:checked')].map(c => c.value),
            settings: $("settings").value,
            feedback: $("feedback-plan").value
        };
        current.updatedAt = new Date().toISOString();
        if (current.example) { $("plan-msg").textContent = "Este é um exemplo; cadastre um residente para salvar planos."; return; }
        const { okLocal, okCloud } = await saveRecord(current);
        let msg = okLocal ? "Plano salvo junto com o residente e o estilo." : "Não foi possível salvar neste aparelho (armazenamento bloqueado).";
        if (okCloud === true) msg += " Cópia enviada ao Firebase.";
        if (okCloud === false) msg += " A cópia no Firebase falhou; confira a configuração e as regras do banco.";
        $("plan-msg").textContent = msg;
    });
    $("print-btn").addEventListener("click", () => window.print());

    $("saved-btn").addEventListener("click", () => { listSaved(); changeView("saved-view"); });
    $("saved-list").addEventListener("click", e => {
        const openId = e.target.dataset.open, delId = e.target.dataset.delete;
        if (openId) {
            const rec = readLocal().find(r => r.id === openId);
            if (rec) { current = rec; showResult(rec, false); }
        }
        if (delId) {
            if (e.target.dataset.confirm !== "1") { e.target.dataset.confirm = "1"; e.target.textContent = "Confirmar"; return; }
            writeLocal(readLocal().filter(r => r.id !== delId));
            listSaved();
        }
    });

    initFirebase();
});

/* ---------------------------------------------------------------------
   5. SERVICE WORKER (PWA)
   Caminho relativo à página (index.html).
   --------------------------------------------------------------------- */
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js")
            .then(reg => console.log("Service Worker registrado:", reg.scope))
            .catch(err => console.log("Falha ao registrar o Service Worker:", err));
    });
}
