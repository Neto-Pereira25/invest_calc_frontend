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
        </div>
    );
}