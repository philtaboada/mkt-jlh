import { TypeInsurance } from '../enums/insuranceTypeEnums';

export const InsuranceTableMapRecord: Record<string, string> = {
  [TypeInsurance.EPS]: 'insurance_eps',
  [TypeInsurance.POLIZA_CAR]: 'insurance_polizacars',
  [TypeInsurance.POLIZA_MULTIRRIESGO]: 'insurance_multiriesgos',
  [TypeInsurance.FOLA]: 'insurance_folas',
  [TypeInsurance.P_EMPRESARIAL]: 'insurance_pempresarials',
  [TypeInsurance.ACCIDENTES]: 'insurance_accidentes',
  [TypeInsurance.POLIZA_EAR]: 'insurance_polizaears',
  [TypeInsurance.POLIZA_TREC]: 'insurance_polizatrecs',
  [TypeInsurance.R_CIVIL]: 'insurance_rcivils',
  [TypeInsurance.SALUD]: 'insurance_saluds',
  [TypeInsurance.SCTR]: 'insurance_sctrs',
  [TypeInsurance.SOAT]: 'insurance_soats',
  [TypeInsurance.VEHICULAR]: 'insurance_vehiculars',
  [TypeInsurance.VIAJES]: 'insurance_viajes',
  [TypeInsurance.VIDA_LEY]: 'insurance_vida_leys',
  [TypeInsurance.VIDA]: 'insurance_vidas',
};

export const InsuranceType = Object.entries(TypeInsurance).map(([key, value]) => ({
  label: value,
  value,
}));

export enum TypeProcessInsurance {
  COTIZACION = 'Cotización',
  RENOVACION = 'Renovación',
  EMISION = 'Emisión',
  NETEO = 'Neteo',
  INCLUSION = 'Inclusión',
  EXCLUSION = 'Exclusión',
}

export const InsuranceTypeProcess = Object.entries(TypeProcessInsurance).map(([key, value]) => ({
  label: value,
  value,
}));

export enum TypeOfCoverage {
  PENSION = 'pension',
  SALUD = 'salud',
  AMBOS = 'ambos',
}

export const TypeOfCoverageRecord: Record<string, string> = {
  [TypeOfCoverage.PENSION]: 'Pensión',
  [TypeOfCoverage.SALUD]: 'Salud',
  [TypeOfCoverage.AMBOS]: 'Pensión y Salud',
};
