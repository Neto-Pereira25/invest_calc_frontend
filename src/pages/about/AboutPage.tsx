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
        </div>
    );
}