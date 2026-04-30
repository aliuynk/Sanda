'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Input,
  Select,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  useToast,
} from '@sanda/ui-web';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Plus,
  Sprout,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

/* ---------------------------------------------------------------------------
 * Farm Visit Management — Seller Dashboard
 *
 * Sellers who opt-in to farm visits can:
 * - Enable/disable visits
 * - Configure available time slots
 * - Manage incoming booking requests
 * -------------------------------------------------------------------------- */

interface TimeSlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxVisitors: number;
}

interface Booking {
  id: string;
  visitorName: string;
  phone: string;
  date: string;
  timeSlot: string;
  guestCount: number;
  notes: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}

const dayOptions = [
  { value: 'MONDAY', label: 'Pazartesi' },
  { value: 'TUESDAY', label: 'Salı' },
  { value: 'WEDNESDAY', label: 'Çarşamba' },
  { value: 'THURSDAY', label: 'Perşembe' },
  { value: 'FRIDAY', label: 'Cuma' },
  { value: 'SATURDAY', label: 'Cumartesi' },
  { value: 'SUNDAY', label: 'Pazar' },
];

const dayLabelTr: Record<string, string> = {
  MONDAY: 'Pzt',
  TUESDAY: 'Sal',
  WEDNESDAY: 'Çar',
  THURSDAY: 'Per',
  FRIDAY: 'Cum',
  SATURDAY: 'Cmt',
  SUNDAY: 'Paz',
};

const statusConfig = {
  pending: { tone: 'warning' as const, label: 'Beklemede', icon: Clock },
  approved: { tone: 'success' as const, label: 'Onaylandı', icon: CheckCircle2 },
  rejected: { tone: 'destructive' as const, label: 'Reddedildi', icon: XCircle },
  completed: { tone: 'info' as const, label: 'Tamamlandı', icon: CheckCircle2 },
};

