interface SalesforceAccessToken {
  access_token: string;
  token_format: string;
  scope: string;
  instance_url: string;
  id: string;
  token_type: string;
  api_instance_url: string;
}

export const getAllSpecies = async () => {
  const _species = await fetch('/species');
  const species = await _species.json();
  return species;
};

export const getAccessToken = async (): Promise<SalesforceAccessToken> => {
  const _auth = await fetch('https://login.salesforce.com/services/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${process.env.JWT}`,
  });

  const auth = await _auth.json();
  return auth;
};

export const createName = async (data: any) => {
  const createName = await fetch('/name', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  console.log(createName);
  return createName;
};
