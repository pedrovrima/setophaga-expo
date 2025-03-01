import { supabase } from '~/app/db';

export interface Bird {
  id: number;
  cbro_code: string;
  nvt: string;

  name_ptbr: string;
  name_english: string;
  status: string;
  list_type: string;
  category: string;
  order: string;
  family: string;
  genera: string;
  species: string;
  name_sci: string;
  name_spanish: string;
  name_german: string;
  name_french: string;
  name_danish: string;
  name_dutch: string;
  name_estonian: string;
  name_finnish: string;
  name_hungarian: string;
  name_japanese: string;
  name_norwegian: string;
  name_polish: string;
  name_russian: string;
  name_slovak: string;
  name_swedish: string;
}

export interface BirdWithSynonyms extends Bird {
  synonyms: Synonym[];
  normalizedFields: BirdWithSynonyms;
}

export enum Criteria {
  name_ptbr = 'name_ptbr',
  name_english = 'name_english',
  name_danish = 'name_danish',
  name_dutch = 'name_dutch',
  name_estonian = 'name_estonian',
  name_finnish = 'name_finnish',
  name_french = 'name_french',
  name_german = 'name_german',
  name_hungarian = 'name_hungarian',
  name_japanese = 'name_japanese',
  name_norwegian = 'name_norwegian',
  name_polish = 'name_polish',
  name_russian = 'name_russian',
  name_slovak = 'name_slovak',
  name_spanish = 'name_spanish',
  name_swedish = 'name_swedish',
}

export interface Synonym {
  id: number;
  name: string;
  bird_id: string;
  approval_status: string;
  approved_by: string;
  approved_date: string;
  bird: string;
  collector_id: string;
  state: string;
  city: string;
  region: string;
  observation: string;
  informant: string;
  collection_date: string;
  collection_time: string;
  latitude: string;
  longitude: string;
}

export const GET = async (): Promise<Response> => {
  try {
    const { data, error } = await supabase.from('birds').select(`
        *,
        synonyms (*)
      `);

    if (error) throw error;

    return Response.json(data);
  } catch (e: any) {
    throw new Error(e?.message);
  }
};
