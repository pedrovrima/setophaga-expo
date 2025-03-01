import { getAccessToken } from '~/services/api';

export interface Sinom {
  Approval_status__c: string;
  Ave__c: string;
  ColetorId__c: string;
  ColetorName__c: string;
  Estado__c: string;
  Municipio__c: string;
  Name: string;
  QuemInformou__c: string;
  Regiao__c: string;
}

export interface BirdRecord {
  Id: string;
  Danish__c: string;
  Dutch__c: string;
  Ebird__c: string;
  Especie__c: string;
  Estonian__c: string;
  Evaldo__c: number;
  Familia__c: string;
  Finnish__c: string;
  French__c: string;
  Genero__c: string;
  German__c: string;
  Hungarian__c: string;
  Japanese__c: string;
  Name: string;
  Norwegian__c: string;
  NVP__c: string;
  Ordem__c: string;
  Polish__c: string;
  Russian__c: string;
  Slovak__c: string;
  Spanish__c: string;
  Swedish__c: string;
  Taxon__c: string;
  USName__c: string;
  sinom: Sinom[];
}

export enum Criteria {
  sinom = 'sinom',
  Danish__c = 'Danish__c',
  Dutch__c = 'Dutch__c',
  Estonian__c = 'Estonian__c',
  Finnish__c = 'Finnish__c',
  French__c = 'French__c',
  German__c = 'German__c',
  Hungarian__c = 'Hungarian__c',
  Japanese__c = 'Japanese__c',
  Name = 'Name',
  Norwegian__c = 'Norwegian__c',
  NVP__c = 'NVP__c',
  Polish__c = 'Polish__c',
  Russian__c = 'Russian__c',
  Slovak__c = 'Slovak__c',
  Spanish__c = 'Spanish__c',
  Swedish__c = 'Swedish__c',
  USName__c = 'USName__c',
}

export const POST = async (request: Request): Promise<Response> => {
  try {
    const auth = await getAccessToken();

    const body = await request.json();

    const { id } = body;

    // const sinom = await fetch(
    //   `https://evaldo.my.salesforce.com/services/data/v60.0/query?q=SELECT+Id%2C+Approval_status__c%2C+Ave__c%2C+ColetorId__c%2C+ColetorName__c%2C+Estado__c%2C+Municipio__c%2C+Name%2C+QuemInformou__c%2C+Regiao__c+FROM+Musk__c+WHERE+ColetorId__c%3D${id}`,
    //   {
    //     method: 'GET',
    //     headers: {
    //       Authorization: `Bearer ${auth?.access_token}`,
    //     },
    //   }
    // );

    // if (data) {
    //   const returnedData = await data.json();
    //   const sinomData = await sinom.json();

    //   const mergedData = returnedData.records.map((record: BirdRecord) => {
    //     const matchingSinom = sinomData.records.filter((sinom: any) => sinom.Ave__c === record.Id);
    //     return {
    //       ...record,
    //       sinom: matchingSinom || null,
    //     };
    //   });

    //   return Response.json(mergedData);
    // }
    // return Response.json({});
  } catch (e: any) {
    throw new Error(e?.message);
  }
};
