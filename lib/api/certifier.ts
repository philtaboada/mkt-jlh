"use client";

import { createClient } from "../supabase/server";
export interface Certifier {
  id: string;
  name: string;
}

export const getCertifiers = async (): Promise<Certifier[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("certifiers").select("id, name");
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    throw new Error("Error fetching certifiers");
  }
};