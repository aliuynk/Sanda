import { Badge, Card, CardContent, EmptyState } from '@sanda/ui-web';
import { Tags } from 'lucide-react';

import { getServerTrpc } from '@/trpc/server';

export const metadata = {
  title: 'Kategoriler',
};

export default async function CategoriesAdminPage() {
  const trpc = await getServerTrpc();
  const tree = await trpc.admin.categories.listTree();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          İçerik
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Kategoriler
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Hiyerarşik taksonomi. Her kategorinin sıralaması ve görünürlüğü, ürün listesini doğrudan
          etkiler. Belge kapısı (organik, HACCP…) <code className="rounded bg-muted px-1.5 py-0.5
          font-mono text-[11px]">@sanda/core/listing-compliance</code>{' '}
          modülünden gelir.
        </p>
      </header>

      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardContent className="p-0">
          {tree.length === 0 ? (
            <EmptyState
              icon={<Tags className="h-10 w-10" />}
              title="Henüz kategori tanımlanmamış"
              description="Seed dosyasını çalıştırınca temel taksonomi yüklenir."
            />
          ) : (
            <ul className="divide-y divide-border/50">
              {tree.map((cat) => (
                <li key={cat.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-semibold">{cat.nameTr}</p>
                      <p className="text-xs text-muted-foreground">
                        /kesfet?kategori={cat.slug}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="outline" className="rounded-md text-[10px]">
                        {cat._count.products} ürün
                      </Badge>
                      {cat.isActive ? (
                        <Badge tone="success" className="rounded-md text-[10px]">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge tone="neutral" className="rounded-md text-[10px]">
                          Pasif
                        </Badge>
                      )}
                    </div>
                  </div>
                  {cat.children.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2 pl-2">
                      {cat.children.map((child) => (
                        <Badge key={child.id} tone="outline" className="rounded-md">
                          {child.nameTr}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
