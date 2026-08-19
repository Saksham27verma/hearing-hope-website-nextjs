type SchemaScriptProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
  id?: string;
};

export function SchemaScript({ data, id }: SchemaScriptProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
