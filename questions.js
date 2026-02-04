// DISC Assessment Questions - 28 questions (7 per dimension)
const discQuestions = [
    // Dominância (D) - Questions 1-7
    {
        id: 1,
        text: "Em situações de conflito no trabalho, eu geralmente:",
        options: [
            { text: "Enfrento diretamente e busco resolver rapidamente", score: { D: 4, I: 1, S: 0, C: 1 } },
            { text: "Tento mediar e encontrar um meio-termo", score: { D: 1, I: 3, S: 2, C: 0 } },
            { text: "Prefiro esperar a situação se acalmar", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Analiso todos os fatos antes de me posicionar", score: { D: 1, I: 0, S: 1, C: 4 } }
        ]
    },
    {
        id: 2,
        text: "Quando preciso tomar decisões importantes:",
        options: [
            { text: "Decido rapidamente e assumo os riscos", score: { D: 4, I: 1, S: 0, C: 1 } },
            { text: "Consulto outras pessoas e considero suas opiniões", score: { D: 0, I: 3, S: 2, C: 1 } },
            { text: "Levo o tempo necessário para me sentir seguro", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Pesquiso dados e informações detalhadamente", score: { D: 1, I: 0, S: 0, C: 4 } }
        ]
    },
    {
        id: 3,
        text: "Em um projeto de equipe, eu naturalmente:",
        options: [
            { text: "Assumo a liderança e direciono as ações", score: { D: 4, I: 1, S: 0, C: 1 } },
            { text: "Motivo o time e mantenho o ambiente positivo", score: { D: 1, I: 4, S: 1, C: 0 } },
            { text: "Apoio os colegas e garanto harmonia", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Organizo processos e verifico a qualidade", score: { D: 1, I: 0, S: 1, C: 4 } }
        ]
    },
    {
        id: 4,
        text: "Quando enfrento obstáculos no trabalho:",
        options: [
            { text: "Vejo como desafios a serem superados", score: { D: 4, I: 1, S: 0, C: 1 } },
            { text: "Busco ajuda e trabalho colaborativamente", score: { D: 0, I: 3, S: 2, C: 1 } },
            { text: "Mantenho a calma e persisto pacientemente", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Analiso as causas antes de agir", score: { D: 1, I: 0, S: 1, C: 4 } }
        ]
    },
    {
        id: 5,
        text: "Minha principal motivação no trabalho é:",
        options: [
            { text: "Alcançar resultados e superar metas", score: { D: 4, I: 1, S: 0, C: 1 } },
            { text: "Reconhecimento e interação com pessoas", score: { D: 1, I: 4, S: 1, C: 0 } },
            { text: "Estabilidade e ambiente harmonioso", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Fazer um trabalho de alta qualidade", score: { D: 1, I: 0, S: 1, C: 4 } }
        ]
    },
    {
        id: 6,
        text: "Em reuniões de trabalho, eu costumo:",
        options: [
            { text: "Ir direto ao ponto e focar nas decisões", score: { D: 4, I: 1, S: 0, C: 1 } },
            { text: "Participar ativamente e propor ideias", score: { D: 1, I: 4, S: 1, C: 0 } },
            { text: "Ouvir mais do que falar", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Fazer anotações e questionar detalhes", score: { D: 1, I: 0, S: 1, C: 4 } }
        ]
    },
    {
        id: 7,
        text: "Quando recebo críticas sobre meu trabalho:",
        options: [
            { text: "Defendo minha posição com argumentos", score: { D: 4, I: 1, S: 0, C: 1 } },
            { text: "Tento entender e manter o relacionamento", score: { D: 0, I: 3, S: 2, C: 1 } },
            { text: "Aceito e reflito sobre o que foi dito", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Peço exemplos específicos e dados", score: { D: 1, I: 0, S: 1, C: 4 } }
        ]
    },

    // Influência (I) - Questions 8-14
    {
        id: 8,
        text: "Em eventos sociais da empresa, eu:",
        options: [
            { text: "Prefiro conversas breves e objetivas", score: { D: 3, I: 1, S: 1, C: 1 } },
            { text: "Adoro conhecer pessoas novas e socializar", score: { D: 0, I: 4, S: 1, C: 1 } },
            { text: "Fico mais à vontade com pessoas conhecidas", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Observo mais do que participo", score: { D: 1, I: 0, S: 2, C: 3 } }
        ]
    },
    {
        id: 9,
        text: "Quando preciso convencer alguém:",
        options: [
            { text: "Uso argumentos diretos e assertivos", score: { D: 4, I: 1, S: 0, C: 1 } },
            { text: "Uso entusiasmo e crio conexão emocional", score: { D: 0, I: 4, S: 1, C: 1 } },
            { text: "Sou paciente e construo confiança aos poucos", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Apresento dados e evidências", score: { D: 1, I: 0, S: 0, C: 4 } }
        ]
    },
    {
        id: 10,
        text: "Meu estilo de comunicação é mais:",
        options: [
            { text: "Direto e focado em resultados", score: { D: 4, I: 1, S: 0, C: 1 } },
            { text: "Expressivo e animado", score: { D: 0, I: 4, S: 1, C: 1 } },
            { text: "Calmo e atencioso", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Preciso e detalhado", score: { D: 1, I: 0, S: 1, C: 4 } }
        ]
    },
    {
        id: 11,
        text: "Quando trabalho em equipe, valorizo mais:",
        options: [
            { text: "Eficiência e foco nos objetivos", score: { D: 4, I: 1, S: 0, C: 1 } },
            { text: "Ambiente alegre e colaborativo", score: { D: 0, I: 4, S: 1, C: 1 } },
            { text: "Harmonia e cooperação", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Organização e procedimentos claros", score: { D: 1, I: 0, S: 1, C: 4 } }
        ]
    },
    {
        id: 12,
        text: "Ao apresentar ideias novas, eu:",
        options: [
            { text: "Vou direto ao ponto e destaco benefícios", score: { D: 4, I: 1, S: 0, C: 1 } },
            { text: "Conto histórias e uso exemplos inspiradores", score: { D: 0, I: 4, S: 1, C: 1 } },
            { text: "Apresento de forma gradual e não invasiva", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Preparo documentação detalhada", score: { D: 1, I: 0, S: 1, C: 4 } }
        ]
    },
    {
        id: 13,
        text: "Minha reação a mudanças inesperadas é:",
        options: [
            { text: "Vejo como oportunidade de agir", score: { D: 4, I: 1, S: 0, C: 1 } },
            { text: "Me adapto rapidamente e vejo o lado positivo", score: { D: 1, I: 4, S: 0, C: 1 } },
            { text: "Preciso de tempo para processar", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Questiono os motivos e impactos", score: { D: 1, I: 0, S: 1, C: 4 } }
        ]
    },
    {
        id: 14,
        text: "Quando alguém está desanimado no trabalho, eu:",
        options: [
            { text: "Dou conselhos práticos para resolver", score: { D: 3, I: 1, S: 1, C: 1 } },
            { text: "Tento animar e motivar a pessoa", score: { D: 0, I: 4, S: 1, C: 1 } },
            { text: "Ouço com paciência e ofereço apoio", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Ajudo a analisar a situação objetivamente", score: { D: 1, I: 0, S: 1, C: 4 } }
        ]
    },

    // Estabilidade (S) - Questions 15-21
    {
        id: 15,
        text: "Em relação ao meu ambiente de trabalho:",
        options: [
            { text: "Prefiro ambientes dinâmicos e desafiadores", score: { D: 4, I: 1, S: 0, C: 1 } },
            { text: "Gosto de lugares animados e sociais", score: { D: 0, I: 4, S: 1, C: 1 } },
            { text: "Prefiro estabilidade e rotina previsível", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Preciso de um ambiente organizado", score: { D: 1, I: 0, S: 1, C: 4 } }
        ]
    },
    {
        id: 16,
        text: "Quando há mudanças na empresa, eu:",
        options: [
            { text: "Lidero as mudanças se necessário", score: { D: 4, I: 1, S: 0, C: 1 } },
            { text: "Abraço com entusiasmo", score: { D: 1, I: 4, S: 0, C: 1 } },
            { text: "Preciso entender bem antes de aceitar", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Avalio riscos e impactos cuidadosamente", score: { D: 1, I: 0, S: 1, C: 4 } }
        ]
    },
    {
        id: 17,
        text: "Meu ritmo de trabalho é geralmente:",
        options: [
            { text: "Rápido e focado em entregas", score: { D: 4, I: 1, S: 0, C: 1 } },
            { text: "Variável conforme meu estado de ânimo", score: { D: 1, I: 3, S: 1, C: 1 } },
            { text: "Constante e regular", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Metódico e cuidadoso", score: { D: 1, I: 0, S: 1, C: 4 } }
        ]
    },
    {
        id: 18,
        text: "Em situações de pressão e prazos apertados:",
        options: [
            { text: "Acelero e produzo mais sob pressão", score: { D: 4, I: 1, S: 0, C: 1 } },
            { text: "Mobilizo a equipe e mantenho o ânimo", score: { D: 1, I: 4, S: 0, C: 1 } },
            { text: "Mantenho a calma e sigo passo a passo", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Priorizo e organizo as tarefas", score: { D: 1, I: 0, S: 1, C: 4 } }
        ]
    },
    {
        id: 19,
        text: "Quando começo um novo projeto, eu:",
        options: [
            { text: "Quero começar imediatamente", score: { D: 4, I: 1, S: 0, C: 1 } },
            { text: "Fico empolgado e compartilho com todos", score: { D: 0, I: 4, S: 1, C: 1 } },
            { text: "Prefiro entender bem o contexto primeiro", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Faço um planejamento detalhado", score: { D: 1, I: 0, S: 1, C: 4 } }
        ]
    },
    {
        id: 20,
        text: "Minha lealdade em relação à empresa é:",
        options: [
            { text: "Baseada em oportunidades de crescimento", score: { D: 3, I: 2, S: 0, C: 1 } },
            { text: "Ligada às pessoas e relacionamentos", score: { D: 0, I: 3, S: 2, C: 1 } },
            { text: "Forte - valorizo estabilidade", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Depende da empresa cumprir suas promessas", score: { D: 1, I: 0, S: 1, C: 4 } }
        ]
    },
    {
        id: 21,
        text: "Quando há conflitos na equipe, minha tendência é:",
        options: [
            { text: "Resolver rapidamente e seguir em frente", score: { D: 4, I: 1, S: 0, C: 1 } },
            { text: "Mediar e restabelecer a harmonia", score: { D: 0, I: 3, S: 2, C: 1 } },
            { text: "Evitar confrontos e buscar paz", score: { D: 0, I: 1, S: 4, C: 1 } },
            { text: "Entender todos os lados antes de opinar", score: { D: 1, I: 0, S: 1, C: 4 } }
        ]
    },

    // Conformidade (C) - Questions 22-28
    {
        id: 22,
        text: "Ao receber uma nova tarefa, eu primeiro:",
        options: [
            { text: "Começo a executar imediatamente", score: { D: 4, I: 1, S: 0, C: 1 } },
            { text: "Discuto com colegas sobre abordagens", score: { D: 0, I: 3, S: 2, C: 1 } },
            { text: "Busco instruções claras", score: { D: 0, I: 1, S: 3, C: 2 } },
            { text: "Leio todas as informações disponíveis", score: { D: 1, I: 0, S: 0, C: 4 } }
        ]
    },
    {
        id: 23,
        text: "Em relação a regras e procedimentos:",
        options: [
            { text: "Questiono se não fizerem sentido", score: { D: 3, I: 1, S: 1, C: 1 } },
            { text: "Adapto conforme a situação", score: { D: 1, I: 3, S: 1, C: 1 } },
            { text: "Sigo por respeito à ordem", score: { D: 0, I: 1, S: 3, C: 2 } },
            { text: "Sigo rigorosamente", score: { D: 0, I: 0, S: 1, C: 4 } }
        ]
    },
    {
        id: 24,
        text: "Ao entregar um trabalho, eu:",
        options: [
            { text: "Foco em entregar no prazo", score: { D: 3, I: 1, S: 1, C: 1 } },
            { text: "Adiciono um toque criativo pessoal", score: { D: 1, I: 4, S: 0, C: 1 } },
            { text: "Certifico que atende às expectativas", score: { D: 0, I: 1, S: 3, C: 2 } },
            { text: "Reviso múltiplas vezes por qualidade", score: { D: 0, I: 0, S: 1, C: 4 } }
        ]
    },
    {
        id: 25,
        text: "Minha abordagem para resolver problemas é:",
        options: [
            { text: "Intuitiva e baseada em experiência", score: { D: 3, I: 2, S: 1, C: 0 } },
            { text: "Criativa e colaborativa", score: { D: 1, I: 4, S: 1, C: 0 } },
            { text: "Passo a passo e cuidadosa", score: { D: 0, I: 1, S: 3, C: 2 } },
            { text: "Analítica e baseada em dados", score: { D: 0, I: 0, S: 0, C: 4 } }
        ]
    },
    {
        id: 26,
        text: "Quando cometo um erro no trabalho:",
        options: [
            { text: "Corrijo rapidamente e sigo em frente", score: { D: 4, I: 1, S: 0, C: 1 } },
            { text: "Compartilho e busco ajuda da equipe", score: { D: 0, I: 3, S: 2, C: 1 } },
            { text: "Fico preocupado com o impacto", score: { D: 0, I: 1, S: 3, C: 2 } },
            { text: "Analiso as causas para não repetir", score: { D: 0, I: 0, S: 1, C: 4 } }
        ]
    },
    {
        id: 27,
        text: "Minha organização pessoal no trabalho é:",
        options: [
            { text: "Funcional - encontro o que preciso", score: { D: 3, I: 1, S: 1, C: 1 } },
            { text: "Flexível e adaptável", score: { D: 1, I: 3, S: 1, C: 1 } },
            { text: "Consistente e estável", score: { D: 0, I: 1, S: 3, C: 2 } },
            { text: "Muito sistemática e detalhada", score: { D: 0, I: 0, S: 1, C: 4 } }
        ]
    },
    {
        id: 28,
        text: "Quando preciso aprender algo novo:",
        options: [
            { text: "Aprendo fazendo na prática", score: { D: 3, I: 2, S: 1, C: 0 } },
            { text: "Prefiro aprender com outras pessoas", score: { D: 0, I: 4, S: 1, C: 1 } },
            { text: "Sigo tutoriais passo a passo", score: { D: 0, I: 1, S: 3, C: 2 } },
            { text: "Estudo a teoria antes de praticar", score: { D: 0, I: 0, S: 0, C: 4 } }
        ]
    }
];

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
