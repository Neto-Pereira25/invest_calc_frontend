export interface InfoItem {
    title: string;
    description: string;
}

export interface TechStackGroup {
    title: string;
    techs: string[];
}

export interface TeamMember {
    name: string;
    role: string;
    image: string;
    github: string;
    linkedin: string;
    email: string;
}

export interface StatisticItem {
    value: string;
    label: string;
}

export interface RoadmapItem {
    title: string;
    status: string;
    description: string;
}
