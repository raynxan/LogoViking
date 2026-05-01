import { Router, type IRouter } from "express";
import healthRouter from "./health";
import toolsRouter from "./tools";
import authRouter from "./auth";
import userRouter from "./user";
import blogRouter from "./blog";
import contactRouter from "./contact";
import sitemapRouter from "./sitemap";
import billingRouter from "./billing";

const router: IRouter = Router();

router.use(healthRouter);
router.use(toolsRouter);
router.use(authRouter);
router.use(userRouter);
router.use(blogRouter);
router.use(contactRouter);
router.use(sitemapRouter);
router.use(billingRouter);

export default router;
