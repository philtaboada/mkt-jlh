'use server';

const apiUrl = 'https://api.apis.net.pe/v2/sunat/ruc/full';
const apiUrlD = 'https://api.apis.net.pe/v2/reniec/dni';
const token = process.env.RUC_API;

/**
 * Consulta información completa de un RUC
 */
export async function getRucInfo(ruc: string): Promise<any> {
  try {
    if (!token) {
      throw new Error('RUC_API token no configurado');
    }

    const response = await fetch(`${apiUrl}?numero=${ruc}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error en la consulta RUC: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error consultando RUC:', error);
    throw error;
  }
}

/**
 * Consulta información de un DNI
 */
export async function getDniInfo(dni: string): Promise<any> {
  try {
    if (!token) {
      throw new Error('RUC_API token no configurado');
    }

    const response = await fetch(`${apiUrlD}?numero=${dni}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error en la consulta DNI: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error consultando DNI:', error);
    throw error;
  }
}
