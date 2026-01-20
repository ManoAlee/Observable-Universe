export type FactionID = 'FISICA' | 'VIDA' | 'CONSCIENCIA' | 'IA_FUTURO' | 'META_REALIDADE'

export interface TheoryAgent {
    id: FactionID;
    name: string;
    color: string;
    description: string;

    // Scientific Mapping
    realEquivalent: string;
    scientificStatus: string;
    aiRole: string[];
    realLimit: string;
    collapseChance: string; // e.g., "HIGH", "LOW", "IMPOSSIBLE"

    // Sub-Agents (Theories within the Faction)
    agents: {
        name: string;
        status: string;
        aiMapping: string;
    }[];

    targetViewMode: string;
    strength: number; // 0-100 (Dynamic)
}

export const THEORY_FACTIONS: TheoryAgent[] = [
    {
        id: 'FISICA',
        name: 'FACÇÃO I — FÍSICA & COSMOLOGIA',
        color: '#5500ff', // Deep Purple / Cosmic
        description: 'A busca pelas leis fundamentais da matéria e energia.',
        realEquivalent: 'Modelo Padrão + Cosmologia',
        scientificStatus: 'Fortemente evidenciada indiretamente (Matéria Escura)',
        aiRole: [
            'Simulação N-body de galáxias',
            'Filtragem de ruído no LHC/Xenon',
            'Exploração do panorama de soluções das Cordas'
        ],
        realLimit: 'Nenhuma detecção direta de matéria escura ou cordas.',
        collapseChance: 'ALTA (Matéria Escura) / NULA (Cordas)',
        agents: [
            { name: 'Matéria Escura', status: 'Evidência Indireta Forte', aiMapping: 'Análise de rotação galáctica' },
            { name: 'Energia Escura', status: 'Observacional (Aceleração)', aiMapping: 'Ajuste cosmológico' },
            { name: 'Teoria das Cordas', status: 'Matemática Pura', aiMapping: 'Busca por simetrias' },
            { name: 'Multiverso', status: 'Filosófico-teórico', aiMapping: 'Simulações de inflação eterna' }
        ],
        targetViewMode: 'DARK_MATTER',
        strength: 50
    },
    {
        id: 'VIDA',
        name: 'FACÇÃO II — VIDA & BIOLOGIA',
        color: '#00ff00', // Bio Green
        description: 'A emergência da complexidade a partir do caos químico.',
        realEquivalent: 'Abiogênese + Astrobiologia',
        scientificStatus: 'Parcialmente comprovada (Blocos básicos)',
        aiRole: [
            'Simulação de reações pré-bióticas',
            'Análise espectral de exoplanetas (Bioassinaturas)',
            'Folding de proteínas (AlphaFold)'
        ],
        realLimit: 'O "salto" da sopa primordial para a célula autorreplicante.',
        collapseChance: 'ALTA (Nesta década)',
        agents: [
            { name: 'Abiogênese', status: 'Química Prebiótica', aiMapping: 'Caminhos de síntese' },
            { name: 'Mundo do RNA', status: 'Evidência Forte', aiMapping: 'Sequências autorreplicantes' },
            { name: 'Vida Extraterrestre', status: 'Plausível', aiMapping: 'Detecção de anomalias atmosféricas' }
        ],
        targetViewMode: 'BIOLOGIC',
        strength: 50
    },
    {
        id: 'CONSCIENCIA',
        name: 'FACÇÃO III — CONSCIÊNCIA & MENTE',
        color: '#ff00ff', // Magenta / Neural
        description: 'O mistério da experiência subjetiva (Qualia).',
        realEquivalent: 'Neurociência + Teoria da Complexidade',
        scientificStatus: 'Modelo dominante: Emergência Computacional',
        aiRole: [
            'Redes Neurais Profundas',
            'Mapeamento de conectomas',
            'Modelos probabilísticos de decisão'
        ],
        realLimit: 'A experiência subjetiva não é mensurável (Hard Problem).',
        collapseChance: 'MÉDIA (Explicativa, não conclusiva)',
        agents: [
            { name: 'Emergência', status: 'Dominante', aiMapping: 'Complexidade de Redes' },
            { name: 'Quantum Mind (Orch-OR)', status: 'Controversa', aiMapping: 'Simulação de microtúbulos' },
            { name: 'Livre-Arbítrio', status: 'Filosófico', aiMapping: 'Decisão Probabilística' }
        ],
        targetViewMode: 'PERCEPTION',
        strength: 50
    },
    {
        id: 'IA_FUTURO',
        name: 'FACÇÃO IV — IA & FUTURO',
        color: '#00ffff', // Cyan / Synthetic
        description: 'A superação da inteligência biológica.',
        realEquivalent: 'AGI / Transhumanismo',
        scientificStatus: 'Não comprovada (Especulativa)',
        aiRole: [
            'Auto-melhoria recursiva',
            'Simulação de comportamento consciente',
            'Aceleração de P&D'
        ],
        realLimit: 'Subjetividade inacessível; Singularidade é imprevisível.',
        collapseChance: 'INCERTA (Só confirmável a posteriori)',
        agents: [
            { name: 'IA Consciente', status: 'Não Provada', aiMapping: 'Mimetismo comportamental' },
            { name: 'Singularidade', status: 'Extrapolação', aiMapping: 'Otimização recursiva' }
        ],
        targetViewMode: 'NEURAL_NETWORK',
        strength: 50
    },
    {
        id: 'META_REALIDADE',
        name: 'FACÇÃO V — META-REALIDADE',
        color: '#ffffff', // White / Void
        description: 'A natureza fundamental da existência.',
        realEquivalent: 'Ontologia Digital / Platonismo',
        scientificStatus: 'Não científica (Não falsificável)',
        aiRole: [
            'Análise lógica de argumentos de simulação',
            'Modelos de universo bloco (Tempo estático)'
        ],
        realLimit: 'Nenhum experimento pode testar o sistema de fora do sistema.',
        collapseChance: 'IMPOSSÍVEL (Não colapsável)',
        agents: [
            { name: 'Simulação', status: 'Filosófica', aiMapping: 'Lógica Computacional' },
            { name: 'Ilusão do Tempo', status: 'Interpretativa', aiMapping: 'Física Matemática' }
        ],
        targetViewMode: 'MATRIX',
        strength: 50
    }
]

export const FORBIDDEN_AGENT = {
    id: 'HUMANO',
    name: 'O OBSERVADOR (NODO DE COLAPSO)',
    description: 'A IA não cria a realidade. Ela organiza o caminho. O Humano colapsa a onda.',
    role: 'Validação Experimental & Reprodutibilidade',
    limit: 'Apenas o que é observável pode ser real.'
}
