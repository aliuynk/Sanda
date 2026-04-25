import { getServerTrpc } from '@/trpc/server';

import { OnboardingWizard } from './onboarding-wizard';

export const metadata = { title: 'Onboarding' };

export default async function OnboardingPage() {
  const trpc = await getServerTrpc();
  const [me, areas] = await Promise.all([trpc.auth.me(), trpc.sellers.listMyServiceAreas()]);
  const seller = me.sellerProfile!;

  return (
    <OnboardingWizard
      seller={{
        id: seller.id,
        slug: seller.slug,
        kind: seller.kind,
        status: seller.status,
        displayName: seller.displayName,
        tagline: seller.tagline,
        story: seller.story,
        farmName: seller.farmName,
        farmSize: seller.farmSize !== null ? Number(seller.farmSize) : null,
        foundedYear: seller.foundedYear,
        allowsFarmVisits: seller.allowsFarmVisits,
        farmVisitNotes: seller.farmVisitNotes,
        farmAddressLine: seller.farmAddressLine,
        farmDistrictId: seller.farmDistrictId,
        websiteUrl: seller.websiteUrl,
        instagramHandle: seller.instagramHandle,
        iban: seller.iban,
        taxNumber: seller.taxNumber,
        nationalId: seller.nationalId,
      }}
      serviceAreaCount={areas.length}
    />
  );
}
