import type { Metadata } from 'next';

import { SettingsForms } from './settings-forms';

export const metadata: Metadata = {
  title: 'Ayarlar',
  description: 'Mağaza kimliği, yasal bilgiler, ödeme ve bildirim ayarları.',
};

export default function SellerSettingsPage() {
  return <SettingsForms />;
}
