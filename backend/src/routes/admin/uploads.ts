import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { HttpError } from "../../lib/http";
import { storagePath, toWebp, uploadWebp } from "../../services/media";

// Images are converted to WebP before storage, so the original can be larger than the
// bucket's 5 MB limit (phone photos often are); the stored WebP is usually well under 1 MB.
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1, fields: 5 },
});

const folders = ["pages", "blogs", "fleet", "services", "testimonials", "happy-customers", "site"] as const;
const bodySchema = z.object({
  // Which part of the site the image is for; becomes its storage folder.
  folder: z.enum(folders).default("pages"),
  // Used for a readable file name, e.g. the car's name or the image's alt text.
  name: z.string().trim().max(120).optional(),
});

export const adminUploads = Router();

adminUploads.post("/", (req, res, next) => {
  upload.single("file")(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      return next(new HttpError(error.code === "LIMIT_FILE_SIZE" ? 413 : 400, error.code === "LIMIT_FILE_SIZE" ? "That image is larger than 15 MB. Choose a smaller one." : "Upload one image file."));
    }
    next(error);
  });
}, async (req, res) => {
  if (!req.file) throw new HttpError(400, "Choose an image to upload.");
  const { folder, name } = bodySchema.parse(req.body);
  const image = await toWebp(req.file.buffer);
  const path = storagePath(folder, name || req.file.originalname, image.data);
  res.status(201).json(await uploadWebp(path, image));
});
