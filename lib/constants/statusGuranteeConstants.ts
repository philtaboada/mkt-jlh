import { StatusGuarantee } from '../enums/statusGuaranteeEnums';

export const proyectStatus = Object.entries(StatusGuarantee).map(([key, value]) => ({
  label: value,
  value,
}));
