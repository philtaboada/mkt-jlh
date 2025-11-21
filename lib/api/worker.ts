"use server";

import { createClient } from "../supabase/server";
export interface Worker {
  id: string;
  name: string;
  email: string;
}

export const getWorkers = async (): Promise<Worker[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("workers").select("id, name, email");
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    throw new Error("Error fetching workers");
  }
};
