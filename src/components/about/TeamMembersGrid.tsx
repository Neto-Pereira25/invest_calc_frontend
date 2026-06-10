import {
    FaEnvelope,
    FaGithub,
    FaLinkedin
} from 'react-icons/fa';
import s from '../../pages/about/AboutPage.module.css';
import type { TeamMember } from '../../pages/about/about.types';

interface TeamMembersGridProps {
    members: TeamMember[];
}

export function TeamMembersGrid({
    members
}: TeamMembersGridProps) {
    return (
        <div className={s.teamGrid}>
            {members.map((member) => (
                <div
                    key={member.email}
                    className={s.teamCard}
                >
                    <div className={s.avatarFrame}>
                        <img
                            src={member.image}
                            alt={member.name}
                            className={s.avatar}
                        />
                    </div>

                    <h3>{member.name}</h3>

                    <span className={s.role}>
                        {member.role}
                    </span>

                    <div className={s.links}>
                        <a
                            href={member.github}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Perfil do GitHub de ${member.name}`}
                        >
                            <FaGithub />
                        </a>

                        <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Perfil do LinkedIn de ${member.name}`}
                        >
                            <FaLinkedin />
                        </a>

                        <a
                            href={`mailto:${member.email}`}
                            aria-label={`Enviar e-mail para ${member.name}`}
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
    );
}
