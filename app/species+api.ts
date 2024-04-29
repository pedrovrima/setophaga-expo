import { getAccessToken } from '~/services/api';

export interface BirdRecord {
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
}

export enum Criteria {
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

export const GET = async (): Promise<Response> => {
  try {
    const auth = await getAccessToken();

    const data = await fetch(
      'https://evaldo.my.salesforce.com/services/data/v60.0/query?q=SELECT+Id+c%2Danish__c%2CDutch__c%2CEbird__c%2CEspecie__c%2CEstonian__c%2CEvaldo__c%2CFamilia__c%2CFinnish__c%2CFrench__c%2CGenero__c%2CGerman__c%2CHungarian__c%2CJapanese__c%2CName%2CNorwegian__c%2CNVP__c%2COrdem__c%2CPolish__c%2CRussian__c%2CSlovak__c%2CSpanish__c%2CSwedish__c%2CTaxon__c%2CUSName__c+FROM+elon__c+WHERE+Categoria__c+%3D+%27Esp%C3%A9cie%27',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${auth?.access_token}`,
        },
      }
    );

    const returnedData = await data.json();

    return Response.json(returnedData.records);
  } catch (e) {
    throw new Error('error');
  }
};
