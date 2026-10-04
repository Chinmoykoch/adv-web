import { z } from "zod";
import { text } from "./fields";

export const leadStatuses = ["new", "contacted", "booked", "closed", "spam"] as const;

// What the public enquiry form may send. Anything else the form collects goes in `extra`,
// so a new form field is stored without a database change.
export const leadSubmissionSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{6,20}$/, "Please enter a valid phone number"),
  email: z.email("Please enter a valid email").max(254).optional().or(z.literal("").transform(() => undefined)),
  message: text(2000),
  carId: z.uuid().optional().or(z.literal("").transform(() => undefined)),
  pickupDate: z.iso.date().optional().or(z.literal("").transform(() => undefined)),
  returnDate: z.iso.date().optional().or(z.literal("").transform(() => undefined)),
  sourcePath: z.string().trim().max(300).regex(/^\//, "Must be a site path").optional(),
  utmSource: text(100),
  utmMedium: text(100),
  utmCampaign: text(100),
  consent: z.literal(true, "Please agree to be contacted about your enquiry"),
  extra: z.record(z.string().regex(/^[a-zA-Z][a-zA-Z0-9]{0,39}$/), z.string().max(500))
    .refine((value) => Object.keys(value).length <= 20, "Too many extra fields").optional(),
  // Honeypot: hidden from people, so only bots fill it in.
  website: z.string().max(500).optional(),
}).refine((lead) => !lead.pickupDate || !lead.returnDate || lead.returnDate >= lead.pickupDate, {
  path: ["returnDate"],
  message: "Return date must be on or after the pickup date",
});

export const leadUpdateSchema = z.object({
  status: z.enum(leadStatuses).optional(),
  adminNotes: text(5000),
}).refine((value) => value.status !== undefined || value.adminNotes !== undefined, "Nothing to update");

export const leadListQuery = z.object({
  status: z.enum(leadStatuses).optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
