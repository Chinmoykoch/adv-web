import { Router } from "express";
import { adminOf, requireAdmin } from "../../middleware/requireAdmin";
import { adminCollections } from "./collections";
import { adminLeads } from "./leads";
import { adminPages } from "./pages";
import { adminUploads } from "./uploads";
import { adminGoogleReviews } from "./googleReviews";

// Everything under /api/admin requires a signed-in admin.
export const adminRoutes = Router();

adminRoutes.use(requireAdmin);
adminRoutes.get("/me", (req, res) => { res.json(adminOf(req)); });
adminRoutes.use("/google-reviews", adminGoogleReviews);
adminRoutes.use("/pages", adminPages);
adminRoutes.use("/leads", adminLeads);
adminRoutes.use("/collections/:collection", adminCollections);
adminRoutes.use("/uploads", adminUploads);
