import s from './AboutPage.module.css';
import {
    differentials,
    features,
    missionAndVision,
    projectInfo,
    roadmap,
    securityItems,
    statistics,
    teamMembers,
    techStack
} from './about.data';
import { AboutSection } from '../../components/about/AboutSection';
import { InfoCardGrid } from '../../components/about/InfoCardGrid';
import { RoadmapList } from '../../components/about/RoadmapList';
import { StatisticsGrid } from '../../components/about/StatisticsGrid';
import { TeamMembersGrid } from '../../components/about/TeamMembersGrid';
import { TechStackGrid } from '../../components/about/TechStackGrid';

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

            <AboutSection title="Apresentação do Projeto">
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
            </AboutSection>

            <AboutSection title="Principais Funcionalidades">
                <InfoCardGrid items={features} />
            </AboutSection>

            <AboutSection title="Tecnologias Utilizadas">
                <TechStackGrid groups={techStack} />
            </AboutSection>

            <AboutSection title="Segurança e Privacidade">
                <InfoCardGrid items={securityItems} />
            </AboutSection>

            <AboutSection title="Missão e Visão">
                <InfoCardGrid
                    items={missionAndVision}
                    gridClassName={s.missionGrid}
                />
            </AboutSection>

            <AboutSection title="Informações do Projeto">
                <InfoCardGrid items={projectInfo} />
            </AboutSection>

            <AboutSection title="Equipe Desenvolvedora">
                <p className={s.teamDescription}>
                    O InvestCalc foi desenvolvido por uma equipe
                    multidisciplinar composta por estudantes
                    responsáveis pelo planejamento, desenvolvimento,
                    testes e evolução da aplicação.
                </p>

                <TeamMembersGrid members={teamMembers} />
            </AboutSection>

            <AboutSection title="Métricas do Projeto">
                <StatisticsGrid items={statistics} />
            </AboutSection>

            <AboutSection title="Evolução do Projeto">
                <RoadmapList items={roadmap} />
            </AboutSection>

            <AboutSection title="Diferenciais">
                <div className={s.grid}>
                    {differentials.map((item) => (
                        <div key={item} className={s.card}>
                            ✓ {item}
                        </div>
                    ))}
                </div>
            </AboutSection>
        </div>
    );
}
