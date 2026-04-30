'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  FileUpload,
  Input,
  Select,
  Stepper,
  Switch,
  Textarea,
} from '@sanda/ui-web';
import {
  ArrowLeft,
  ImagePlus,
  Leaf,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useState } from 'react';

/* ---------------------------------------------------------------------------
 * Product Create / Edit Form — full product management form.
 *
 * Handles: basic info, category, production method, variants with pricing,
 * media upload, season config, allergens, and storage notes.
 * -------------------------------------------------------------------------- */

const productionMethods = [
  { value: 'CONVENTIONAL', label: 'Geleneksel tarım' },
  { value: 'GOOD_AGRICULTURE', label: 'İyi Tarım Uygulamaları' },
  { value: 'ORGANIC_TRANSITION', label: 'Organik geçiş dönemi' },
  { value: 'CERTIFIED_ORGANIC', label: 'Sertifikalı organik' },
  { value: 'NATURAL_TRADITIONAL', label: 'Atasal / doğal üretim' },
  { value: 'WILD_HARVESTED', label: 'Doğadan toplama' },
];

const unitOptions = [
  { value: 'KILOGRAM', label: 'Kilogram (kg)' },
  { value: 'GRAM', label: 'Gram (gr)' },
  { value: 'LITER', label: 'Litre (lt)' },
  { value: 'MILLILITER', label: 'Mililitre (ml)' },
  { value: 'PIECE', label: 'Adet' },
  { value: 'BUNCH', label: 'Demet' },
  { value: 'DOZEN', label: 'Düzine' },
  { value: 'BOX', label: 'Kutu' },
];

const months = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

interface Variant {
  id: string;
  nameTr: string;
  unit: string;
  quantityPerUnit: string;
  priceKurus: string;
  compareAtPriceKurus: string;
  stockQuantity: string;
  sku: string;
  isDefault: boolean;
}

interface InitialData {
  nameTr: string;
  nameEn: string;
  summary: string;
  description: string;
  categorySlug: string;
  productionMethod: string;
  originProvince: string;
  originRegion: string;
  isSeasonal: boolean;
  seasonStartMonth: number | null;
  seasonEndMonth: number | null;
  minOrderQty: number;
  maxOrderQty?: number;
  allergens: string[];
  harvestNotes: string;
  storageNotes: string;
  variants: Variant[];
  media: Array<{ url: string; altText: string | null }>;
}

