import { Router } from 'express';
import { gamesGetMany } from '../endpoints/games';

const router = Router();

/**
 * GET /games
 * @tag Games
 * @response 204
 * @response default
 * @responseContent {Error} default.application/json
 */
router.get('/games', gamesGetMany);

export default router;
