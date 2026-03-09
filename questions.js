// DISC Assessment Questions - 400 questions (100 per dimension)
// Generated with randomization for each assessment

const questionTopics = {
    D: [
        "Quando preciso atingir um objetivo difícil",
        "Em situações competitivas",
        "Ao enfrentar desafios",
        "Quando há uma oportunidade de vencer",
        "Em decisões rápidas",
        "Liderando outros",
        "Sob pressão de tempo",
        "Resolvendo conflitos",
        "Tomando iniciativa",
        "Buscando crescimento"
    ],
    I: [
        "Ao interagir com outras pessoas",
        "Em apresentações",
        "Persuadindo alguém",
        "Criando conexões",
        "Trabalhando em equipe",
        "Compartilhando ideias",
        "Em ambientes sociais",
        "Motivando outros",
        "Comunicando-me",
        "Colaborando"
    ],
    S: [
        "Quando procuro estabilidade",
        "Em ambientes harmonioso",
        "Mantendo relacionamentos",
        "Apoiando colegas",
        "Seguindo rotina",
        "Em situações familiares",
        "Buscando segurança",
        "Sendo leal",
        "Oferecendo suporte",
        "Mantendo paz"
    ],
    C: [
        "Quando preciso analisar dados",
        "Em tarefas complexas",
        "Assegurando qualidade",
        "Seguindo procedimentos",
        "Planejando detalhadamente",
        "Verificando informações",
        "Mantendo padrões",
        "Organizando informação",
        "Sendo sistemático",
        "Revisando completamente"
    ]
};

const questionSubjects = {
    D: [
        "eu gosto de estar no comando",
        "prefiro agir rapidamente",
        "busco ser o melhor",
        "gosto de competir",
        "sou ambicioso",
        "tomo decisões firmes",
        "sou confiante",
        "persigo meus objetivos",
        "sou direto",
        "sou determinado"
    ],
    I: [
        "adoro conversas",
        "sou entusiasmado",
        "gosto de atenção",
        "sou amigável",
        "sou comunicativo",
        "inspiro outros",
        "sou otimista",
        "sou expressivo",
        "construo relacionamentos",
        "sou animado"
    ],
    S: [
        "valorizo estabilidade",
        "sou paciente",
        "sou leal",
        "apoio outros",
        "sou confiável",
        "gosto de harmonia",
        "sou consistente",
        "sou calmo",
        "gosto de previsibilidade",
        "sou solidário"
    ],
    C: [
        "sou detalhista",
        "sigo regras",
        "sou organizado",
        "sou analítico",
        "busco excelência",
        "sou metódico",
        "sou preciso",
        "verifico tudo",
        "sou sistemático",
        "sou cuidadoso"
    ]
};

const responses = {
    D: [
        "Totalmente concordo",
        "Concordo muito",
        "Definitivamente me descreve",
        "Isso reflete bem meu estilo",
        "É exatamente assim comigo",
        "Concordo plenamente",
        "Muito verdadeiro",
        "Sem dúvida",
        "Perfeito para mim",
        "100% condiz comigo"
    ],
    I: [
        "Sim, muito",
        "Com certeza",
        "Absolutamente",
        "Muito verdadeiro",
        "Definitivamente",
        "Concordo bastante",
        "Muito bem",
        "É verdade",
        "Concordo demais",
        "Muito mesmo"
    ],
    S: [
        "Sim, bastante",
        "De certa forma",
        "Geralmente",
        "Na maioria das vezes",
        "Muito apropriado",
        "Bem verdadeiro",
        "Concordo",
        "Bastante",
        "Muito sim",
        "Frequentemente"
    ],
    C: [
        "Completamente",
        "Absolutamente",
        "Totalmente correto",
        "Exatamente",
        "Bem assim",
        "Precisamente",
        "Rigorosamente",
        "Fielmente",
        "Certamente",
        "De fato"
    ]
};

const alternativeResponses = [
    "Não concordo",
    "Não descreve bem",
    "Não é comigo",
    "Raramente assim",
    "Não típicamente",
    "Não geralmente",
    "Discordo",
    "Não se aplica",
    "Não muito",
    "Diferente de mim"
];

// Generate 400 questions dynamically
function generateDiscQuestions() {
    const questions = [];
    let questionId = 1;

    // Generate 100 D questions
    for (let i = 0; i < 100; i++) {
        questions.push({
            id: questionId++,
            dimension: 'D',
            text: `${questionTopics.D[i % 10]}, ${questionSubjects.D[Math.floor(i / 10) % 10]}:`,
            options: [
                { text: responses.D[i % 10], score: { D: 4, I: 1, S: 0, C: 1 } },
                { text: alternativeResponses[i % 10], score: { D: 1, I: 2, S: 2, C: 1 } },
                { text: "De certa forma", score: { D: 2, I: 1, S: 2, C: 2 } },
                { text: "Não sei dizer", score: { D: 1, I: 1, S: 1, C: 1 } }
            ]
        });
    }

    // Generate 100 I questions
    for (let i = 0; i < 100; i++) {
        questions.push({
            id: questionId++,
            dimension: 'I',
            text: `${questionTopics.I[i % 10]}, ${questionSubjects.I[Math.floor(i / 10) % 10]}:`,
            options: [
                { text: responses.I[i % 10], score: { D: 1, I: 4, S: 1, C: 0 } },
                { text: alternativeResponses[i % 10], score: { D: 2, I: 1, S: 2, C: 1 } },
                { text: "Mais ou menos", score: { D: 1, I: 2, S: 2, C: 2 } },
                { text: "Depende", score: { D: 1, I: 1, S: 1, C: 1 } }
            ]
        });
    }

    // Generate 100 S questions
    for (let i = 0; i < 100; i++) {
        questions.push({
            id: questionId++,
            dimension: 'S',
            text: `${questionTopics.S[i % 10]}, ${questionSubjects.S[Math.floor(i / 10) % 10]}:`,
            options: [
                { text: responses.S[i % 10], score: { D: 0, I: 1, S: 4, C: 1 } },
                { text: alternativeResponses[i % 10], score: { D: 2, I: 2, S: 1, C: 1 } },
                { text: "Às vezes", score: { D: 1, I: 1, S: 2, C: 2 } },
                { text: "Talvez", score: { D: 1, I: 1, S: 1, C: 1 } }
            ]
        });
    }

    // Generate 100 C questions
    for (let i = 0; i < 100; i++) {
        questions.push({
            id: questionId++,
            dimension: 'C',
            text: `${questionTopics.C[i % 10]}, ${questionSubjects.C[Math.floor(i / 10) % 10]}:`,
            options: [
                { text: responses.C[i % 10], score: { D: 1, I: 0, S: 1, C: 4 } },
                { text: alternativeResponses[i % 10], score: { D: 2, I: 1, S: 2, C: 1 } },
                { text: "Parcialmente", score: { D: 1, I: 1, S: 2, C: 2 } },
                { text: "Incerto", score: { D: 1, I: 1, S: 1, C: 1 } }
            ]
        });
    }

    return questions;
}

