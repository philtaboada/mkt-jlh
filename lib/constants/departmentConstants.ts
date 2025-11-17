import { Department } from '../enums/departmentEnums';

export const Departaments = Object.entries(Department).map(([key, value]) => ({
  label: value,
  value,
}));
