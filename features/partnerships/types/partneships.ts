export interface Partnerships {
  id: string;
  name: string;
  document: string;
  email: string;
  mobile_number: string;
  business_principal_id: string;
  economic_activity: string;
  address: string;
  partnership_businesses: PartnershipBusiness[];
}

export interface PartnershipBusiness {
  business_id: string;
  participation_percent: number;
}
