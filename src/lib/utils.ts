import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calcula la Humedad Relativa (RH) a partir de las temperaturas de bulbo seco y húmedo.
 * Utiliza la fórmula de Magnus-Tetens y la constante psicrométrica estándar.
 * 
 * @param dryBulb Temperatura de bulbo seco en °C
 * @param wetBulb Temperatura de bulbo húmedo en °C
 * @returns Humedad Relativa en porcentaje (0-100)
 */
export function calculateRH(dryBulb: number, wetBulb: number): number {
  if (wetBulb >= dryBulb) return 100;
  
  // Constantes para la presión de vapor de agua (Magnus-Tetens)
  const a = 17.27;
  const b = 237.3;
  
  // Presión de vapor de saturación a la temperatura del bulbo húmedo (kPa)
  const esw = 0.6112 * Math.exp((a * wetBulb) / (b + wetBulb));
  
  // Presión de vapor de saturación a la temperatura del bulbo seco (kPa)
  const esd = 0.6112 * Math.exp((a * dryBulb) / (b + dryBulb));
  
  // Presión atmosférica estándar (kPa)
  const pressure = 101.325;
  
  // Constante psicrométrica (kPa/°C)
  const psychrometricConstant = 0.00066;
  
  // Presión de vapor real (kPa)
  const ea = esw - psychrometricConstant * pressure * (dryBulb - wetBulb) * (1 + 0.00115 * wetBulb);
  
  // Humedad relativa (%)
  const rh = (ea / esd) * 100;
  
  return Math.max(0, Math.min(100, Number(rh.toFixed(1))));
}