// Get random subset of questions (28 by default for backward compatibility)
function getRandomDiscQuestions(count = 28) {
    const allQuestions = generateDiscQuestions();
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Keep original full question array for reference
const discQuestions = getRandomDiscQuestions(28);

// Profile descriptions and characteristics
const profileData = {
    D: {
        name: "Dominância",
        color: "#e74c3c",
        description: "Pessoas com alto perfil D são orientadas a resultados, competitivas e decisivas. Gostam de desafios, tomam decisões rápidas e são naturalmente assertivas. Preferem estar no controle e focam em alcançar objetivos de forma eficiente.",
        strengths: [
            "Tomada de decisão rápida",
            "Foco em resultados",
            "Capacidade de liderar sob pressão",
            "Determinação e persistência",
            "Visão estratégica"
        ],
        improvements: [
            "Paciência com processos mais lentos",
            "Escuta ativa e empatia",
            "Delegação efetiva",
            "Flexibilidade nas abordagens",
            "Reconhecimento das contribuições dos outros"
        ],
        recommendations: "Ambiente ideal: Posições de liderança com autonomia para tomar decisões. Valorize suas metas claras e desafiadoras. Dê-lhe liberdade para inovar e espaço para assumir responsabilidades. Forneça feedback direto e objetivo."
    },
    I: {
        name: "Influência",
        color: "#f39c12",
        description: "Pessoas com alto perfil I são comunicativas, entusiastas e persuasivas. Adoram interagir com outros, são otimistas por natureza e têm facilidade para motivar equipes. Valorizam relacionamentos e ambientes de trabalho colaborativos.",
        strengths: [
            "Comunicação envolvente",
            "Capacidade de motivar outros",
            "Networking e relacionamentos",
            "Criatividade e inovação",
            "Entusiasmo contagiante"
        ],
        improvements: [
            "Foco e atenção aos detalhes",
            "Organização e gestão do tempo",
            "Acompanhamento de tarefas",
            "Análise antes de agir",
            "Estabelecimento de prioridades"
        ],
        recommendations: "Ambiente ideal: Trabalho em equipe com interação social frequente. Proporcione reconhecimento público e oportunidades de apresentar ideias. Evite rotinas muito rígidas e permita criatividade. Valorize suas contribuições para o clima organizacional."
    },
    S: {
        name: "Estabilidade",
        color: "#27ae60",
        description: "Pessoas com alto perfil S são pacientes, leais e confiáveis. Valorizam estabilidade e harmonia no ambiente de trabalho. São excelentes ouvintes, trabalham bem em equipe e são consistentes em suas entregas. Preferem mudanças graduais.",
        strengths: [
            "Lealdade e comprometimento",
            "Trabalho em equipe",
            "Paciência e persistência",
            "Escuta ativa",
            "Confiabilidade nas entregas"
        ],
        improvements: [
            "Adaptação a mudanças rápidas",
            "Assertividade em conflitos",
            "Tomada de decisão mais ágil",
            "Expressão de opiniões próprias",
            "Lidar com múltiplas prioridades"
        ],
        recommendations: "Ambiente ideal: Estável, com processos claros e relacionamentos de longo prazo. Evite mudanças bruscas sem explicação. Dê tempo para adaptação a novas situações. Reconheça sua lealdade e contribuição para a harmonia da equipe."
    },
    C: {
        name: "Conformidade",
        color: "#3498db",
        description: "Pessoas com alto perfil C são analíticas, precisas e sistemáticas. Valorizam qualidade, processos bem definidos e tomada de decisão baseada em dados. São detalhistas, organizadas e têm alto padrão de excelência em tudo que fazem.",
        strengths: [
            "Análise crítica e detalhista",
            "Alta precisão e qualidade",
            "Pensamento sistemático",
            "Planejamento cuidadoso",
            "Expertise técnica"
        ],
        improvements: [
            "Flexibilidade em situações ambíguas",
            "Velocidade de decisão",
            "Tolerância a imperfeições",
            "Comunicação mais direta",
            "Delegação de tarefas"
        ],
        recommendations: "Ambiente ideal: Estruturado, com acesso a informações e tempo para análise. Valorize seu trabalho de qualidade e expertise. Forneça especificações claras e evite pressão por decisões rápidas. Reconheça sua atenção aos detalhes."
    }
};
