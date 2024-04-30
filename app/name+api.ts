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

export interface RequestBody {
  date: Date;
  id: string;
  state: string;
  location: string;
  city: string;
  collectorsId: number;
  collectorsName: string;
  informer: string;
  name: string;
}

export const POST = async (request: Request): Promise<Response> => {
  const auth = await getAccessToken();
  const url = 'https://evaldo.my.salesforce.com/services/data/v58.0/sobjects/Musk__c/';

  const body = (await request.json()) as RequestBody;

  const data = {
    Ave__c: body.id,
    dataHoraDaColeta__c: new Date(),
    Estado__c: body.state,
    // GPS_da_Coleta__Latitude__s: -23.5505,
    // GPS_da_Coleta__Longitude__s: -46.6333,
    Localidade__c: body.location,
    Municipio__c: body.city,
    Name: body.name,
    OwnerId: '0054w00000D61yRAAR',
    Pais__c: 'Brazil',
    ColetorName__c: body.collectorsName,
    ColetorId__c: body.collectorsId,
    QuemInformou__c: body.informer,
    Regiao__c: municipalitys.municipios.find((mun) => mun['UF-sigla'] === body.state)?.[
      'regiao-nome'
    ],
  };

  console.log(auth, data);
  const postData = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth?.access_token}`,
    },
    body: JSON.stringify(data),
  };

  const response = await fetch(url, postData);
  console.log(response);
  return response;
};
