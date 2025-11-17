import { ContractSubject } from '../enums/contractSubjectEnums';

export const ConstractSubject = Object.entries(ContractSubject).map(([key, value]) => ({
  label: value,
  value,
}));
