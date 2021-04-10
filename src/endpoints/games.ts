import { endpoint } from '@ev-fns/endpoint';

export const gamesGetMany = endpoint(async (req, res) => {
  res.status(204).end();
});
