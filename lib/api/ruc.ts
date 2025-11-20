"use server";


const apiUrl = "https://api.apis.net.pe/v2/sunat/ruc/full";
const apiUrlD = "https://api.apis.net.pe/v2/reniec/dni";
const token = process.env.RUC_API;

export async function fetchRucData(ruc: string) {
  if (!token) {
    throw new Error("API token for RUC data is not configured.");
  }

  try {
    const response = await fetch(`${apiUrl}/?numero=${ruc}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Ocurrió un error al obtener los datos del RUC.");
    return await response.json();
  } catch (error) {
    throw new Error("Error fetching RUC data");
  }
}

export async function fetchDniData(dni: string) {
  if (!token) {
    throw new Error("API token for DNI data is not configured.");
  }

  try {
    const response = await fetch(`${apiUrlD}/?numero=${dni}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Ocurrió un error al obtener los datos del DNI.");
    return await response.json();
  } catch (error) {
    throw new Error("Error fetching DNI data");
  }
}
