import { Spinner } from '@sanda/ui-web';

export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
