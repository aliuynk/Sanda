import { Alert, AlertDescription, AlertTitle } from '@sanda/ui-web';
import { AlertTriangle } from 'lucide-react';

type ZodIssues = { formErrors: string[]; fieldErrors: Record<string, string[] | undefined> };
type TrpcLike = { message: string; data?: { zodIssues?: ZodIssues } | unknown | null } | null | undefined;

function extractIssues(data: unknown): ZodIssues | undefined {
  if (data && typeof data === 'object' && 'zodIssues' in data) {
    const v = (data as { zodIssues?: unknown }).zodIssues;
    if (v && typeof v === 'object') return v as ZodIssues;
  }
  return undefined;
}

/**
 * Compact, human-readable error block for mutation failures. Extracts zod
 * field issues where available so the user sees why the submit was rejected.
 */
export function TrpcError({ error, title = 'İşlem tamamlanamadı' }: { error: TrpcLike; title?: string }) {
  if (!error) return null;
  const issues = extractIssues(error.data);
  const formErrors = issues?.formErrors ?? [];
  const fieldEntries = Object.entries(issues?.fieldErrors ?? {}).filter(
    ([, v]) => v && v.length > 0,
  ) as Array<[string, string[]]>;

  return (
    <Alert tone="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{error.message}</p>
        {formErrors.length > 0 ? (
          <ul className="mt-2 list-inside list-disc text-xs">
            {formErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : null}
        {fieldEntries.length > 0 ? (
          <ul className="mt-2 list-inside list-disc text-xs">
            {fieldEntries.map(([field, errs]) => (
              <li key={field}>
                <code className="font-mono">{field}</code>: {errs.join(', ')}
              </li>
            ))}
          </ul>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
