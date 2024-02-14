import { ENV_CONFIG } from 'env_config';

export const postCall = async (path: string, token: string, body?: unknown): Promise<any> => {
  if (path.startsWith('/')) {
    path = path.slice(1);
  }

  const response = await fetch(`${ENV_CONFIG.BACKEND_BASE_URL}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body ?? {}),
  });

  if (!response.ok) {
    throw new Error(`A call to "${path}" failed with status ${response.status}`);
  }
  const responseJson = await response.json();
  return responseJson;
};

export const deleteCall = async (path: string, token: string): Promise<void> => {
  await fetch(`${ENV_CONFIG.BACKEND_BASE_URL}/${path}`, {
    method: 'DELETE',
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
};

export const getCall = async (path: string, token: string): Promise<Response> => {
  const response = await fetch(`${ENV_CONFIG.BACKEND_BASE_URL}/${path}`, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  return response;
};
