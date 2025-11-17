import { IsoType } from '../enums/isosEnums';

export const IsoTypeRecord = Object.entries(IsoType).map(([key, value]) => ({
  value: value,
  label: key.replace(/_/g, ' ').toUpperCase(),
}));
