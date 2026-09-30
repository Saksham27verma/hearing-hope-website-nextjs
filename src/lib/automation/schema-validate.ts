type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function typesOf(value: unknown) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return [value];
  return [];
}

export function validateJsonLd(value: unknown) {
  const errors: string[] = [];
  if (!isRecord(value)) return { ok: false, errors: ["JSON-LD must be an object."] };
  if (!value["@context"]) errors.push("Missing @context.");
  const types = typesOf(value["@type"]);
  if (!types.length) errors.push("Missing @type.");
  const type = types.join(" ");

  if (type.includes("FAQPage") && !Array.isArray(value.mainEntity)) {
    errors.push("FAQPage requires mainEntity.");
  }
  if ((type.includes("MedicalClinic") || type.includes("LocalBusiness")) && !isRecord(value.address)) {
    errors.push("Clinic schema requires address.");
  }
  if (type.includes("Product") && !value.name) errors.push("Product schema requires name.");
  if (type.includes("MedicalTest") && !value.name) errors.push("MedicalTest schema requires name.");
  if (type.includes("MedicalCondition") && !value.name) errors.push("MedicalCondition schema requires name.");
  if (type.includes("Article") && !value.headline) errors.push("Article schema requires headline.");
  if (type.includes("BreadcrumbList") && !Array.isArray(value.itemListElement)) {
    errors.push("BreadcrumbList requires itemListElement.");
  }

  return { ok: errors.length === 0, errors };
}
