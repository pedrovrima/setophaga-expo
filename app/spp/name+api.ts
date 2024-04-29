import { getAccessToken } from '~/services/api';
import municipalitys from '~/municipios.json';
interface NewName {
  Ave__c: string;
  dataHoraDaColeta__c: Date;
  Estado__c: string;
  GPS_da_Coleta__Latitude__s: number;
  GPS_da_Coleta__Longitude__s: number;
  Localidade__c: string;
  Municipio__c: string;
  Name: string;
  OwnerId: string;
  Pais__c: string;
  QuemColetou__c: string;
  quemInformou__c: string;
  Regiao__c: string;
}

interface RequestBody {
  date: Date;
  id: string;
  state: string;
  locality: string;
  city: string;
  collectorsId: number;
  informer: string;
  name: string;
}

export const POST = async (request: Request): Promise<Response> => {
  const auth = await getAccessToken();
  const url = 'https://yourInstance.salesforce.com/services/data/vXX.0/sobjects/BirdCollection__c/'; // Replace 'yourInstance' and 'XX.0' with your actual Salesforce instance and API version.

  const body = (await request.json()) as RequestBody;

  const data = {
    Ave__c: '',
    dataHoraDaColeta__c: body.date,
    Estado__c: body.state,
    // GPS_da_Coleta__Latitude__s: -23.5505,
    // GPS_da_Coleta__Longitude__s: -46.6333,
    Localidade__c: body.locality,
    Municipio__c: body.city,
    Name: body.name,
    OwnerId: '005xx000001Sv6AAAS',
    Pais__c: 'Brazil',
    QuemColetou__c: body.collectorsId,
    quemInformou__c: body.informer,
    Regiao__c: municipalitys.municipios.find((mun) => mun['UF-sigla'] === body.state)?.[
      'regiao-sigla'
    ],
  };

  const fetchData = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: auth.access_token, // Replace 'YourAccessToken' with your actual access token
    },
    body: JSON.stringify(data),
  };

  return await fetch(url, fetchData)
    .then((response) => response.json())
    .then((data) => data)
    .catch((error) => console.error('Error:', error));
};
