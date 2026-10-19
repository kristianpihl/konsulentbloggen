export type ResourceKind = "mal" | "verktoy";
export type ResourceStatus = "draft" | "published";

export const RESOURCE_KINDS: { value: ResourceKind; label: string; plural: string }[] = [
  { value: "mal", label: "Mal", plural: "Maler" },
  { value: "verktoy", label: "Verktøy", plural: "Verktøy" },
];

export function resourceKindLabel(kind: ResourceKind): string {
  return RESOURCE_KINDS.find((item) => item.value === kind)?.label ?? "Mal";
}

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
  kind: ResourceKind;
  cover_image_url: string | null;
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
