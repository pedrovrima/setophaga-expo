'use client';

import { useEffect, useState } from 'react';

import type { BirdRecord, Criteria } from '~/app/species+api';

type SearchReturn = {
  id: number;
  stringFound: string;
  scientificName: string;
};

export type HookReturn = [(SearchReturn | string | void)[] | undefined, boolean];

const criterias = [
  'NVP__c',
  'sinom',
  'USName__c',
  'Spanish__c',
  'Danish__c',
  'Dutch__c',
  'Estonian__c',
  'Finnish__c',
  'French__c',
  'German__c',
  'Hungarian__c',
  'Japanese__c',
  'Norwegian__c',
  'Polish__c',
  'Russian__c',
  'Slovak__c',
  'Swedish__c',
] as Criteria[];

export const languageDictionary = {
  Name: 'Nome Cientifico',
  NVP__c: 'CBRO',
  sinom: 'Nomes Populares',
  USName__c: 'English',
  Spanish__c: 'Español',
  Danish__c: 'Dansk',
  Dutch__c: 'Nederlands',
  Estonian__c: 'Eesti',
  Finnish__c: 'Suomi',
  French__c: 'Français',
  German__c: 'Deutsch',
  Hungarian__c: 'Magyar',
  Japanese__c: '日本語',
  Norwegian__c: 'Norsk',
  Polish__c: 'Polski',
  Russian__c: 'Русский',
  Slovak__c: 'Slovenčina',
  Swedish__c: 'Svenska',
};

export default function useSpeciesSearch(data: BirdRecord[], searchValue: string): HookReturn {
  const [filteredValues, setFilteredValues] = useState<(SearchReturn | string | void)[]>([]);

  useEffect(() => {
    if (data && searchValue.length > 3) {
      console.log('searching')
      const queriedData = criterias.reduce(
        (container: (SearchReturn | string)[], crt: Criteria) => {
          const _returnedData = data.filter((value) => {
            if(crt === 'sinom') {
              return value[crt]?.some((sin) => sin.Name.toLowerCase().includes(searchValue.toLowerCase()));
            }


            if (crt === 'NVP__c') {
              return (
                value[crt]?.toLocaleLowerCase().includes(searchValue.toLowerCase()) ||
                value['Name']?.toLocaleLowerCase().includes(searchValue.toLowerCase())
              );
            } else {
              return value[crt]?.toLocaleLowerCase().includes(searchValue.toLowerCase());
            }
          });

          if (_returnedData?.length > 0) {
            const returnedData = _returnedData.map((dt) => ({
              id: dt.Evaldo__c,
              scientificName: dt.Name,
              stringFound: crt === 'sinom'?  dt[crt].find((sin) => sin.Name.toLowerCase().includes(searchValue.toLowerCase()))?.Name : dt[crt],
            }));

            return [...container, languageDictionary[crt], ...returnedData];
          }

          return container;
        },
        []
      );

      if (searchValue.length < 4) {
        setFilteredValues([]);
        return;
      }

      setFilteredValues(queriedData);
      return;
    }

    setFilteredValues([]);
  }, [searchValue, data]);
  if (!data) return [undefined, true];

  return [filteredValues, false];
}

const searchByCriteria = (
  criteria: Criteria,
  value: BirdRecord,
  searchValue: string
): SearchReturn | void => {
  if (value[criteria]?.toLowerCase()?.includes(searchValue.toLowerCase())) {
    return {
      id: value.Evaldo__c,
      scientificName: value.Name,
      stringFound: value[criteria],
    };
  }
};
