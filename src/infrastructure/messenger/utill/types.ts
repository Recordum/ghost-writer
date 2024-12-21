export const REST_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

export type HttpRestMethod = (typeof REST_METHOD)[keyof typeof REST_METHOD];
