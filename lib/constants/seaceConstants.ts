import { SeaceDataTypes } from '../enums/seace';

export const SeaceDataTypeLabels: Record<SeaceDataTypes, string> = {
  [SeaceDataTypes.SIN_GESTION]: 'Sin Gestión',
  [SeaceDataTypes.EN_GESTION]: 'En Gestión',
  [SeaceDataTypes.SIN_DATOS_DE_CONTACTO]: 'Sin Datos de Contacto',
  [SeaceDataTypes.NO_UBICADO]: 'No Ubicado',
  [SeaceDataTypes.NO_INTERESADO]: 'No Interesado',
  [SeaceDataTypes.TIENE_BROKER]: 'Tiene Broker',
  [SeaceDataTypes.NO_REQUIERE_FIANZA]: 'No Requiere Fianza',
  [SeaceDataTypes.TRABAJA_CON_EL_BANCO]: 'Trabaja con el Banco',
  [SeaceDataTypes.NO_CALIFICA]: 'No Califica',
  [SeaceDataTypes.OTROS]: 'Otros',
  [SeaceDataTypes.REPETIR_LLAMADA]: 'Repetir Llamada',
  [SeaceDataTypes.CLIENTE_POTENCIAL]: 'Cliente Potencial',
  [SeaceDataTypes.INTERESADO]: 'Interesado',
  [SeaceDataTypes.RECEPCION_DE_DOCUMENTOS]: 'Recepción de Documentos',
  [SeaceDataTypes.ARMADO_DE_PROPUESTA]: 'Armado de Propuesta',
  [SeaceDataTypes.ENVIO_A_OPERACION]: 'Envío a Operación',
  [SeaceDataTypes.RECIBIDO_EN_OPERACION]: 'Recibido en Operación',
  [SeaceDataTypes.VERIFICACION_FINANCIERA_Y_DOCUMENTOS]: 'Verificación Financiera y Documentos',
  [SeaceDataTypes.INGRESAR_LA_OPERACION]: 'Ingresar la Operación',
  [SeaceDataTypes.RECONSIDERACION]: 'Reconsideración',
  [SeaceDataTypes.ENVIAR_TERMINOS_Y_CONDICIONES]: 'Enviar Términos y Condiciones',
  [SeaceDataTypes.REDACCION_DE_DOCUMENTACION_LEGAL]: 'Redacción de Documentación Legal',
  [SeaceDataTypes.FIANZAS_LISTAS_PARA_EMITIRLAS]: 'Fianzas Listas para Emitirlas',
  [SeaceDataTypes.SOLICITUD_DE_ATENCION]: 'Solicitud de Atención',
  [SeaceDataTypes.SOLICITUD_DE_EMISION]: 'Solicitud de Emisión',
  [SeaceDataTypes.EMITIDO]: 'Emitido',
  [SeaceDataTypes.PAGADO]: 'Pagado',
  [SeaceDataTypes.EN_COTIZACION]: 'En Cotización',
  [SeaceDataTypes.PENDIENTE_DE_PAGO]: 'Pendiente de Pago',
  [SeaceDataTypes.ENTREGADO_AL_CLIENTE]: 'Entregado al Cliente',
  [SeaceDataTypes.ARCHIVADO]: 'Archivado',
  [SeaceDataTypes.EN_NEGOCIACION]: 'En Negociación',
  [SeaceDataTypes.ACEPTADO]: 'Aceptado',
  [SeaceDataTypes.DESESTIMADO]: 'Desestimado',
  [SeaceDataTypes.CLIENTE_FIDEICOMISO]: 'Cliente Fideicomiso',
  [SeaceDataTypes.NOTIFICAR_AL_CLIENTE]: 'Notificar al Cliente',
  [SeaceDataTypes.REVISION_DE_DOCUMENTOS]: 'Revisión de Documentos',
  [SeaceDataTypes.ENVIO_DE_CORREO_A_LA_ASEGURADORA]: 'Envío de Correo a la Aseguradora',
  [SeaceDataTypes.CONFIRMACIÓN_DE_RENOVACIÓN_Y_EMISION_DE_LA_FACTURA]:
    'Confirmación de Renovación y Emisión de la Factura',
  [SeaceDataTypes.RECOJO_DE_LA_FIANZA_Y_ENTREGA_DE_RENOVACION]:
    'Recojo de la Fianza y Entrega de Renovación',
  [SeaceDataTypes.FIANZA_RENOVADA]: 'Fianza Renovada',
  [SeaceDataTypes.DEVOLUCION_DE_FIANZA_E_INGRESO_DE_SOLICITUD]:
    'Devolución de Fianza e Ingreso de Solicitud',
  [SeaceDataTypes.VALIDACION_DE_DOCUMENTOS_Y_AVANCE_DE_OBRA]:
    'Validación de Documentos y Avance de Obra',
  [SeaceDataTypes.SEGUIMIENTO]: 'Seguimiento',
  [SeaceDataTypes.APROBACION]: 'Aprobación',
  [SeaceDataTypes.DEUDAS_PENDIENTES]: 'Deudas Pendientes',
  [SeaceDataTypes.AREA_DE_TESORERIA]: 'Área de Tesorería',
  [SeaceDataTypes.FIANZA_LIBERADA]: 'Fianza Liberada',
  [SeaceDataTypes.NO_RENOVAR]: 'No Renovar',
  [SeaceDataTypes.NOTIFICAR_DEUDA]: 'Notificar Deuda',
  [SeaceDataTypes.RESPUESTA_DEL_CLIENTE_Y_ANOTOCION_DE_COMPROMISO]:
    'Respuesta del Cliente y Anotación de Compromiso',
  [SeaceDataTypes.SUBIR_DOCUMENTOS]: 'Subir Documentos',
  [SeaceDataTypes.ANULADO]: 'Anulado',
};

export function getSeaceDataTypeLabel(status: SeaceDataTypes): string {
  return SeaceDataTypeLabels[status] || status.toString();
}