export function FarmVisitView() {
  const [visitsEnabled, setVisitsEnabled] = useState(false);
  const [showSlotDialog, setShowSlotDialog] = useState(false);
  const toast = useToast();

  // Mock data — will be replaced with tRPC queries
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [bookings] = useState<Booking[]>([]);

  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 'SATURDAY',
    startTime: '10:00',
    endTime: '14:00',
    maxVisitors: 10,
  });

  const addSlot = () => {
    setSlots((prev) => [
      ...prev,
      { ...newSlot, id: String(Date.now()) },
    ]);
    setShowSlotDialog(false);
    toast.success('Zaman dilimi eklendi');
  };

  const removeSlot = (id: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
    toast.info('Zaman dilimi kaldırıldı');
  };

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const pastBookings = bookings.filter((b) => b.status !== 'pending');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Çiftlik ziyareti
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Alıcıların üretim alanını ziyaret etmesine izin ver. Şeffaflığı artırır, güven oluşturur.
        </p>
      </div>

      {/* Enable toggle */}
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12">
              <Sprout className="h-6 w-6 text-primary" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">Ziyaretleri etkinleştir</h2>
              <p className="text-sm text-muted-foreground">
                Aktifleştiğinde profilinde &ldquo;Çiftlik ziyareti&rdquo; seçeneği görünür.
              </p>
            </div>
          </div>
          <Switch
            checked={visitsEnabled}
            onCheckedChange={setVisitsEnabled}
          />
        </CardContent>
      </Card>

      {visitsEnabled && (
        <>
          {/* Time Slots */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Zaman dilimleri</h2>
              <Button
                variant="outline"
                className="gap-2 rounded-xl"
                onClick={() => setShowSlotDialog(true)}
              >
                <Plus className="h-4 w-4" />
                Dilim ekle
              </Button>
            </div>

            {slots.length === 0 ? (
              <Card className="border-dashed border-primary/20 bg-primary/[0.03]">
                <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                  <CalendarDays className="h-10 w-10 text-primary/40" />
                  <p className="text-sm text-muted-foreground">
                    Henüz zaman dilimi eklenmedi. Ziyaretçilerin gelebileceği gün ve saatleri belirle.
                  </p>
                  <Button
                    variant="outline"
                    className="gap-2 rounded-xl"
                    onClick={() => setShowSlotDialog(true)}
                  >
                    <Plus className="h-4 w-4" />
                    İlk dilimi ekle
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {slots.map((slot) => (
                  <Card key={slot.id} className="group border-border/70 transition-shadow hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge tone="info" className="mb-2 rounded-md text-xs">
                            {dayLabelTr[slot.dayOfWeek] ?? slot.dayOfWeek}
                          </Badge>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium tabular-nums">
                              {slot.startTime} – {slot.endTime}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            <span>Maks. {slot.maxVisitors} ziyaretçi</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSlot(slot.id)}
                          className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Bookings */}
          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Randevular</h2>
            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending">
                  <Clock className="h-4 w-4" />
                  Bekleyen ({pendingBookings.length})
                </TabsTrigger>
                <TabsTrigger value="history">
                  <CalendarDays className="h-4 w-4" />
                  Geçmiş ({pastBookings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                {pendingBookings.length === 0 ? (
                  <EmptyState
                    className="rounded-2xl border-primary/15 bg-primary/[0.02]"
                    icon={<CalendarDays className="h-10 w-10 text-primary" />}
                    title="Bekleyen randevu yok"
                    description="Alıcılar ziyaret randevusu oluşturduğunda burada görünecek."
                  />
                ) : (
                  <div className="space-y-3">
                    {pendingBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history">
                {pastBookings.length === 0 ? (
                  <EmptyState
                    className="rounded-2xl"
                    icon={<CalendarDays className="h-10 w-10 text-muted-foreground" />}
                    title="Randevu geçmişi boş"
                    description="Onaylanan veya tamamlanan randevular burada listelenir."
                  />
                ) : (
                  <div className="space-y-3">
                    {pastBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </section>

          {/* Info card */}
          <Card className="border-dashed border-primary/20 bg-primary/[0.03]">
            <CardContent className="p-6 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Ziyaret kuralları</p>
              <ul className="mt-3 list-inside list-disc space-y-2">
                <li>Ziyaretçiler randevu olmadan gelemez — platform üzerinden onay gerekir.</li>
                <li>Hijyen ve güvenlik kurallarını profil sayfanda belirtebilirsin.</li>
                <li>İptal ve erteleme bildirimleri otomatik gönderilir.</li>
                <li>Ziyaret sonrası alıcı değerlendirme yapabilir.</li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}

      {/* Add Slot Dialog */}
      <Dialog open={showSlotDialog} onOpenChange={setShowSlotDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zaman dilimi ekle</DialogTitle>
            <DialogDescription>
              Ziyaretçilerin gelebileceği gün ve saat aralığını belirle.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Gün</label>
              <Select
                value={newSlot.dayOfWeek}
                onChange={(e) => setNewSlot((s) => ({ ...s, dayOfWeek: e.target.value }))}
              >
                {dayOptions.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Başlangıç</label>
                <Input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot((s) => ({ ...s, startTime: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Bitiş</label>
                <Input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot((s) => ({ ...s, endTime: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Maks. ziyaretçi sayısı</label>
              <Input
                type="number"
                min={1}
                max={100}
                value={newSlot.maxVisitors}
                onChange={(e) => setNewSlot((s) => ({ ...s, maxVisitors: Number(e.target.value) }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSlotDialog(false)}>
              İptal
            </Button>
            <Button onClick={addSlot}>Dilimi ekle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const config = statusConfig[booking.status];
  const Icon = config.icon;

  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/12">
            <MapPin className="h-5 w-5 text-primary" />
          </span>
          <div>
            <p className="font-medium">{booking.visitorName}</p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {booking.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {booking.timeSlot}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {booking.guestCount} kişi
              </span>
            </div>
            {booking.notes && (
              <p className="mt-1 text-xs text-muted-foreground">{booking.notes}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={config.tone} className="gap-1 rounded-md">
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
          {booking.status === 'pending' && (
            <div className="flex gap-1">
              <Button size="sm" className="rounded-lg px-3 text-xs">
                Onayla
              </Button>
              <Button size="sm" variant="outline" className="rounded-lg px-3 text-xs">
                Reddet
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
