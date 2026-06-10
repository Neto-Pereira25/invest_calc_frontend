import type {
    InfoItem,
    RoadmapItem,
    StatisticItem,
    TeamMember,
    TechStackGroup
} from './about.types';

export const features: InfoItem[] = [
    {
        title: 'Dashboard Financeiro',
        description:
            'Visualização consolidada de receitas, despesas e saldo disponível.'
    },
    {
        title: 'Controle de Transações',
        description:
            'Cadastro, edição e exclusão de receitas e despesas.'
    },
    {
        title: 'Metas Financeiras',
        description:
            'Criação e acompanhamento de objetivos financeiros.'
    },
    {
        title: 'Limite de Gastos',
        description:
            'Definição de orçamento mensal para controle financeiro.'
    },
    {
        title: 'Simulador de Investimentos',
        description: 'Projeções utilizando juros compostos.'
    },
    {
        title: 'Perfil do Usuário',
        description: 'Gerenciamento dos dados da conta.'
    }
];

export const techStack: TechStackGroup[] = [
    {
        title: 'Frontend',
        techs: [
            'React',
            'TypeScript',
            'Vite',
            'Bootstrap',
            'Zustand',
            'React Hook Form',
            'Zod',
            'Axios'
        ]
    },
    {
        title: 'Backend',
        techs: [
            'Java',
            'Spring Boot',
            'Spring Security',
            'JWT',
            'Hibernate',
            'JPA',
            'MySQL',
            'Maven'
        ]
    }
];

export const securityItems: InfoItem[] = [
    {
        title: 'Autenticação JWT',
        description:
            'O sistema utiliza JSON Web Tokens para autenticação e autorização dos usuários.'
    },
    {
        title: 'Senhas Protegidas',
        description:
            'As senhas são armazenadas utilizando criptografia BCrypt.'
    },
    {
        title: 'Controle de Acesso',
        description: 'Rotas protegidas através do Spring Security.'
    },
    {
        title: 'Validação de Dados',
        description:
            'Validações realizadas no frontend e backend garantem integridade das informações.'
    },
    {
        title: 'Privacidade',
        description:
            'Os dados financeiros são utilizados exclusivamente para gerenciamento pessoal.'
    },
    {
        title: 'Arquitetura Segura',
        description:
            'Separação entre frontend e backend utilizando APIs protegidas.'
    }
];

export const missionAndVision: InfoItem[] = [
    {
        title: 'Missão',
        description:
            'Auxiliar pessoas a desenvolver uma relação mais saudável com suas finanças através da tecnologia, organização e educação financeira.'
    },
    {
        title: 'Visão',
        description:
            'Tornar o gerenciamento financeiro acessível, intuitivo e eficiente para qualquer usuário, contribuindo para decisões financeiras mais conscientes.'
    }
];

export const projectInfo: InfoItem[] = [
    {
        title: 'Versão',
        description: 'InvestCalc v1.0'
    },
    {
        title: 'Instituição',
        description:
            'Projeto acadêmico desenvolvido para a disciplina de Projeto de Desenvolvimento de Software Corporativo.'
    },
    {
        title: 'Ano',
        description: '2026'
    },
    {
        title: 'Finalidade',
        description:
            'Apoiar a gestão de finanças pessoais através de recursos digitais.'
    }
];

export const teamMembers: TeamMember[] = [
    {
        name: 'Ana Letícia',
        role: 'Analista de Testes',
        image: '/assets/team/ana-test-analist.jpg',
        github: 'https://github.com/analeticiarc',
        linkedin: 'https://www.linkedin.com/in/ana-let%C3%ADcia-r-b1287a246/',
        email: 'alrc1@discente.ifpe.edu.br'
    },
    {
        name: 'David Esdras',
        role: 'Desenvolvedor Fullstack',
        image: '/assets/team/david-dev-fullstack.png',
        github: 'https://github.com/DavidEsdrs',
        linkedin: 'https://www.linkedin.com/in/davidesdras/',
        email: 'defs3@discente.ifpe.edu.br'
    },
    {
        name: 'Emilly Maria',
        role: 'Product Owner',
        image: '/assets/team/emilly-po.jpg',
        github: 'https://github.com/EmillyMariaAraujo',
        linkedin: 'https://www.linkedin.com/in/emilly-maria-araujo/',
        email: 'emas7@discente.ifpe.edu.br'
    },
    {
        name: 'José Neto',
        role: 'Desenvolvedor Fullstack',
        image: '/assets/team/neto-dev-fullstack.jpg',
        github: 'https://github.com/Neto-Pereira25',
        linkedin: 'https://www.linkedin.com/in/jose-neto-programador/',
        email: 'jpsn3@discente.ifpe.edu.br'
    },
    {
        name: 'Maria Helena',
        role: 'Analista de Testes',
        image: '/assets/team/maria-helena-test-analist.jpg',
        github: 'https://github.com/HelenaSilva0',
        linkedin: 'https://www.linkedin.com/in/maria-helena-5a037a26b/',
        email: 'mh14s@discente.ifpe.edu.br'
    }
];

export const statistics: StatisticItem[] = [
    {
        value: '10+',
        label: 'Funcionalidades'
    },
    {
        value: '5',
        label: 'Integrantes'
    },
    {
        value: '2',
        label: 'Módulos Principais'
    },
    {
        value: '100%',
        label: 'Responsivo'
    }
];

export const roadmap: RoadmapItem[] = [
    {
        title: 'Sprint 1',
        status: 'Concluído',
        description: 'Autenticação, dashboard, transações e simulação de juros compostos.'
    },
    {
        title: 'Sprint 2',
        status: 'Concluído',
        description: 'Metas financeiras, limite de gastos, alertas, notificações e recuperação de senha.'
    },
    {
        title: 'Sprint 3',
        status: 'Em desenvolvimento',
        description: 'Relatórios e melhorias de usabilidade.'
    }
];

export const differentials: string[] = [
    'Interface simples e intuitiva',
    'Arquitetura moderna com React e Spring Boot',
    'Controle financeiro centralizado',
    'Planejamento financeiro através de metas',
    'Simulação de investimentos',
    'Autenticação segura com JWT'
];
