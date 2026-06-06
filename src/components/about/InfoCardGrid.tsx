import s from '../../pages/about/AboutPage.module.css';
import type { InfoItem } from '../../pages/about/about.types';

interface InfoCardGridProps {
    items: InfoItem[];
    gridClassName?: string;
}

export function InfoCardGrid({
    items,
    gridClassName = s.grid
}: InfoCardGridProps) {
    return (
        <div className={gridClassName}>
            {items.map((item) => (
                <div key={item.title} className={s.card}>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                </div>
            ))}
        </div>
    );
}
