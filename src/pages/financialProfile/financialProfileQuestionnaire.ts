import type { FinancialProfileOption } from '../../types/financialProfile';

export type FinancialProfileQuestionOption = {
    value: FinancialProfileOption;
    label: string;
    effects: string[];
};

export type FinancialProfileQuestion = {
    number: number;
    title: string;
    options: FinancialProfileQuestionOption[];
};

export const FINANCIAL_PROFILE_QUESTIONNAIRE: FinancialProfileQuestion[] = [
    {
        number: 1,
        title: 'Como voce controla seus gastos?',
        options: [
            { value: 'A', label: 'Nunca controlo', effects: ['Desligado +4'] },
            { value: 'B', label: 'Anoto ocasionalmente', effects: ['Desligado +3'] },
            { value: 'C', label: 'Uso planilha ou aplicativo as vezes', effects: ['Desligado +1', 'Poupador +1'] },
            { value: 'D', label: 'Acompanho semanalmente', effects: ['Poupador +3'] },
            { value: 'E', label: 'Tenho controle detalhado de todas as despesas', effects: ['Poupador +3', 'Investidor +2'] },
        ],
    },
    {
        number: 2,
        title: 'Voce sabe quanto sobrou do seu dinheiro no ultimo mes?',
        options: [
            { value: 'A', label: 'Nao faco ideia', effects: ['Desligado +4'] },
            { value: 'B', label: 'Tenho apenas uma estimativa', effects: ['Desligado +2'] },
            { value: 'C', label: 'Sei aproximadamente', effects: ['Poupador +1'] },
            { value: 'D', label: 'Sei exatamente', effects: ['Poupador +2', 'Investidor +2'] },
        ],
    },
    {
        number: 3,
        title: 'Atualmente voce possui dividas?',
        options: [
            { value: 'A', label: 'Muitas dividas atrasadas', effects: ['Devedor +4'] },
            { value: 'B', label: 'Algumas dividas atrasadas', effects: ['Devedor +3'] },
            { value: 'C', label: 'Tenho dividas sob controle', effects: ['Devedor +1'] },
            { value: 'D', label: 'Nao possuo dividas', effects: ['Poupador +2', 'Investidor +2'] },
        ],
    },
    {
        number: 4,
        title: 'Quando recebe sua renda mensal voce normalmente:',
        options: [
            { value: 'A', label: 'Gasto quase tudo rapidamente', effects: ['Gastador +4'] },
            { value: 'B', label: 'Gasto a maior parte', effects: ['Gastador +3'] },
            { value: 'C', label: 'Pago contas e uso o restante', effects: ['Gastador +1', 'Poupador +1'] },
            { value: 'D', label: 'Reservo parte para poupar', effects: ['Poupador +3'] },
            { value: 'E', label: 'Reservo parte para investir', effects: ['Investidor +4'] },
        ],
    },
    {
        number: 5,
        title: 'Com que frequencia voce realiza compras por impulso?',
        options: [
            { value: 'A', label: 'Muito frequentemente', effects: ['Gastador +4'] },
            { value: 'B', label: 'Frequentemente', effects: ['Gastador +3'] },
            { value: 'C', label: 'As vezes', effects: ['Gastador +1'] },
            { value: 'D', label: 'Raramente', effects: ['Poupador +2'] },
            { value: 'E', label: 'Nunca', effects: ['Poupador +2', 'Investidor +2'] },
        ],
    },
    {
        number: 6,
        title: 'Voce possui reserva de emergencia?',
        options: [
            { value: 'A', label: 'Nao', effects: ['Devedor +2'] },
            { value: 'B', label: 'Estou tentando criar', effects: ['Poupador +1'] },
            { value: 'C', label: 'Tenho menos de 3 meses', effects: ['Poupador +2'] },
            { value: 'D', label: 'Tenho entre 3 e 6 meses', effects: ['Poupador +3'] },
            { value: 'E', label: 'Tenho mais de 6 meses', effects: ['Poupador +3', 'Investidor +3'] },
        ],
    },
    {
        number: 7,
        title: 'Quanto da sua renda costuma ser poupada mensalmente?',
        options: [
            { value: 'A', label: 'Nada', effects: ['Gastador +2', 'Devedor +2'] },
            { value: 'B', label: 'Menos de 5%', effects: ['Gastador +1'] },
            { value: 'C', label: 'Entre 5% e 10%', effects: ['Poupador +2'] },
            { value: 'D', label: 'Entre 10% e 20%', effects: ['Poupador +3'] },
            { value: 'E', label: 'Mais de 20%', effects: ['Investidor +4'] },
        ],
    },
    {
        number: 8,
        title: 'Voce investe atualmente?',
        options: [
            { value: 'A', label: 'Nunca investi', effects: ['Desligado +2'] },
            { value: 'B', label: 'Ja investi no passado', effects: ['Poupador +1'] },
            { value: 'C', label: 'Invisto ocasionalmente', effects: ['Investidor +2'] },
            { value: 'D', label: 'Invisto regularmente', effects: ['Investidor +3'] },
            { value: 'E', label: 'Invisto regularmente e acompanho resultados', effects: ['Investidor +4'] },
        ],
    },
    {
        number: 9,
        title: 'Como voce reage quando surge um gasto inesperado?',
        options: [
            { value: 'A', label: 'Faco emprestimo', effects: ['Devedor +4'] },
            { value: 'B', label: 'Uso cartao de credito', effects: ['Devedor +2', 'Gastador +1'] },
            { value: 'C', label: 'Parcelo a despesa', effects: ['Devedor +1'] },
            { value: 'D', label: 'Uso minha reserva financeira', effects: ['Poupador +3'] },
            { value: 'E', label: 'Uso reserva sem comprometer meu planejamento', effects: ['Investidor +3'] },
        ],
    },
    {
        number: 10,
        title: 'Qual frase melhor descreve voce?',
        options: [
            { value: 'A', label: 'Estou tentando sair das dividas', effects: ['Devedor +4'] },
            { value: 'B', label: 'Vivo sem muito planejamento financeiro', effects: ['Desligado +4'] },
            { value: 'C', label: 'Quero gastar melhor meu dinheiro', effects: ['Gastador +4'] },
            { value: 'D', label: 'Quero aumentar minha capacidade de poupanca', effects: ['Poupador +4'] },
            { value: 'E', label: 'Quero fazer meu patrimonio crescer atraves de investimentos', effects: ['Investidor +4'] },
        ],
    },
];