import s from '../../pages/about/AboutPage.module.css';
import type { RoadmapItem } from '../../pages/about/about.types';

interface RoadmapListProps {
    items: RoadmapItem[];
}

export function RoadmapList({ items }: RoadmapListProps) {
    return (
        <div className={s.roadmap}>
            {items.map((item) => (
                <div key={item.title} className={s.roadmapCard}>
                    <h3>{item.title}</h3>

                    <span className={s.badge}>
                        {item.status}
                    </span>

                    <p>{item.description}</p>
                </div>
            ))}
        </div>
    );
}
