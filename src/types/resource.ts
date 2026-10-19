export type ResourceStatus = "draft" | "published";

export interface ResourceFile {
  name: string;
  path: string;
  url: string;
  size: number;
  type: string;
}

export interface Resource {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  // En av kategoriene i src/lib/categories.ts, eller null.
  category: string | null;
  cover_image_url: string | null;
  best_for: string[];
  key_features: string[];
  files: ResourceFile[];
  status: ResourceStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export const RESOURCE_BUCKET = "resource-files";
export const MAX_RESOURCE_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_RESOURCE_FILES = 10;
export const MAX_RESOURCE_CONTENT_LENGTH = 20000;

// Fil-endelser som kan lastes opp som vedlegg.
export const ALLOWED_RESOURCE_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "csv",
  "txt",
  "md",
  "json",
  "zip",
  "png",
  "jpg",
  "jpeg",
  "svg",
];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

// Lenke som tvinger nedlasting (i stedet for å åpne filen i nettleseren).
export function downloadUrl(file: ResourceFile): string {
  const separator = file.url.includes("?") ? "&" : "?";
  return `${file.url}${separator}download=${encodeURIComponent(file.name)}`;
}

const FILE_TYPE_LABELS: Record<string, string> = {
  pptx: "PowerPoint",
  ppt: "PowerPoint",
  pdf: "PDF",
  docx: "Word",
  doc: "Word",
  xlsx: "Excel",
  xls: "Excel",
  csv: "CSV",
  zip: "ZIP",
  png: "bilde",
  jpg: "bilde",
  jpeg: "bilde",
  svg: "bilde",
};

// Kort navn på filtypen, for eksempel «PowerPoint» eller «PDF».
export function fileTypeLabel(file: ResourceFile): string {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return FILE_TYPE_LABELS[extension] ?? (extension ? extension.toUpperCase() : "fil");
}
