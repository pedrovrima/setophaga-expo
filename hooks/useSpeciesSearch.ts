'use client';

import { useEffect, useState } from 'react';
import type { BirdWithSynonyms, Synonym } from '~/app/species+api';

type Criteria =
  | 'nvt'
  | 'synonyms'
  | 'name_sci'
  | 'name_english'
  | 'name_spanish'
  | 'name_danish'
  | 'name_dutch'
  | 'name_estonian'
  | 'name_finnish'
  | 'name_french'
  | 'name_german'
  | 'name_hungarian'
  | 'name_japanese'
  | 'name_norwegian'
  | 'name_polish'
  | 'name_russian'
  | 'name_slovak'
  | 'name_swedish'
  | 'name_ptbr';

type SearchReturn = {
  id: number;
  stringFound: string | Synonym[];
  scientificName: string;
};

export type HookReturn = [(SearchReturn | string | void)[] | undefined, boolean];

const criterias = [
  'name_ptbr',
  'synonyms',
  'name_english',
  'name_spanish',
  'name_danish',
  'name_dutch',
  'name_estonian',
  'name_finnish',
  'name_french',
  'name_german',
  'name_hungarian',
  'name_japanese',
  'name_norwegian',
  'name_polish',
  'name_russian',
  'name_slovak',
  'name_swedish',
  'name_ptbr',
] as Criteria[];

export const languageDictionary = {
  name_sci: 'Nome Cientifico',
  name_ptbr: 'CBRO',
  synonyms: 'Nomes Populares',
  name_english: 'English',

  name_spanish: 'Español',
  name_danish: 'Dansk',
  name_dutch: 'Nederlands',
  name_estonian: 'Eesti',
  name_finnish: 'Suomi',
  name_french: 'Français',
  name_german: 'Deutsch',
  name_hungarian: 'Magyar',
  name_japanese: '日本語',
  name_norwegian: 'Norsk',
  name_polish: 'Polski',
  name_russian: 'Русский',
  name_slovak: 'Slovenčina',
  name_swedish: 'Svenska',
};

export default function useSpeciesSearch(
  data: BirdWithSynonyms[],
  searchValue: string
): HookReturn {
  const [filteredValues, setFilteredValues] = useState<(SearchReturn | string | void)[]>([]);

  useEffect(() => {
    if (data && searchValue.length > 2) {
      const normalizedSearchValue = normalizeName(searchValue.toLowerCase());

      const queriedData = criterias.reduce(
        (container: (SearchReturn | string)[], crt: Criteria) => {
          const _returnedData = data.filter((value) => {
            if (crt === 'synonyms') {
              const filteredSynonyms = value.synonyms.filter((synonym) =>
                normalizeName(synonym.name.toLowerCase()).includes(normalizedSearchValue)
              );

              return filteredSynonyms.length > 0;
            }

            if (crt === 'name_ptbr') {
              return (
                normalizeName(value[crt]?.toLowerCase())?.includes(normalizedSearchValue) ||
                normalizeName(value.name_sci?.toLowerCase())?.includes(normalizedSearchValue)
              );
            } else {
              return normalizeName(value[crt]?.toLowerCase())?.includes(normalizedSearchValue);
            }
          });

          if (_returnedData?.length > 0) {
            const returnedData = _returnedData.map((dt) => ({
              id: dt.id,
              scientificName: dt.name_sci,
              stringFound:
                crt === 'synonyms'
                  ? dt.synonyms.find((synonym) =>
                      normalizeName(synonym.name.toLowerCase()).includes(normalizedSearchValue)
                    )?.name
                  : dt[crt],
            }));

            return [...container, languageDictionary[crt], ...returnedData];
          }

          return container;
        },
        []
      );

      console.log(queriedData);
      if (searchValue.length < 3) {
        setFilteredValues([]);
        return;
      }

      setFilteredValues(queriedData);
      return;
    }

    setFilteredValues([]);
  }, [searchValue]);

  if (!data) return [undefined, true];

  return [filteredValues, false];
}

function normalizeName(str: string) {
  if (str) {
    str = str.replace(/[ÀÁÂÃÄÅ]/, 'A');
    str = str.replace(/[àáâãäå]/, 'a');
    str = str.replace(/[í]/, 'i');
    str = str.replace(/[Í]/, 'I');
    str = str.replace(/[óôõ]/, 'o');
    str = str.replace(/[ÓÔÕ]/, 'O');
    str = str.replace(/[ú]/, 'u');
    str = str.replace(/[Ú]/, 'U');
    str = str.replace(/[èéêë]/, 'e');
    str = str.replace(/[ÈÉÊË]/, 'E');
    str = str.replace(/[Ç]/, 'C');
    str = str.replace(/[ç]/, 'c');
    str = str.replace(/[-]/, ' ');
    return str.replace(/[^a-z0-9]/gi, '');
  }
  return str;
}
