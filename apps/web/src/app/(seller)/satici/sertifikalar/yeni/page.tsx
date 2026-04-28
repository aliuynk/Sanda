import type { Metadata } from 'next';

import { CertificationUploadForm } from './certification-form';

export const metadata: Metadata = {
  title: 'Sertifika yükle',
  description: 'Organik, İyi Tarım ve diğer sertifikalarını yükle ve doğrulatma sürecini başlat.',
};

export default function NewCertificationPage() {
  return <CertificationUploadForm />;
}
