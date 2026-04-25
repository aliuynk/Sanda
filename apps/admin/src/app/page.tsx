import { Card, CardContent, CardHeader, CardTitle } from '@sanda/ui-web';

export default function AdminHome() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Operasyon paneli</h1>
      <p className="text-muted-foreground">
        Sanda’nın iç paneline hoş geldiniz. Soldaki menüden ilgili modüle ilerleyin.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: 'Bekleyen üretici başvuruları', value: '—' },
          { title: 'Onay bekleyen sertifikalar', value: '—' },
          { title: 'Açık uyuşmazlıklar', value: '—' },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{stat.value}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
