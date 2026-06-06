import s from '../../pages/about/AboutPage.module.css';
import type { TechStackGroup } from '../../pages/about/about.types';

interface TechStackGridProps {
    groups: TechStackGroup[];
}

export function TechStackGrid({ groups }: TechStackGridProps) {
    return (
        <div className={s.techContainer}>
            {groups.map((group) => (
                <div key={group.title} className={s.card}>
                    <h3>{group.title}</h3>

                    <ul>
                        {group.techs.map((tech) => (
                            <li key={tech}>{tech}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
