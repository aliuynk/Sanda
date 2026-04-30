'use client';

import type { AppRouter } from '@sanda/api/client';
import {
  Badge,
  Button,
  Card,
  CardContent,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  Switch,
  TabsContent,
  Textarea,
  useToast,
} from '@sanda/ui-web';
import type { inferRouterOutputs } from '@trpc/server';
import {
  CheckCircle2,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { trpc } from '@/trpc/shared';

interface InitialAccount {
  firstName: string;
  lastName: string;
  displayName: string | null;
  email: string;
  phone: string;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  marketingOptIn: boolean;
}

type AddressRow = inferRouterOutputs<AppRouter>['auth']['myAddresses'][number];

interface AccountTabsProps {
  initialAccount: InitialAccount;
  initialAddresses: AddressRow[];
}

export function AccountTabs({ initialAccount, initialAddresses }: AccountTabsProps) {
  const router = useRouter();
  const toast = useToast();
  const utils = trpc.useUtils();

  const [profile, setProfile] = useState(initialAccount);
  const [editingAddress, setEditingAddress] = useState<AddressRow | null>(null);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);

  const { data: addresses = initialAddresses } = trpc.auth.myAddresses.useQuery(undefined, {
    initialData: initialAddresses,
  });

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: async () => {
      toast.success('Profil güncellendi');
      await utils.auth.me.invalidate();
      router.refresh();
    },
    onError: (e) => toast.error('Güncelleme başarısız', e.message),
  });

  const deleteAddress = trpc.auth.deleteAddress.useMutation({
    onSuccess: async () => {
      toast.success('Adres silindi');
      await utils.auth.myAddresses.invalidate();
    },
    onError: (e) => toast.error('Silme başarısız', e.message),
  });

  const setDefaultAddress = trpc.auth.setDefaultAddress.useMutation({
    onSuccess: async () => {
      toast.success('Varsayılan adres güncellendi');
      await utils.auth.myAddresses.invalidate();
    },
    onError: (e) => toast.error('Güncelleme başarısız', e.message),
  });

  return (
    <>
      <TabsContent value="profile">
        <Card className="border-border/70 shadow-sm">
          <CardContent className="space-y-6 p-6">
            <div>
              <h2 className="font-display text-xl font-semibold">Profil bilgileri</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Kişisel bilgilerin yalnızca sipariş ve iletişim amaçlı kullanılır.
              </p>
            </div>
            <form
              className="grid gap-5 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                updateProfile.mutate({
                  firstName: profile.firstName.trim() || undefined,
                  lastName: profile.lastName.trim() || undefined,
                  displayName: profile.displayName?.trim() || null,
                  email: profile.email.trim() || undefined,
                  marketingOptIn: profile.marketingOptIn,
                });
              }}
            >
              <Field label="Ad">
                <Input
                  value={profile.firstName}
                  onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                  required
                />
              </Field>
              <Field label="Soyad">
                <Input
                  value={profile.lastName}
                  onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                  required
                />
              </Field>
              <Field
                label="Görünür isim"
                hint="Üretici sayfanda ve yorumlarda kullanılır."
              >
                <Input
                  value={profile.displayName ?? ''}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, displayName: e.target.value || null }))
                  }
                  placeholder="İsteğe bağlı"
                />
              </Field>
              <Field label="E-posta">
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  placeholder="ornek@eposta.com"
                />
              </Field>
              <Field
                label="Telefon"
                hint="OTP doğrulamalı; değişiklik için destek talebi açılmalıdır."
              >
                <div className="flex items-center gap-2">
                  <Input value={profile.phone} disabled className="font-mono" />
                  {profile.phoneVerified ? (
                    <Badge tone="success" className="rounded-md text-[10px]">
                      <ShieldCheck className="h-2.5 w-2.5" /> Doğrulanmış
                    </Badge>
                  ) : (
                    <Badge tone="warning" className="rounded-md text-[10px]">
                      Doğrulanmamış
                    </Badge>
                  )}
                </div>
              </Field>

              <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 p-4">
                <div>
                  <p className="text-sm font-medium">Pazarlama bildirimleri</p>
                  <p className="text-xs text-muted-foreground">
                    Sezonluk fırsatları ve üretici hikâyelerini al.
                  </p>
                </div>
                <Switch
                  checked={profile.marketingOptIn}
                  onCheckedChange={(checked) =>
                    setProfile((p) => ({ ...p, marketingOptIn: checked }))
                  }
                />
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" loading={updateProfile.isPending} className="rounded-xl">
                  Değişiklikleri kaydet
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="addresses">
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <Card key={addr.id} className="border-border/70 shadow-sm">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-display font-semibold">
                      {addr.label ?? 'Adres'}
                    </span>
                  </div>
                  {addr.isDefault ? (
                    <Badge tone="success" className="rounded-md text-[10px]">
                      <Star className="h-2.5 w-2.5" /> Varsayılan
                    </Badge>
                  ) : null}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{addr.recipient}</p>
                  <p className="font-mono text-xs">{addr.phone}</p>
                  <p>{addr.line1}</p>
                  {addr.line2 ? <p>{addr.line2}</p> : null}
                  <p>
                    İl {addr.provinceCode} · İlçe #{addr.districtId}
                    {addr.postalCode ? ` · ${addr.postalCode}` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 border-t border-border/50 pt-3 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddress(addr);
                      setAddressDialogOpen(true);
                    }}
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                  >
                    <Pencil className="h-3 w-3" /> Düzenle
                  </button>
                  {!addr.isDefault ? (
                    <button
                      type="button"
                      onClick={() => setDefaultAddress.mutate({ id: addr.id })}
                      className="inline-flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <Star className="h-3 w-3" /> Varsayılan yap
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Bu adres silinsin mi?')) {
                        deleteAddress.mutate({ id: addr.id });
                      }
                    }}
                    className="inline-flex items-center gap-1 font-semibold text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" /> Sil
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
          <button
            type="button"
            onClick={() => {
              setEditingAddress(null);
              setAddressDialogOpen(true);
            }}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/80 p-10 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium">Yeni adres ekle</span>
          </button>
        </div>
      </TabsContent>

      <TabsContent value="notifications">
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-6">
            <h2 className="font-display text-xl font-semibold">Bildirim tercihleri</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sipariş ve kargo bildirimleri her zaman açıktır. Diğer bildirimleri buradan
              yönetebilirsin.
            </p>
            <div className="mt-6 space-y-3">
              <NotificationRow
                label="Pazarlama ve fırsatlar"
                desc="Sezonluk fırsatlar ve takip ettiğin üreticilerden haberler."
                checked={profile.marketingOptIn}
                onChange={(c) => {
                  setProfile((p) => ({ ...p, marketingOptIn: c }));
                  updateProfile.mutate({ marketingOptIn: c });
                }}
              />
              <NotificationRow label="Sipariş güncellemeleri" desc="Her zaman açık." checked disabled />
              <NotificationRow label="Kargo takip" desc="Her zaman açık." checked disabled />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <AddressDialog
        open={addressDialogOpen}
        onOpenChange={(open) => {
          setAddressDialogOpen(open);
          if (!open) setEditingAddress(null);
        }}
        editing={editingAddress}
      />
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function NotificationRow({
  label,
  desc,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-xl border border-border/60 p-4',
        disabled && 'opacity-70',
      )}
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange ?? (() => {})} disabled={disabled} />
    </div>
  );
}

function AddressDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: AddressRow | null;
}) {
  const utils = trpc.useUtils();
  const toast = useToast();

  const [form, setForm] = useState<{
    label: string;
    recipient: string;
    phone: string;
    line1: string;
    line2: string;
    provinceCode: string;
    districtId: number | undefined;
    postalCode: string;
    notes: string;
    isDefault: boolean;
  }>(() => ({
    label: editing?.label ?? '',
    recipient: editing?.recipient ?? '',
    phone: editing?.phone ?? '',
    line1: editing?.line1 ?? '',
    line2: editing?.line2 ?? '',
    provinceCode: editing?.provinceCode ?? '',
    districtId: editing?.districtId,
    postalCode: editing?.postalCode ?? '',
    notes: editing?.notes ?? '',
    isDefault: editing?.isDefault ?? false,
  }));

  // Reset form when editing changes
  useStateSync(editing, () =>
    setForm({
      label: editing?.label ?? '',
      recipient: editing?.recipient ?? '',
      phone: editing?.phone ?? '',
      line1: editing?.line1 ?? '',
      line2: editing?.line2 ?? '',
      provinceCode: editing?.provinceCode ?? '',
      districtId: editing?.districtId,
      postalCode: editing?.postalCode ?? '',
      notes: editing?.notes ?? '',
      isDefault: editing?.isDefault ?? false,
    }),
  );

  const create = trpc.auth.createAddress.useMutation({
    onSuccess: async () => {
      toast.success('Adres eklendi');
      await utils.auth.myAddresses.invalidate();
      onOpenChange(false);
    },
    onError: (e) => toast.error('Eklenemedi', e.message),
  });

  const update = trpc.auth.updateAddress.useMutation({
    onSuccess: async () => {
      toast.success('Adres güncellendi');
      await utils.auth.myAddresses.invalidate();
      onOpenChange(false);
    },
    onError: (e) => toast.error('Güncellenemedi', e.message),
  });

  const isPending = create.isPending || update.isPending;
  const canSubmit =
    form.recipient.trim() &&
    /^\+90(5\d{9})$/.test(form.phone) &&
    form.line1.trim() &&
    form.provinceCode &&
    form.districtId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Adresi düzenle' : 'Yeni adres ekle'}</DialogTitle>
          <DialogDescription>
            Doğru kargo hesaplaması ve teslimat için il/ilçe ve telefon bilgisi zorunludur.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            const payload = {
              label: form.label.trim() || null,
              recipient: form.recipient.trim(),
              phone: form.phone.trim(),
              line1: form.line1.trim(),
              line2: form.line2.trim() || null,
              provinceCode: form.provinceCode,
              districtId: form.districtId!,
              postalCode: form.postalCode.trim() || null,
              notes: form.notes.trim() || null,
              isDefault: form.isDefault,
            };
            if (editing) {
              update.mutate({ id: editing.id, patch: payload });
            } else {
              create.mutate(payload);
            }
          }}
        >
          <Field label="Etiket">
            <Input
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="Ev, iş…"
            />
          </Field>
          <Field label="Alıcı">
            <Input
              value={form.recipient}
              onChange={(e) => setForm((f) => ({ ...f, recipient: e.target.value }))}
              required
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Telefon" hint="Format: +90 5XX XXX XX XX">
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+905XXXXXXXXX"
                required
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Adres satırı 1">
              <Input
                value={form.line1}
                onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
                placeholder="Mahalle, cadde, no"
                required
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Adres satırı 2 (opsiyonel)">
              <Input
                value={form.line2}
                onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
                placeholder="Daire, kat, kapı no"
              />
            </Field>
          </div>
          <Field label="İl">
            <ProvinceField
              value={form.provinceCode}
              onChange={(code) =>
                setForm((f) => ({ ...f, provinceCode: code, districtId: undefined }))
              }
            />
          </Field>
          <Field label="İlçe">
            <DistrictField
              provinceCode={form.provinceCode}
              value={form.districtId}
              onChange={(id) => setForm((f) => ({ ...f, districtId: id }))}
            />
          </Field>
          <Field label="Posta kodu">
            <Input
              value={form.postalCode}
              onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
              placeholder="5 hane"
              maxLength={5}
            />
          </Field>
          <div className="flex items-center gap-3 self-end rounded-xl border border-border/70 bg-muted/30 p-3">
            <Switch
              checked={form.isDefault}
              onCheckedChange={(checked) => setForm((f) => ({ ...f, isDefault: checked }))}
            />
            <div className="text-xs">
              <p className="font-medium">Varsayılan yap</p>
              <p className="text-[11px] text-muted-foreground">
                Sipariş sırasında ilk seçili adres.
              </p>
            </div>
          </div>
          <div className="sm:col-span-2">
            <Field label="Notlar (kapıcı, kat, ek bilgi)">
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </Field>
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Vazgeç
            </Button>
            <Button type="submit" loading={isPending} disabled={!canSubmit}>
              <CheckCircle2 className="h-4 w-4" />
              {editing ? 'Güncelle' : 'Adres ekle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function useStateSync<T>(value: T, onChange: () => void) {
  useEffect(() => {
    onChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
}

function ProvinceField({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const { data, isLoading } = trpc.geo.provinces.useQuery();
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={isLoading}
    >
      <option value="">İl seçin</option>
      {(data ?? []).map((p) => (
        <option key={p.id} value={p.code}>
          {p.code} · {p.nameTr}
        </option>
      ))}
    </Select>
  );
}

function DistrictField({
  provinceCode,
  value,
  onChange,
}: {
  provinceCode: string;
  value: number | undefined;
  onChange: (id: number | undefined) => void;
}) {
  const { data: provinces } = trpc.geo.provinces.useQuery();
  const provinceId = (provinces ?? []).find((p) => p.code === provinceCode)?.id ?? 0;
  const { data, isLoading } = trpc.geo.districts.useQuery(
    { provinceId },
    { enabled: provinceId > 0 },
  );
  return (
    <Select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
      disabled={isLoading || !provinceCode}
    >
      <option value="">İlçe seçin</option>
      {(data ?? []).map((d) => (
        <option key={d.id} value={d.id}>
          {d.nameTr}
        </option>
      ))}
    </Select>
  );
}