export function ProductForm({
  mode = 'create',
  productId,
  initialData,
}: {
  mode?: 'create' | 'edit';
  productId?: string;
  initialData?: InitialData;
}) {
  const [step, setStep] = useState('basics');
  const [isSeasonal, setIsSeasonal] = useState(initialData?.isSeasonal ?? false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [variants, setVariants] = useState<Variant[]>(
    initialData?.variants?.length
      ? initialData.variants
      : [
          {
            id: '1',
            nameTr: '',
            unit: 'KILOGRAM',
            quantityPerUnit: '1',
            priceKurus: '',
            compareAtPriceKurus: '',
            stockQuantity: '',
            sku: '',
            isDefault: true,
          },
        ],
  );
  const [allergens, setAllergens] = useState<string[]>(initialData?.allergens ?? []);
  const [newAllergen, setNewAllergen] = useState('');

  const formSteps = [
    { id: 'basics', label: 'Temel bilgiler' },
    { id: 'variants', label: 'Varyantlar ve fiyat' },
    { id: 'media', label: 'Fotoğraflar' },
    { id: 'details', label: 'Detaylar' },
  ];

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        nameTr: '',
        unit: 'KILOGRAM',
        quantityPerUnit: '1',
        priceKurus: '',
        compareAtPriceKurus: '',
        stockQuantity: '',
        sku: '',
        isDefault: false,
      },
    ]);
  };

  const removeVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const updateVariant = (id: string, field: keyof Variant, value: string | boolean) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={'/satici/urunler' as Route}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {mode === 'create' ? 'Yeni ürün oluştur' : 'Ürünü düzenle'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === 'create'
                ? 'Ürünü taslak olarak oluştur. Varyant ve fotoğraf eklediğinde yayına alabilirsin.'
                : 'Ürün bilgilerini güncelle. Değişiklikler kaydedildiğinde vitrinde güncellenir.'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl gap-2">
            <Save className="h-4 w-4" />
            Taslak kaydet
          </Button>
          <Button className="rounded-xl gap-2 shadow-md shadow-primary/20">
            Yayına al
          </Button>
        </div>
      </div>

      {/* Stepper */}
      <Stepper steps={formSteps} currentStep={step} />

      {/* Step: Basics */}
      {step === 'basics' && (
        <Card className="border-border/70 shadow-sm">
          <CardContent className="space-y-6 p-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Ürün adı *</label>
              <Input placeholder="Örn: Ege Organik Zeytinyağı" className="text-lg" />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Ürünün ana adı. Vitrinde ve arama sonuçlarında görünür.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Kısa açıklama</label>
              <Input placeholder="Ürünü bir cümleyle tanımla" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Detaylı açıklama</label>
              <Textarea
                placeholder="Üretim süreci, lezzet profili, kullanım önerileri..."
                className="min-h-[120px]"
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Kategori *</label>
                <Select>
                  <option value="">Kategori seçin</option>
                  <option value="meyve">Meyve</option>
                  <option value="sebze">Sebze</option>
                  <option value="bal">Bal ve tatlandırıcılar</option>
                  <option value="zeytin">Zeytin ve yağlar</option>
                  <option value="sut">Süt ürünleri</option>
                  <option value="et">Et ve tavuk</option>
                  <option value="tahil">Tahıl ve baklagil</option>
                  <option value="kuru">Kuru gıda ve baharat</option>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Üretim yöntemi *</label>
                <Select>
                  <option value="">Yöntem seçin</option>
                  {productionMethods.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Menşe ili</label>
                <Input placeholder="Örn: 35 (İzmir)" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Menşe bölgesi</label>
                <Select>
                  <option value="">Bölge seçin</option>
                  <option value="MARMARA">Marmara</option>
                  <option value="AEGEAN">Ege</option>
                  <option value="MEDITERRANEAN">Akdeniz</option>
                  <option value="CENTRAL_ANATOLIA">İç Anadolu</option>
                  <option value="BLACK_SEA">Karadeniz</option>
                  <option value="EASTERN_ANATOLIA">Doğu Anadolu</option>
                  <option value="SOUTHEASTERN_ANATOLIA">Güneydoğu Anadolu</option>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
              <div>
                <p className="text-sm font-medium">Mevsimlik ürün mü?</p>
                <p className="text-xs text-muted-foreground">
                  Mevsimlik ürünler sezon dışında &ldquo;mevsim dışı&rdquo; olarak işaretlenir.
                </p>
              </div>
              <Switch checked={isSeasonal} onCheckedChange={setIsSeasonal} />
            </div>

            {isSeasonal && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Sezon başlangıcı</label>
                  <Select>
                    {months.map((m, i) => (
                      <option key={i} value={String(i + 1)}>
                        {m}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Sezon bitişi</label>
                  <Select>
                    {months.map((m, i) => (
                      <option key={i} value={String(i + 1)}>
                        {m}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button className="rounded-xl px-8" onClick={() => setStep('variants')}>
                Varyantlara geç →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Variants */}
      {step === 'variants' && (
        <div className="space-y-4">
          {variants.map((variant, index) => (
            <Card key={variant.id} className="border-border/70 shadow-sm">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-semibold">
                      Varyant {index + 1}
                    </h3>
                    {variant.isDefault && (
                      <Badge tone="info" className="rounded-md text-[10px]">Varsayılan</Badge>
                    )}
                  </div>
                  {variants.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeVariant(variant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Varyant adı *</label>
                    <Input
                      value={variant.nameTr}
                      onChange={(e) => updateVariant(variant.id, 'nameTr', e.target.value)}
                      placeholder="Örn: 500ml cam şişe"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">SKU</label>
                    <Input
                      value={variant.sku}
                      onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                      placeholder="Otomatik oluşturulur"
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Birim *</label>
                    <Select
                      value={variant.unit}
                      onChange={(e) => updateVariant(variant.id, 'unit', e.target.value)}
                    >
                      {unitOptions.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Birim miktarı *</label>
                    <Input
                      type="number"
                      value={variant.quantityPerUnit}
                      onChange={(e) => updateVariant(variant.id, 'quantityPerUnit', e.target.value)}
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Stok adedi *</label>
                    <Input
                      type="number"
                      value={variant.stockQuantity}
                      onChange={(e) => updateVariant(variant.id, 'stockQuantity', e.target.value)}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Fiyat (₺) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={variant.priceKurus}
                      onChange={(e) => updateVariant(variant.id, 'priceKurus', e.target.value)}
                      placeholder="0.00"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Komisyon sonrası net tutarınız: hesaplanıyor...
                    </p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Karşılaştırma fiyatı (₺)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={variant.compareAtPriceKurus}
                      onChange={(e) => updateVariant(variant.id, 'compareAtPriceKurus', e.target.value)}
                      placeholder="İndirimli fiyat gösteriminde kullanılır"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <button
            type="button"
            onClick={addVariant}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/80 p-6 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
          >
            <Plus className="h-4 w-4" />
            Yeni varyant ekle
          </button>

          <div className="flex justify-between">
            <Button variant="outline" className="rounded-xl" onClick={() => setStep('basics')}>
              ← Temel bilgiler
            </Button>
            <Button className="rounded-xl px-8" onClick={() => setStep('media')}>
              Fotoğraflara geç →
            </Button>
          </div>
        </div>
      )}

      {/* Step: Media */}
      {step === 'media' && (
        <Card className="border-border/70 shadow-sm">
          <CardContent className="space-y-6 p-6">
            <div>
              <h2 className="font-display text-xl font-semibold">Ürün fotoğrafları</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                En az 1, en fazla 8 fotoğraf yükle. İlk fotoğraf vitrin kapağı olarak kullanılır.
                Yüksek kaliteli, doğal ışıkta çekilmiş fotoğraflar tercih edilir.
              </p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-border/70">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Ürün fotoğrafı ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {i === 0 && (
                      <Badge tone="info" className="absolute left-2 top-2 rounded-md text-[10px]">
                        Kapak
                      </Badge>
                    )}
                    <button
                      type="button"
                      onClick={() => setUploadedFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <FileUpload
              accept="image/*"
              multiple
              maxSizeMb={10}
              onFilesSelected={(files) =>
                setUploadedFiles((prev) => [...prev, ...files].slice(0, 8))
              }
            >
              <ImagePlus className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">
                Fotoğraf sürükle veya <span className="text-primary">seç</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                JPG, PNG, WebP — Maksimum 10 MB, en fazla 8 fotoğraf
              </p>
            </FileUpload>

            <div className="flex justify-between">
              <Button variant="outline" className="rounded-xl" onClick={() => setStep('variants')}>
                ← Varyantlar
              </Button>
              <Button className="rounded-xl px-8" onClick={() => setStep('details')}>
                Detaylara geç →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Details */}
      {step === 'details' && (
        <Card className="border-border/70 shadow-sm">
          <CardContent className="space-y-6 p-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Hasat notları</label>
              <Textarea
                placeholder="Hasat zamanı, yöntemi, özel koşullar..."
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Saklama koşulları</label>
              <Textarea
                placeholder="Serin ve kuru yerde, buzdolabında, oda sıcaklığında..."
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Alerjenler</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {allergens.map((a) => (
                  <Badge key={a} tone="outline" className="gap-1 rounded-lg">
                    {a}
                    <button
                      type="button"
                      onClick={() => setAllergens((prev) => prev.filter((x) => x !== a))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newAllergen}
                  onChange={(e) => setNewAllergen(e.target.value)}
                  placeholder="Alerjen ekle (ör: gluten, fındık)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newAllergen.trim()) {
                      e.preventDefault();
                      setAllergens((prev) => [...prev, newAllergen.trim()]);
                      setNewAllergen('');
                    }
                  }}
                />
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    if (newAllergen.trim()) {
                      setAllergens((prev) => [...prev, newAllergen.trim()]);
                      setNewAllergen('');
                    }
                  }}
                >
                  Ekle
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Minimum sipariş adedi</label>
                <Input type="number" defaultValue="1" placeholder="1" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Maksimum sipariş adedi</label>
                <Input type="number" placeholder="Sınırsız" />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" className="rounded-xl" onClick={() => setStep('media')}>
                ← Fotoğraflar
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl gap-2">
                  <Save className="h-4 w-4" />
                  Taslak kaydet
                </Button>
                <Button className="rounded-xl gap-2 shadow-md shadow-primary/20">
                  <Leaf className="h-4 w-4" />
                  Yayına al
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
