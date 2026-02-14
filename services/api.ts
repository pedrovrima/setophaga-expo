import type { SearchResponse } from '~/services/searchMetadata';
import type { BirdLegacy } from '~/services/transformBird';

interface SalesforceAccessToken {
  access_token: string;
  token_format: string;
  scope: string;
  instance_url: string;
  id: string;
  token_type: string;
  api_instance_url: string;
}

export const searchSpecies = async (
  query: string,
  signal?: AbortSignal
): Promise<SearchResponse> => {
  const response = await fetch(`/search?q=${encodeURIComponent(query)}&limit=120`, { signal });

  if (!response.ok) {
    throw new Error(`Erro ao buscar espécies: ${response.status}`);
  }

  return response.json();
};

export const getSpeciesById = async (id: number, signal?: AbortSignal): Promise<BirdLegacy> => {
  const response = await fetch(`/species/${id}`, { signal });

  if (!response.ok) {
    throw new Error(`Erro ao carregar espécie ${id}: ${response.status}`);
  }

  return response.json();
};

export const createName = async (data: any) => {
  const createNameRequest = await fetch('/name', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return createNameRequest;
};

export const getAccessToken = async (): Promise<SalesforceAccessToken | null> => {
  const clientId = process.env.SALESFORCE_CLIENT_ID;
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
  const username = process.env.SALESFORCE_USERNAME;
  const password = process.env.SALESFORCE_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    return null;
  }

  const tokenResponse = await fetch('https://login.salesforce.com/services/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: clientId,
      client_secret: clientSecret,
      username,
      password,
    }).toString(),
  });

  if (!tokenResponse.ok) {
    throw new Error(`Erro ao autenticar no Salesforce: ${tokenResponse.status}`);
  }

  return tokenResponse.json();
};
