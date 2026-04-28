'use client';

import {
  Button,
  Card,
  CardContent,
  FileUpload,
  Input,
  Select,
} from '@sanda/ui-web';
import { ArrowLeft, FileCheck2, Upload } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useState } from 'react';

const certTypes = [
  { value: 'ORGANIC_TR', label: 'Organik sertifika (TR)' },
  { value: 'ORGANIC_EU', label: 'Organik sertifika (AB)' },
  { value: 'GOOD_AGRICULTURE_TR', label: 'İyi Tarım Uygulamaları' },
  { value: 'GEOGRAPHICAL_INDICATION', label: 'Coğrafi işaret' },
  { value: 'HALAL', label: 'Helal sertifikası' },
  { value: 'GLOBAL_GAP', label: 'GlobalG.A.P.' },
  { value: 'HACCP', label: 'HACCP' },
  { value: 'ISO_22000', label: 'ISO 22000' },
  { value: 'TSE', label: 'TSE belgesi' },
  { value: 'FAIR_TRADE', label: 'Fair Trade' },
  { value: 'OTHER', label: 'Diğer' },
];

export function CertificationUploadForm() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href={'/satici/sertifikalar' as Route}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Sertifika yükle</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organik, İyi Tarım, coğrafi işaret ve diğer belgelerini yükle. Admin ekibi belgeyi inceleyip doğrulayacak.
          </p>
        </div>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Sertifika türü *</label>
              <Select>
                <option value="">Tür seçin</option>
                {certTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Veren kuruluş *</label>
              <Input placeholder="Örn: ETKO, CERES, IMO, ECOCERT" />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Sertifika numarası *</label>
              <Input placeholder="Belge üzerindeki no" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Kapsam açıklaması</label>
              <Input placeholder="Hangi ürün grubu / alan" />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Düzenlenme tarihi *</label>
              <Input type="date" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Geçerlilik bitiş tarihi *</label>
              <Input type="date" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Belge dosyası *</label>
            {uploadedFile ? (
              <div className="flex items-center justify-between rounded-xl border border-primary/25 bg-primary/[0.04] p-4">
                <div className="flex items-center gap-3">
                  <FileCheck2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{uploadedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => setUploadedFile(null)}
                >
                  Değiştir
                </Button>
              </div>
            ) : (
              <FileUpload
                accept=".pdf,.jpg,.jpeg,.png"
                maxSizeMb={20}
                onFilesSelected={(files) => setUploadedFile(files[0] ?? null)}
              >
                <Upload className="mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-medium">
                  PDF veya fotoğraf <span className="text-primary">yükle</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF, JPG, PNG — Maksimum 20 MB
                </p>
              </FileUpload>
            )}
          </div>

          <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-4 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Doğrulama süreci</p>
            <ul className="mt-2 space-y-1 list-inside list-disc">
              <li>Yüklenen belge admin ekibi tarafından incelenir.</li>
              <li>TR-BIO organik sertifikaları Tarım Bakanlığı registrisi ile çapraz doğrulanır.</li>
              <li>Onaylanan sertifikalar ürün kartlarında rozet olarak görünür.</li>
              <li>Süresi dolan sertifikalar otomatik olarak vitrinden kaldırılır.</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Link href={'/satici/sertifikalar' as Route}>
              <Button variant="outline" className="rounded-xl">İptal</Button>
            </Link>
            <Button className="rounded-xl gap-2 shadow-md shadow-primary/20">
              <Upload className="h-4 w-4" />
              Sertifikayı gönder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
