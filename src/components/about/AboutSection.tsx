import type { ReactNode } from 'react';
import s from '../../pages/about/AboutPage.module.css';

interface AboutSectionProps {
    title: string;
    children: ReactNode;
}

export function AboutSection({
    title,
    children
}: AboutSectionProps) {
    return (
        <section className={s.section}>
            <h2>{title}</h2>
            {children}
        </section>
    );
}
