import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { BirdRecord } from '~/app/species+api';

import { getAllSpecies } from '~/services/api';

export default function useSpeciesData() {
  const query = useQuery({
    queryKey: ['allSpp'],
    queryFn: getAllSpecies,
    refetchInterval: 300000,
    refetchOnMount: false,
  });
  const [storedData, setStoredData] = useState(undefined);
  useEffect(() => {
    if (query.isSuccess) {
      const stringfiedData = JSON.stringify(query.data);
      AsyncStorage.setItem('data', stringfiedData);
    }
  }, [query.isSuccess]);

  const getItem = async () => {
    const data = await AsyncStorage.getItem('data');
    if (data) {
      setStoredData(JSON.parse(data));
      return;
    }
    return undefined;
  };

  useEffect(() => {
    getItem();
  }, []);

  return { ...query, data: (query.data as BirdRecord[]) || storedData };
}
