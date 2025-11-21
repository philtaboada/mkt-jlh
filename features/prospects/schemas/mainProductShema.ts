import { z } from 'zod';

// Campos compartidos por todos los tipos de producto
const sharedFields = {
  // Información básica compartida
  email: z.string().email('Email inválido').optional(),
  department: z.string().optional(),
  type_entity: z.enum(['BUSINESS', 'PARTNERSHIPS']),
  business_or_partnership_id: z.string().optional().nullable(),
  management_date: z.string().optional().nullable(),
  worker_id: z.string().optional().nullable(),

  // Campos comunes a la mayoría
  ruc: z.string().optional(),
  business_name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  observation: z.string().optional(),
  amount: z.number().optional(),
  emition_at: z.string().optional().nullable(),
};

// Campos específicos para Carta Fianza
const cartaFianzaFields = {
  postor: z.string().min(1, 'Postor es requerido'),
  convocation_date: z.string().optional().nullable(),
  mobile_number: z.string().optional(),
  contract_subject: z.string().optional(),
  stimated_premium: z.number().optional(),
  stimated_income: z.number().optional(),
  public_date: z.string().optional().nullable(),
  buena_pro_date: z.string().optional().nullable(),
  awarded_date: z.string().optional(),
  status: z.string().optional(),
  type_money: z.string().optional().nullable(),
  is_base_atag: z.boolean().optional(),
  is_offer_atag: z.boolean().optional(),
  nomenclatura: z.string().optional(),
  status_code: z.string().optional(),
  referral_channel: z.string().optional().default('Marketing'),
  reference_value: z.number().positive('El valor de referencia debe ser positivo'),
};

// Campos específicos para ISOS
const isosFields = {
  business_or_person_name: z.string().optional(),
  types: z.string().optional().nullable(),
  status_code: z.number().optional(),
  business_id: z.string().optional().nullable(),
  certifier_id: z.string().optional().nullable(),
  main_product_id: z.string().optional().nullable(),
  referral_channel: z.string().optional().default('Referido'),
};

// Campos específicos para Fideicomisos
const fideicomisosFields = {
  commission: z.number().optional(),
  days: z.number().optional(),
  financier_name: z.string().optional().nullable(),
  financier_id: z.string().optional().nullable(),
};

// Campos específicos para Seguros
const segurosFields = {
  document_type: z.string().min(1, 'Tipo de documento es requerido'),
  document_name: z.string().min(1, 'Nombre del documento es requerido'),
  project_name: z.string().min(1, 'Nombre del proyecto es requerido'),
  partnership_id: z.string().optional().nullable(),
  effective_start_date: z.string().min(1, 'Fecha de inicio efectiva es requerida'),
  expiration_at: z.string().optional().nullable(),
  insurance_type: z.string().min(1, 'Tipo de seguro es requerido'),
  contact_name: z.string().optional(),
  reference_value: z.number().optional(),
  financier_id: z.string().optional(),
  type_money: z.string().optional(),
};

// Schema principal que combina campos compartidos + campos específicos según el tipo
const mainProductSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, 'El nombre del producto es obligatorio'),
    product_type: z.enum(['CARTA_FIANZA', 'ISOS', 'FIDEICOMISOS', 'SEGUROS']),
  })
  .and(
    z.union([
      // Carta Fianza
      z.object({
        product_type: z.literal('CARTA_FIANZA'),
        ...sharedFields,
        ...cartaFianzaFields,
      }),
      // ISOS
      z.object({
        product_type: z.literal('ISOS'),
        ...sharedFields,
        ...isosFields,
      }),
      // Fideicomisos
      z.object({
        product_type: z.literal('FIDEICOMISOS'),
        ...sharedFields,
        ...fideicomisosFields,
      }),
      // Seguros
      z.object({
        product_type: z.literal('SEGUROS'),
        ...sharedFields,
        ...segurosFields,
      }),
    ])
  );

// Tipos de datos para cada formulario
export type CartaFianzaForm = z.infer<typeof mainProductSchema> & typeof cartaFianzaFields;
export type IsosForm = z.infer<typeof mainProductSchema> & typeof isosFields;
export type FideicomisosForm = z.infer<typeof mainProductSchema> & typeof fideicomisosFields;
export type SegurosForm = z.infer<typeof mainProductSchema> & typeof segurosFields;

export type MainProductFormInput = z.infer<typeof mainProductSchema>;
export { mainProductSchema };
