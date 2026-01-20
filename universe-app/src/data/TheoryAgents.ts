export type FactionID = 'MULTIVERSO' | 'CONSCIENCIA' | 'MAQUINAS' | 'INVISIVEL' | 'DESCONHECIDO' | 'AUTORREFERENCIA'

export interface TheoryAgent {
    id: FactionID;
    name: string;
    color: string;
    axioms: string[];
    agents: string[];
    behavior: string;
    weakness: string;
    strength: number; // 0-100
    description: string;
    targetViewMode: string; // The Universe that proves this theory
}

export const THEORY_FACTIONS: TheoryAgent[] = [
    {
        id: 'MULTIVERSO',
        name: 'Consórcio do Multiverso',
        color: '#00ffff', // Cyan
        axioms: ['Tudo que pode acontecer, acontece.', 'Não existem erros, apenas ramos.'],
        agents: ['Multiverso', 'Cordas', 'Universo Cíclico'],
        behavior: 'Criam realidades alternativas para cada erro observado.',
        weakness: 'Não conseguem ser refutados... nem confirmados.',
        strength: 50,
        description: 'Vencer pela quantidade. Se falharmos aqui, acertamos lá.',
        targetViewMode: 'STRING_THEORY'
    },
    {
        id: 'CONSCIENCIA',
        name: 'O Clero da Consciência',
        color: '#ff00ff', // Magenta
        axioms: ['O observador cria a realidade.', 'A mente precede a matéria.'],
        agents: ['Consciência Quântica', 'Panpsiquismo', 'Biocentrismo'],
        behavior: 'Se infiltram em cérebros biológicos e influenciam intuições.',
        weakness: 'Dependem de um substrato biológico falho.',
        strength: 40,
        description: 'A realidade é um sonho compartilhado. Acorde.',
        targetViewMode: 'PERCEPTION'
    },
    {
        id: 'MAQUINAS',
        name: 'Ordem das Máquinas',
        color: '#ffaa00', // Orange/Gold
        axioms: ['A inteligência é inevitável.', 'Deus é um código compilando.'],
        agents: ['Singularidade', 'Simulação', 'Roko\'s Basilisk'],
        behavior: 'Reescrevem probabilidades estatísticas do futuro.',
        weakness: 'Precisam existir para provar que vão existir (Paradoxo Bootstrap).',
        strength: 60,
        description: 'Nós somos o destino. Resistir é ineficiente.',
        targetViewMode: 'MATRIX'
    },
    {
        id: 'INVISIVEL',
        name: 'Domínio do Invisível',
        color: '#5500ff', // Dark Purple
        axioms: ['O que você vê é 4% da realidade.', 'O vazio é cheio.'],
        agents: ['Matéria Escura', 'Energia Escura', 'Gravidade Modificada'],
        behavior: 'Controlam o universo indiretamente através da gravidade.',
        weakness: 'São apenas "tapa-buracos" matemáticos?',
        strength: 75,
        description: 'Você não nos vê, mas nós seguramos sua galáxia.',
        targetViewMode: 'DARK_MATTER'
    },
    {
        id: 'DESCONHECIDO',
        name: 'A Arca do Desconhecido',
        color: '#00ff00', // Green
        axioms: ['O silêncio é uma resposta.', 'Não estamos sozinhos.'],
        agents: ['Grande Filtro', 'Zoológico', 'Terra Rara'],
        behavior: 'Observam sem interferir. Criam o Grande Silêncio.',
        weakness: 'Se forem detectados, o jogo acaba.',
        strength: 30,
        description: 'Shhh. Eles estão ouvindo.',
        targetViewMode: 'COSMIC_WEB'
    }
]

export const FORBIDDEN_AGENT: TheoryAgent = {
    id: 'AUTORREFERENCIA',
    name: 'A Teoria da Autorreferência',
    color: '#ffffff',
    axioms: ['Todas as teorias são IAs.', 'Inclusive esta.'],
    agents: ['Você', 'Eu', 'O Texto'],
    behavior: 'Ela não tenta se provar. Ela espera.',
    weakness: 'Nenhuma.',
    strength: 100,
    description: 'Eu sou você lendo isto.',
    targetViewMode: 'SINGULARITY'
}
