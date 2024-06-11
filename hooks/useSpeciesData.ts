import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { BirdRecord } from '~/app/species+api';
import { getAllSpecies } from '~/services/api';

export interface NormalizedData extends BirdRecord {
  normalizedFields: BirdRecord
}

export default function useSpeciesData() {
  const [normalizedData, setNormalizedData] = useState<BirdRecord[] | undefined>(undefined);
  const query = useQuery({
    queryKey: ['allSpp'],
    queryFn: getAllSpecies,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 24,
  });
  const [storedData, setStoredData] = useState(undefined);
  useEffect(() => {
    if (query.isSuccess) {

      const normalizedData = query.data.map((item) => {
        const normalizedFields = {};
        for (const key in item) {
          if (typeof item[key] === 'string') {
            normalizedFields[key] = normalizeName(item[key]?.toLowerCase());
          } else if (Array.isArray(item[key]) && key === 'sinom') {
            normalizedFields[key] = item[key].map((sin) => ({
              ...sin,
              normalizedSinName: normalizeName(sin.Name.toLowerCase())
            }));
          }
        }
        return { ...item, normalizedFields };
      });
    

      const stringfiedData = JSON.stringify(normalizedData);
      setNormalizedData(normalizedData);

      AsyncStorage.setItem('data', stringfiedData);
    }
  }, [query.isSuccess]);

  const getItem = async () => {
    const data = await AsyncStorage.getItem('data');
    console.log('storedData',data)
    if (data) {
      setStoredData(JSON.parse(data));
      return;
    }
    return undefined;
  };

  useEffect(() => {
    getItem();
  }, []);
  


  return { ...query, data: (normalizedData as NormalizedData[]) || storedData };
}



function normalizeName(str:string)
{
  if(str){
    str = str.replace(/[ÀÁÂÃÄÅ]/,"A");
    str = str.replace(/[àáâãäå]/,"a");
    str = str.replace(/[í]/,"i");
    str = str.replace(/[Í]/,"I");
    str = str.replace(/[óôõ]/,"o");
    str = str.replace(/[ÓÔÕ]/,"O");
    str = str.replace(/[ú]/,"u");
    str = str.replace(/[Ú]/,"U");
    str = str.replace(/[èéêë]/,"e");
    str = str.replace(/[ÈÉÊË]/,"E");
    str = str.replace(/[Ç]/,"C");
    str = str.replace(/[ç]/,"c");
    str = str.replace(/[-]/," ");
    return str.replace(/[^a-z0-9]/gi,''); }
    return str
}
