import {
    FaGithub,
    FaLinkedin,
    FaEnvelope
} from 'react-icons/fa';
import s from './AboutPage.module.css';

const features = [
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
        description:
            'Projeções utilizando juros compostos.'
    },
    {
        title: 'Perfil do Usuário',
        description:
            'Gerenciamento dos dados da conta.'
    }
];

const frontendTechs = [
    'React',
    'TypeScript',
    'Vite',
    'Bootstrap',
    'Zustand',
    'React Hook Form',
    'Zod',
    'Axios'
];

const backendTechs = [
    'Java',
    'Spring Boot',
    'Spring Security',
    'JWT',
    'Hibernate',
    'JPA',
    'MySQL',
    'Maven'
];

const securityItems = [
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
        description:
            'Rotas protegidas através do Spring Security.'
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

const teamMembers = [
    {
        name: 'Ana Letícia',
        role: 'Analista de Testes',
        image: 'assets/team/ana-test-analist.jpg',
        github: 'https://github.com/analeticiarc',
        linkedin: 'https://www.linkedin.com/in/ana-let%C3%ADcia-r-b1287a246/',
        email: 'alrc1@discente.ifpe.edu.br'
    },
    {
        name: 'David Esdras',
        role: 'Desenvolvedor Fullstack',
        image: 'assets/team/david-dev-fullstack.png',
        github: 'https://github.com/DavidEsdrs',
        linkedin: 'https://www.linkedin.com/in/davidesdras/',
        email: 'defs3@discente.ifpe.edu.br'
    },
    {
        name: 'Emilly Maria',
        role: 'Product Owner',
        image: 'assets/team/emilly-po.jpg',
        github: 'https://github.com/EmillyMariaAraujo',
        linkedin: 'https://www.linkedin.com/in/emilly-maria-araujo/',
        email: 'emas7@discente.ifpe.edu.br'
    },
    {
        name: 'José Neto',
        role: 'Desenvolvedor Fullstack',
        image: 'assets/team/neto-dev-fullstack.jpg',
        github: 'https://github.com/Neto-Pereira25',
        linkedin: 'https://www.linkedin.com/in/jose-neto-programador/',
        email: 'jpsn3@discente.ifpe.edu.br'
    },
    {
        name: 'Maria Helena',
        role: 'Analista de Testes',
        image: 'assets/team/maria-helena-test-analist.jpg',
        github: 'https://github.com/HelenaSilva0',
        linkedin: 'https://www.linkedin.com/in/maria-helena-5a037a26b/',
        email: 'mh14s@discente.ifpe.edu.br'
    }
];

const statistics = [
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

const roadmap = [
    {
        title: 'Sprint 1',
        status: 'Concluído',
        description:
            'Autenticação, dashboard e transações.'
    },
    {
        title: 'Sprint 2',
        status: 'Concluído',
        description:
            'Metas financeiras e limite de gastos.'
    },
    {
        title: 'Sprint 3',
        status: 'Em desenvolvimento',
        description:
            'Relatórios e melhorias de usabilidade.'
    }
];

const differentials = [
    'Interface simples e intuitiva',
    'Arquitetura moderna com React e Spring Boot',
    'Controle financeiro centralizado',
    'Planejamento financeiro através de metas',
    'Simulação de investimentos',
    'Autenticação segura com JWT'
];

export default function AboutPage() {
    return (
        <div className={s.container}>
            <section className={s.hero}>
                <h1>Sobre o InvestCalc</h1>

                <p>
                    Organizando suas finanças de forma simples,
                    segura e inteligente.
                </p>
            </section>

            <section className={s.section}>
                <h2>Apresentação do Projeto</h2>

                <div className={s.card}>
                    <p>
                        O InvestCalc é uma plataforma web desenvolvida
                        para auxiliar usuários no gerenciamento de
                        finanças pessoais através do controle de receitas,
                        despesas, metas financeiras, limites de gastos
                        e simulações de investimentos.
                    </p>

                    <p>
                        O sistema foi criado com foco em educação
                        financeira, organização e tomada de decisão
                        baseada em dados.
                    </p>
                </div>
            </section>

            <section className={s.section}>
                <h2>Principais Funcionalidades</h2>

                <div className={s.grid}>
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className={s.card}
                        >
                            <h3>{feature.title}</h3>

                            <p>
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className={s.section}>
                <h2>Tecnologias Utilizadas</h2>

                <div className={s.techContainer}>
                    <div className={s.card}>
                        <h3>Frontend</h3>

                        <ul>
                            {frontendTechs.map((tech) => (
                                <li key={tech}>{tech}</li>
                            ))}
                        </ul>
                    </div>

                    <div className={s.card}>
                        <h3>Backend</h3>

                        <ul>
                            {backendTechs.map((tech) => (
                                <li key={tech}>{tech}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section className={s.section}>
                <h2>Segurança e Privacidade</h2>

                <div className={s.grid}>
                    {securityItems.map((item) => (
                        <div
                            key={item.title}
                            className={s.card}
                        >
                            <h3>{item.title}</h3>

                            <p>{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className={s.section}>
                <h2>Missão e Visão</h2>

                <div className={s.missionGrid}>
                    <div className={s.card}>
                        <h3>Missão</h3>

                        <p>
                            Auxiliar pessoas a desenvolver uma
                            relação mais saudável com suas finanças
                            através da tecnologia, organização e
                            educação financeira.
                        </p>
                    </div>

                    <div className={s.card}>
                        <h3>Visão</h3>

                        <p>
                            Tornar o gerenciamento financeiro
                            acessível, intuitivo e eficiente para
                            qualquer usuário, contribuindo para
                            decisões financeiras mais conscientes.
                        </p>
                    </div>
                </div>
            </section>

            <section className={s.section}>
                <h2>Informações do Projeto</h2>

                <div className={s.grid}>
                    <div className={s.card}>
                        <h3>Versão</h3>
                        <p>InvestCalc v1.0</p>
                    </div>

                    <div className={s.card}>
                        <h3>Instituição</h3>
                        <p>
                            Projeto acadêmico desenvolvido para a
                            disciplina de Projeto de Desenvolvimento
                            de Software Corporativo.
                        </p>
                    </div>

                    <div className={s.card}>
                        <h3>Ano</h3>
                        <p>2026</p>
                    </div>

                    <div className={s.card}>
                        <h3>Finalidade</h3>
                        <p>
                            Apoiar a gestão de finanças
                            pessoais através de recursos digitais.
                        </p>
                    </div>
                </div>
            </section>

            <section className={s.section}>
                <h2>Equipe Desenvolvedora</h2>

                <p className={s.teamDescription}>
                    O InvestCalc foi desenvolvido por uma equipe
                    multidisciplinar composta por estudantes
                    responsáveis pelo planejamento, desenvolvimento,
                    testes e evolução da aplicação.
                </p>

                <div className={s.teamGrid}>
                    {teamMembers.map((member) => (
                        <div
                            key={member.email}
                            className={s.teamCard}
                        >
                            <img
                                src={member.image}
                                alt={member.name}
                                className={s.avatar}
                            />

                            <h3>{member.name}</h3>

                            <span className={s.role}>
                                {member.role}
                            </span>

                            <div className={s.links}>
                                <a
                                    href={member.github}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <FaGithub />
                                </a>

                                <a
                                    href={member.linkedin}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <FaLinkedin />
                                </a>

                                <a
                                    href={`mailto:${member.email}`}
                                >
                                    <FaEnvelope />
                                </a>
                            </div>

                            <p className={s.email}>
                                {member.email}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className={s.section}>
                <h2>Métricas do Projeto</h2>

                <div className={s.statsGrid}>
                    {statistics.map((stat) => (
                        <div key={stat.label} className={s.statCard}>
                            <span className={s.statValue}>
                                {stat.value}
                            </span>

                            <span className={s.statLabel}>
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            <section className={s.section}>
                <h2>Evolução do Projeto</h2>

                <div className={s.roadmap}>
                    {roadmap.map((item) => (
                        <div key={item.title} className={s.roadmapCard}>
                            <h3>{item.title}</h3>

                            <span className={s.badge}>
                                {item.status}
                            </span>

                            <p>{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>
            <section className={s.section}>
                <h2>Diferenciais</h2>

                <div className={s.grid}>
                    {differentials.map((item) => (
                        <div
                            key={item}
                            className={s.card}
                        >
                            ✓ {item}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}