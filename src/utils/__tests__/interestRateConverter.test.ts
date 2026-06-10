import {
    convertInterestRate,
    isValidRate,
    formatRateForDisplay,
    getOptimalDecimalPlaces,
} from '../interestRateConverter';
import type { RateConversionInput } from '../../types/interestRateConverter';

describe('Interest Rate Converter', () => {
    describe('convertInterestRate - Mensal para Anual', () => {
        it('deve converter taxa mensal de 1% para taxa anual equivalente', () => {
            const input: RateConversionInput = {
                rate: 1,
                direction: 'TO_YEARLY',
            };

            const result = convertInterestRate(input);

            expect(result.originalRate).toBe(1);
            expect(result.originalType).toBe('MONTHLY');
            expect(result.convertedType).toBe('YEARLY');
            expect(result.direction).toBe('TO_YEARLY');

            // (1 + 0.01)^12 - 1 ≈ 0.12682503 = 12.682503%
            expect(result.convertedRate).toBeGreaterThan(12.68);
            expect(result.convertedRate).toBeLessThan(12.69);
        });

        it('deve converter taxa mensal de 0.5% para taxa anual', () => {
            const input: RateConversionInput = {
                rate: 0.5,
                direction: 'TO_YEARLY',
            };

            const result = convertInterestRate(input);

            // (1 + 0.005)^12 - 1 ≈ 0.06167781 = 6.167781%
            expect(result.convertedRate).toBeGreaterThan(6.16);
            expect(result.convertedRate).toBeLessThan(6.17);
        });

        it('deve converter taxa mensal de 0% para taxa anual de 0%', () => {
            const input: RateConversionInput = {
                rate: 0,
                direction: 'TO_YEARLY',
            };

            const result = convertInterestRate(input);

            expect(result.convertedRate).toBe(0);
        });

        it('deve converter taxa mensal de 10% para taxa anual', () => {
            const input: RateConversionInput = {
                rate: 10,
                direction: 'TO_YEARLY',
            };

            const result = convertInterestRate(input);

            // (1 + 0.10)^12 - 1 ≈ 2.1384284 = 213.84284%
            expect(result.convertedRate).toBeGreaterThan(213.8);
            expect(result.convertedRate).toBeLessThan(214);
        });
    });

    describe('convertInterestRate - Anual para Mensal', () => {
        it('deve converter taxa anual de 12% para taxa mensal equivalente', () => {
            const input: RateConversionInput = {
                rate: 12,
                direction: 'TO_MONTHLY',
            };

            const result = convertInterestRate(input);

            expect(result.originalRate).toBe(12);
            expect(result.originalType).toBe('YEARLY');
            expect(result.convertedType).toBe('MONTHLY');
            expect(result.direction).toBe('TO_MONTHLY');

            // (1 + 0.12)^(1/12) - 1 ≈ 0.00948879 = 0.948879%
            expect(result.convertedRate).toBeGreaterThan(0.94);
            expect(result.convertedRate).toBeLessThan(0.95);
        });

        it('deve converter taxa anual de 6% para taxa mensal', () => {
            const input: RateConversionInput = {
                rate: 6,
                direction: 'TO_MONTHLY',
            };

            const result = convertInterestRate(input);

            // (1 + 0.06)^(1/12) - 1 ≈ 0.00486755 = 0.486755%
            expect(result.convertedRate).toBeGreaterThan(0.48);
            expect(result.convertedRate).toBeLessThan(0.49);
        });

        it('deve converter taxa anual de 0% para taxa mensal de 0%', () => {
            const input: RateConversionInput = {
                rate: 0,
                direction: 'TO_MONTHLY',
            };

            const result = convertInterestRate(input);

            expect(result.convertedRate).toBe(0);
        });

        it('deve converter taxa anual de 100% para taxa mensal', () => {
            const input: RateConversionInput = {
                rate: 100,
                direction: 'TO_MONTHLY',
            };

            const result = convertInterestRate(input);

            // (1 + 1.0)^(1/12) - 1 ≈ 0.0594603 = 5.94603%
            expect(result.convertedRate).toBeGreaterThan(5.9);
            expect(result.convertedRate).toBeLessThan(6);
        });
    });

    describe('Ciclo completo - Conversão dupla', () => {
        it('deve retornar à taxa original após conversão dupla (mensal → anual → mensal)', () => {
            const originalRate = 1.5;

            // Primeira conversão: mensal → anual
            const toYearly = convertInterestRate({
                rate: originalRate,
                direction: 'TO_YEARLY',
            });

            // Segunda conversão: anual → mensal
            const toMonthly = convertInterestRate({
                rate: toYearly.convertedRate,
                direction: 'TO_MONTHLY',
            });

            // Deve retornar aproximadamente ao valor original (margem para erros de precisão)
            expect(Math.abs(toMonthly.convertedRate - originalRate)).toBeLessThan(0.0001);
        });

        it('deve retornar à taxa original após conversão dupla (anual → mensal → anual)', () => {
            const originalRate = 12;

            // Primeira conversão: anual → mensal
            const toMonthly = convertInterestRate({
                rate: originalRate,
                direction: 'TO_MONTHLY',
            });

            // Segunda conversão: mensal → anual
            const toYearly = convertInterestRate({
                rate: toMonthly.convertedRate,
                direction: 'TO_YEARLY',
            });

            // Deve retornar aproximadamente ao valor original
            expect(Math.abs(toYearly.convertedRate - originalRate)).toBeLessThan(0.0001);
        });
    });

    describe('Tratamento de erros', () => {
        it('deve lançar erro para taxa negativa', () => {
            expect(() => {
                convertInterestRate({
                    rate: -5,
                    direction: 'TO_YEARLY',
                });
            }).toThrow(/inválida/);
        });

        it('deve lançar erro para taxa NaN', () => {
            expect(() => {
                convertInterestRate({
                    rate: NaN,
                    direction: 'TO_YEARLY',
                });
            }).toThrow(/inválida/);
        });

        it('deve lançar erro para taxa Infinity', () => {
            expect(() => {
                convertInterestRate({
                    rate: Infinity,
                    direction: 'TO_YEARLY',
                });
            }).toThrow(/inválida/);
        });
    });

    describe('isValidRate', () => {
        it('deve validar taxa positiva', () => {
            expect(isValidRate(5)).toBe(true);
        });

        it('deve validar taxa zero', () => {
            expect(isValidRate(0)).toBe(true);
        });

        it('deve validar taxa até 1000%', () => {
            expect(isValidRate(1000)).toBe(true);
        });

        it('deve rejeitar taxa negativa', () => {
            expect(isValidRate(-1)).toBe(false);
        });

        it('deve rejeitar taxa acima de 1000%', () => {
            expect(isValidRate(1001)).toBe(false);
        });

        it('deve rejeitar NaN', () => {
            expect(isValidRate(NaN)).toBe(false);
        });

        it('deve rejeitar Infinity', () => {
            expect(isValidRate(Infinity)).toBe(false);
        });
    });

    describe('formatRateForDisplay', () => {
        it('deve formatar taxa com separador decimal de vírgula', () => {
            const formatted = formatRateForDisplay(5.123456, 4);
            expect(formatted).toBe('5,1235');
        });

        it('deve usar precisão padrão de 4 casas decimais', () => {
            const formatted = formatRateForDisplay(1.5);
            expect(formatted).toContain(',');
            expect(formatted).toMatch(/^1/);
        });

        it('deve formatar zero corretamente', () => {
            const formatted = formatRateForDisplay(0, 2);
            expect(formatted).toBe('0,00');
        });

        it('deve respeitar número máximo de casas decimais', () => {
            const formatted = formatRateForDisplay(0.123456, 2);
            expect(formatted).toBe('0,12');
        });
    });

    describe('getOptimalDecimalPlaces', () => {
        it('deve retornar 2 para taxa 0%', () => {
            expect(getOptimalDecimalPlaces(0)).toBe(2);
        });

        it('deve retornar 6 para taxa muito pequena', () => {
            expect(getOptimalDecimalPlaces(0.001)).toBe(6);
        });

        it('deve retornar 5 para taxa pequena', () => {
            expect(getOptimalDecimalPlaces(0.05)).toBe(5);
        });

        it('deve retornar 4 para taxa média', () => {
            expect(getOptimalDecimalPlaces(0.5)).toBe(4);
        });

        it('deve retornar 3 para taxa acima de 1%', () => {
            expect(getOptimalDecimalPlaces(1.5)).toBe(3);
        });

        it('deve retornar 3 para taxa alta', () => {
            expect(getOptimalDecimalPlaces(50)).toBe(3);
        });
    });
});
