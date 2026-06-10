import s from '../../pages/about/AboutPage.module.css';
import type { StatisticItem } from '../../pages/about/about.types';

interface StatisticsGridProps {
    items: StatisticItem[];
}

export function StatisticsGrid({
    items
}: StatisticsGridProps) {
    return (
        <div className={s.statsGrid}>
            {items.map((stat) => (
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
    );
}
