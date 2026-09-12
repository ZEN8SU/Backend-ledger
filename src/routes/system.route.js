import {Router} from 'express'
import { createInitialFunds , promoteToSystemUser } from '../controllers/system.controller.js'
import { verifySystemUser } from '../middlewares/authSystem.middleware.js'

const router = Router();

router.route(verifySystemUser);

router.route("/initial-funds").post(createInitialFunds);
router.route("/promote").post(promoteToSystemUser);

export default router;