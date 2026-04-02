import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import type { OurFileRouter } from "@/server/uploadthing";

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const uploadThingUrl = `${basePath}/api/uploadthing`;

export const UploadButton = generateUploadButton<OurFileRouter>({
  url: uploadThingUrl,
});
export const UploadDropzone = generateUploadDropzone<OurFileRouter>({
  url: uploadThingUrl,
});
