/**
 * Development seed script. Keeps things deterministic: use small but
 * representative data so that the full UX can be demoed end-to-end.
 *
 * Runs idempotently via `upsert`. Safe to run repeatedly.
 */
import {
  CertificationStatus,
  CertificationType,
  FulfillmentMode,
  MediaKind,
  PrismaClient,
  ProductionMethod,
  ProductStatus,
  SellerKind,
  SellerStatus,
  ShippingCarrier,
  TurkeyRegion,
  UnitOfMeasure,
  UserRole,
  UserStatus,
  VerificationMethod,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.info('Seeding Sanda development data…');

  // --- Core provinces (subset that matches the demo sellers) -----------------
  const provinces = [
    { id: 6, code: '06', nameTr: 'Ankara', nameEn: 'Ankara', region: TurkeyRegion.CENTRAL_ANATOLIA },
    { id: 34, code: '34', nameTr: 'İstanbul', nameEn: 'Istanbul', region: TurkeyRegion.MARMARA },
    { id: 35, code: '35', nameTr: 'İzmir', nameEn: 'Izmir', region: TurkeyRegion.AEGEAN },
    { id: 7, code: '07', nameTr: 'Antalya', nameEn: 'Antalya', region: TurkeyRegion.MEDITERRANEAN },
    { id: 61, code: '61', nameTr: 'Trabzon', nameEn: 'Trabzon', region: TurkeyRegion.BLACK_SEA },
    { id: 60, code: '60', nameTr: 'Tokat', nameEn: 'Tokat', region: TurkeyRegion.BLACK_SEA },
    { id: 42, code: '42', nameTr: 'Konya', nameEn: 'Konya', region: TurkeyRegion.CENTRAL_ANATOLIA },
  ];
  for (const p of provinces) {
    await prisma.province.upsert({ where: { id: p.id }, update: p, create: p });
  }

  // A couple of districts for geographic referencing.
  const districts = [
    { id: 601, provinceId: 60, nameTr: 'Niksar' },
    { id: 602, provinceId: 60, nameTr: 'Erbaa' },
    { id: 611, provinceId: 61, nameTr: 'Of' },
    { id: 351, provinceId: 35, nameTr: 'Urla' },
    { id: 71, provinceId: 7, nameTr: 'Kumluca' },
    { id: 341, provinceId: 34, nameTr: 'Şile' },
    { id: 61,  provinceId: 6, nameTr: 'Beypazarı' },
  ];
  for (const d of districts) {
    await prisma.district.upsert({
      where: { provinceId_nameTr: { provinceId: d.provinceId, nameTr: d.nameTr } },
      update: { nameTr: d.nameTr },
      create: d,
    });
  }

  // --- Categories ------------------------------------------------------------
  const rootCats = [
    { slug: 'meyve', nameTr: 'Meyve', nameEn: 'Fruit', iconName: 'apple' },
    { slug: 'sebze', nameTr: 'Sebze', nameEn: 'Vegetables', iconName: 'carrot' },
    { slug: 'zeytin-ve-yaglar', nameTr: 'Zeytin ve Yağlar', nameEn: 'Olives & Oils', iconName: 'olive' },
    { slug: 'bal-ve-tatlandirici', nameTr: 'Bal ve Tatlandırıcılar', nameEn: 'Honey & Sweeteners', iconName: 'honey' },
    { slug: 'sut-urunleri', nameTr: 'Süt Ürünleri', nameEn: 'Dairy', iconName: 'milk' },
    { slug: 'bakliyat-ve-tahil', nameTr: 'Bakliyat ve Tahıl', nameEn: 'Legumes & Grains', iconName: 'wheat' },
    { slug: 'kuruyemis', nameTr: 'Kuruyemiş', nameEn: 'Nuts & Dried Fruit', iconName: 'nut' },
    { slug: 'recel-ve-konserve', nameTr: 'Reçel ve Konserve', nameEn: 'Preserves & Canned', iconName: 'jar' },
  ];
  const categoryIds: Record<string, string> = {};
  for (const c of rootCats) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { nameTr: c.nameTr, nameEn: c.nameEn, iconName: c.iconName },
      create: c,
    });
    categoryIds[c.slug] = row.id;
  }

  // --- Demo seller account ---------------------------------------------------
  const sellerAccount = await prisma.account.upsert({
    where: { phone: '+905551112233' },
    update: {},
    create: {
      phone: '+905551112233',
      phoneVerifiedAt: new Date(),
      status: UserStatus.ACTIVE,
      roles: [UserRole.SELLER, UserRole.BUYER],
      termsAcceptedAt: new Date(),
      termsVersion: '1.0',
      profile: {
        create: {
          firstName: 'Mehmet',
          lastName: 'Yılmaz',
          displayName: 'Mehmet Y.',
        },
      },
    },
  });

  const seller = await prisma.sellerProfile.upsert({
    where: { accountId: sellerAccount.id },
    update: {},
    create: {
      accountId: sellerAccount.id,
      slug: 'niksar-ceviz-bahcesi',
      displayName: 'Niksar Ceviz Bahçesi',
      tagline: 'Kendi bahçemizden dalından dalına',
      story:
        'Üç kuşaktır Niksar’ın dağ köylerinde ceviz yetiştiriyoruz. Ürünlerimizi elle topluyor, makine kullanmıyoruz.',
      kind: SellerKind.REGISTERED_FARMER,
      status: SellerStatus.APPROVED,
      allowsFarmVisits: true,
      farmName: 'Yıldız Ceviz Bahçesi',
      farmSize: '32.50',
      foundedYear: 1998,
      contactEmail: 'mehmet@sanda.test',
      contactPhone: '+905551112233',
      farmDistrictId: 601,
      approvedAt: new Date(),
    },
  });

  // --- Demo buyer ------------------------------------------------------------
  await prisma.account.upsert({
    where: { phone: '+905554443322' },
    update: {},
    create: {
      phone: '+905554443322',
      phoneVerifiedAt: new Date(),
      status: UserStatus.ACTIVE,
      roles: [UserRole.BUYER],
      termsAcceptedAt: new Date(),
      termsVersion: '1.0',
      profile: {
        create: { firstName: 'Ayşe', lastName: 'Kaya', displayName: 'Ayşe K.' },
      },
    },
  });

  // --- Service area (Turkey-wide cargo + local pickup) -----------------------
  await prisma.serviceArea.create({
    data: {
      sellerId: seller.id,
      name: 'Türkiye geneli kargo',
      mode: FulfillmentMode.SHIPPING,
      provinceCodes: ['06', '34', '35', '07', '61', '60', '42'],
      carrier: ShippingCarrier.YURTICI,
      shippingFee: 4900,
      freeShippingOver: 50000,
      etaMinDays: 2,
      etaMaxDays: 4,
      minOrderAmount: 15000,
    },
  });
  await prisma.serviceArea.create({
    data: {
      sellerId: seller.id,
      name: 'Niksar bahçe gelip alma',
      mode: FulfillmentMode.PICKUP,
      districtIds: [601, 602],
      shippingFee: 0,
      minOrderAmount: 0,
    },
  });

  // --- Certification ---------------------------------------------------------
  await prisma.certification.upsert({
    where: { issuer_certificateNumber: { issuer: 'ETKO', certificateNumber: 'TR-ORG-039-000123' } },
    update: {},
    create: {
      sellerId: seller.id,
      type: CertificationType.ORGANIC_TR,
      issuer: 'ETKO',
      certificateNumber: 'TR-ORG-039-000123',
      scopeDescription: 'Ceviz (iç ve kabuklu)',
      issuedAt: new Date('2024-03-01'),
      expiresAt: new Date('2027-02-28'),
      documentUrl: 'https://files.sanda.test/certs/etko-0123.pdf',
      status: CertificationStatus.VERIFIED,
      verificationMethod: VerificationMethod.MANUAL_ADMIN,
      verifiedAt: new Date(),
    },
  });

  // --- Product + variant + media --------------------------------------------
  const product = await prisma.product.upsert({
    where: { slug: 'niksar-ic-ceviz' },
    update: {},
    create: {
      sellerId: seller.id,
      categoryId: categoryIds['kuruyemis']!,
      slug: 'niksar-ic-ceviz',
      nameTr: 'Niksar Yerli İç Ceviz',
      nameEn: 'Niksar Walnut Kernels',
      summary: 'Elle kırılmış, bütün parça iç ceviz. 2024 hasadı.',
      description:
        'Niksar’ın dağ köylerinde yetişen yerli ceviz çeşidinden. Elle kırıldığı için bütün parça oranı yüksektir.',
      productionMethod: ProductionMethod.CERTIFIED_ORGANIC,
      isSeasonal: true,
      seasonStartMonth: 10,
      seasonEndMonth: 4,
      harvestNotes: 'Ekim 2024 hasadı',
      storageNotes: 'Serin ve kuru yerde, ağzı kapalı kapta saklayınız.',
      originRegion: TurkeyRegion.BLACK_SEA,
      originProvinceCode: '60',
      status: ProductStatus.ACTIVE,
      publishedAt: new Date(),
      minOrderQty: '0.25',
      stepQty: '0.25',
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: 'NICV-500G' },
    update: {},
    create: {
      productId: product.id,
      sku: 'NICV-500G',
      nameTr: '500 gr kavanoz',
      unit: UnitOfMeasure.GRAM,
      quantityPerUnit: '500',
      priceKurus: 32000,
      stockQuantity: '120',
      weightGrams: 520,
      isDefault: true,
    },
  });

  await prisma.productMedia.create({
    data: {
      productId: product.id,
      kind: MediaKind.IMAGE,
      url: 'https://images.sanda.test/niksar-ic-ceviz-1.jpg',
      altText: 'Niksar iç ceviz',
      sortOrder: 0,
    },
  });

  console.info('Seed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
