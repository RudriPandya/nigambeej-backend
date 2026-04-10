import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminUser } from '../entities/admin-user.entity';
import { Category } from '../entities/category.entity';
import { CategoryTranslation } from '../entities/category-translation.entity';
import { Subcategory } from '../entities/subcategory.entity';
import { SubcategoryTranslation } from '../entities/subcategory-translation.entity';
import { Product } from '../entities/product.entity';
import { ProductTranslation } from '../entities/product-translation.entity';
import { HomepageStat } from '../entities/homepage-stat.entity';
import { SiteSetting } from '../entities/site-setting.entity';
import { HeroSlide } from '../entities/hero-slide.entity';
import { HeroSlideTranslation } from '../entities/hero-slide-translation.entity';
import { BlogPost } from '../entities/blog-post.entity';
import { BlogPostTranslation } from '../entities/blog-post-translation.entity';

export async function runSeed(ds: DataSource) {
  // Admin user
  const userRepo = ds.getRepository(AdminUser);
  const existing = await userRepo.findOne({ where: { email: 'admin@nigambeej.com' } });
  if (!existing) {
    await userRepo.save(userRepo.create({
      email: 'admin@nigambeej.com',
      password: await bcrypt.hash('Admin@123', 10),
      name: 'Admin',
      role: 'admin',
    }));
    console.log('✓ Admin user seeded');
  }

  // Categories
  const catRepo = ds.getRepository(Category);
  const catTransRepo = ds.getRepository(CategoryTranslation);
  const subRepo = ds.getRepository(Subcategory);
  const subTransRepo = ds.getRepository(SubcategoryTranslation);

  const categoryData = [
    {
      slug: 'fieldCrops', sortOrder: 1,
      translations: { en: 'Field Crops', hi: 'खेती की फसलें', gu: 'ખેત પાકો' },
      subcategories: [
        { slug: 'oilSeeds', sortOrder: 1, names: { en: 'Oil Seeds', hi: 'तिलहन', gu: 'તેલ બીજ' } },
        { slug: 'pulses', sortOrder: 2, names: { en: 'Pulses', hi: 'दालें', gu: 'કઠોળ' } },
        { slug: 'cereals', sortOrder: 3, names: { en: 'Cereals', hi: 'अनाज', gu: 'ધાન્ય' } },
        { slug: 'spices', sortOrder: 4, names: { en: 'Spices', hi: 'मसाले', gu: 'મસાલા' } },
      ],
    },
    {
      slug: 'vegetables', sortOrder: 2,
      translations: { en: 'Vegetables', hi: 'सब्जियां', gu: 'શાકભાજી' },
      subcategories: [
        { slug: 'hybrid', sortOrder: 1, names: { en: 'Hybrid', hi: 'हाइब्रिड', gu: 'હાઇબ્રિડ' } },
        { slug: 'research', sortOrder: 2, names: { en: 'Research', hi: 'अनुसंधान', gu: 'સંશોધન' } },
      ],
    },
  ];

  const catMap: Record<string, Category> = {};
  const subMap: Record<string, Subcategory> = {};

  for (const catData of categoryData) {
    let cat = await catRepo.findOne({ where: { slug: catData.slug } });
    if (!cat) {
      cat = await catRepo.save(catRepo.create({ slug: catData.slug, sortOrder: catData.sortOrder }));
      for (const [lang, name] of Object.entries(catData.translations)) {
        await catTransRepo.save(catTransRepo.create({ category: cat, lang, name }));
      }
    }
    catMap[catData.slug] = cat;

    for (const subData of catData.subcategories) {
      let sub = await subRepo.findOne({ where: { slug: subData.slug, category: { id: cat.id } } });
      if (!sub) {
        sub = await subRepo.save(subRepo.create({ slug: subData.slug, sortOrder: subData.sortOrder, category: cat }));
        for (const [lang, name] of Object.entries(subData.names)) {
          await subTransRepo.save(subTransRepo.create({ subcategory: sub, lang, name }));
        }
      }
      subMap[subData.slug] = sub;
    }
  }
  console.log('✓ Categories seeded');

  // Products
  const prodRepo = ds.getRepository(Product);
  const prodTransRepo = ds.getRepository(ProductTranslation);

  const productData = [
    // Field Crops - Oil Seeds
    { slug: 'groundnut', cat: 'fieldCrops', sub: 'oilSeeds', names: { en: 'Groundnut', hi: 'मूंगफली', gu: 'મગફળી' } },
    { slug: 'soybean', cat: 'fieldCrops', sub: 'oilSeeds', names: { en: 'Soybean', hi: 'सोयाबीन', gu: 'સોયાબીન' } },
    { slug: 'castor', cat: 'fieldCrops', sub: 'oilSeeds', names: { en: 'Castor', hi: 'अरंडी', gu: 'દિવેલ' } },
    { slug: 'sesame', cat: 'fieldCrops', sub: 'oilSeeds', names: { en: 'Sesame', hi: 'तिल', gu: 'તલ' } },
    { slug: 'mustard', cat: 'fieldCrops', sub: 'oilSeeds', names: { en: 'Mustard', hi: 'सरसों', gu: 'સરસવ' } },
    // Pulses
    { slug: 'pigeon-pea', cat: 'fieldCrops', sub: 'pulses', names: { en: 'Pigeon Pea', hi: 'अरहर', gu: 'તુવેર' } },
    { slug: 'chickpea', cat: 'fieldCrops', sub: 'pulses', names: { en: 'Chickpea', hi: 'चना', gu: 'ચણા' } },
    { slug: 'black-gram', cat: 'fieldCrops', sub: 'pulses', names: { en: 'Black Gram', hi: 'उड़द', gu: 'અડદ' } },
    { slug: 'green-gram', cat: 'fieldCrops', sub: 'pulses', names: { en: 'Green Gram', hi: 'मूंग', gu: 'મગ' } },
    { slug: 'cowpea', cat: 'fieldCrops', sub: 'pulses', names: { en: 'Cowpea', hi: 'लोबिया', gu: 'ચોળા' } },
    // Cereals
    { slug: 'maize', cat: 'fieldCrops', sub: 'cereals', names: { en: 'Maize', hi: 'मक्का', gu: 'મકાઈ' } },
    { slug: 'bajra', cat: 'fieldCrops', sub: 'cereals', names: { en: 'Bajra', hi: 'बाजरा', gu: 'બાજરો' } },
    { slug: 'wheat', cat: 'fieldCrops', sub: 'cereals', names: { en: 'Wheat', hi: 'गेहूं', gu: 'ઘઉં' } },
    // Spices
    { slug: 'coriander', cat: 'fieldCrops', sub: 'spices', names: { en: 'Coriander', hi: 'धनिया', gu: 'ધાણા' } },
    { slug: 'fenugreek', cat: 'fieldCrops', sub: 'spices', names: { en: 'Fenugreek', hi: 'मेथी', gu: 'મેથી' } },
    { slug: 'fennel', cat: 'fieldCrops', sub: 'spices', names: { en: 'Fennel', hi: 'सौंफ', gu: 'વરિયાળી' } },
    { slug: 'cumin', cat: 'fieldCrops', sub: 'spices', names: { en: 'Cumin', hi: 'जीरा', gu: 'જીરુ' } },
    // Vegetables - Hybrid
    { slug: 'chilli', cat: 'vegetables', sub: 'hybrid', names: { en: 'Chilli', hi: 'मिर्च', gu: 'મરચું' } },
    { slug: 'tomato', cat: 'vegetables', sub: 'hybrid', names: { en: 'Tomato', hi: 'टमाटर', gu: 'ટામેટા' } },
    { slug: 'okra', cat: 'vegetables', sub: 'hybrid', names: { en: 'Okra', hi: 'भिंडी', gu: 'ભીંડા' } },
    { slug: 'brinjal', cat: 'vegetables', sub: 'hybrid', names: { en: 'Brinjal', hi: 'बैंगन', gu: 'રીંગણ' } },
    { slug: 'bottle-gourd', cat: 'vegetables', sub: 'hybrid', names: { en: 'Bottle Gourd', hi: 'लौकी', gu: 'દૂધી' } },
    { slug: 'bitter-gourd', cat: 'vegetables', sub: 'hybrid', names: { en: 'Bitter Gourd', hi: 'करेला', gu: 'કારેલા' } },
    { slug: 'onion', cat: 'vegetables', sub: 'hybrid', names: { en: 'Onion', hi: 'प्याज', gu: 'ડુંગળી' } },
    { slug: 'cucumber', cat: 'vegetables', sub: 'hybrid', names: { en: 'Cucumber', hi: 'खीरा', gu: 'કાકડી' } },
    { slug: 'ridge-gourd', cat: 'vegetables', sub: 'hybrid', names: { en: 'Ridge Gourd', hi: 'तोरई', gu: 'તૂરિયા' } },
    // Vegetables - Research
    { slug: 'hybrid-tomato', cat: 'vegetables', sub: 'research', names: { en: 'Hybrid Tomato', hi: 'हाइब्रिड टमाटर', gu: 'હાઇબ્રિડ ટામેટા' } },
  ];

  for (const pd of productData) {
    const existing = await prodRepo.findOne({ where: { slug: pd.slug } });
    if (!existing) {
      const prod = await prodRepo.save(prodRepo.create({
        slug: pd.slug,
        category: catMap[pd.cat],
        subcategory: subMap[pd.sub],
      }));
      for (const [lang, name] of Object.entries(pd.names)) {
        await prodTransRepo.save(prodTransRepo.create({ product: prod, lang, name }));
      }
    }
  }
  console.log('✓ Products seeded');

  // Stats
  const statsRepo = ds.getRepository(HomepageStat);
  const statsData = [
    { statKey: 'products', value: '56+', iconName: 'Sprout', sortOrder: 1, labels: { en: 'Products', hi: 'उत्पाद', gu: 'ઉત્પાદનો' } },
    { statKey: 'happyClients', value: '560+', iconName: 'Users', sortOrder: 2, labels: { en: 'Happy Clients', hi: 'खुश ग्राहक', gu: 'ખુશ ગ્રાહકો' } },
    { statKey: 'visitingFarmers', value: '38,404+', iconName: 'Wheat', sortOrder: 3, labels: { en: 'Visiting Farmers', hi: 'किसान विजिट', gu: 'ખેડૂત મુલાકાત' } },
    { statKey: 'productionCapacity', value: '4,500+', iconName: 'Factory', sortOrder: 4, labels: { en: 'Production Capacity', hi: 'उत्पादन क्षमता', gu: 'ઉત્પાદન ક્ષમતા' } },
    { statKey: 'corporateClients', value: '14+', iconName: 'Building2', sortOrder: 5, labels: { en: 'Corporate Clients', hi: 'कॉर्पोरेट क्लाइंट', gu: 'કોર્પોરેટ ક્લાઈન્ટ' } },
    { statKey: 'presenceInStates', value: '4+', iconName: 'MapPin', sortOrder: 6, labels: { en: 'Presence in States', hi: 'राज्यों में उपस्थिति', gu: 'રાજ્યોમાં હાજરી' } },
  ];
  for (const s of statsData) {
    const ex = await statsRepo.findOne({ where: { statKey: s.statKey } });
    if (!ex) await statsRepo.save(statsRepo.create(s));
  }
  console.log('✓ Stats seeded');

  // Settings
  const settingsRepo = ds.getRepository(SiteSetting);
  const settingsData = [
    { settingKey: 'phone', settingValue: '+91 90993 50593' },
    { settingKey: 'email', settingValue: 'nigambeejrnd@gmail.com' },
    { settingKey: 'address', settingValue: 'Madhav estate, Plot No.-3, Dhoraji Rd, behind HP Petrol pump, Sabalpur, Junagadh, Gujarat 362310' },
    { settingKey: 'facebook', settingValue: '' },
    { settingKey: 'instagram', settingValue: '' },
    { settingKey: 'youtube', settingValue: '' },
    { settingKey: 'whatsapp', settingValue: '' },
    { settingKey: 'mapEmbed', settingValue: 'https://maps.google.com/maps?q=21.5792291,70.4627154&output=embed' },
    { settingKey: 'seoTitle', settingValue: 'Nigam Beej Pvt. Ltd. | Premium Quality Seeds' },
    { settingKey: 'seoDescription', settingValue: 'Nigam Beej Pvt. Ltd. is a leading seed company dedicated to providing premium quality seeds to farmers across India.' },
    // About Us
    { settingKey: 'about_years', settingValue: '15+' },
    { settingKey: 'about_en_title',       settingValue: 'Welcome to Nigam Beej Pvt. Ltd.' },
    { settingKey: 'about_en_para1',       settingValue: 'Nigam Beej Pvt. Ltd. is a leading seed company dedicated to providing premium quality field crop seeds, hybrid vegetable seeds, and research-grade varieties to farmers across India.' },
    { settingKey: 'about_en_para2',       settingValue: 'With a commitment to agricultural innovation and farmer prosperity, we offer carefully selected and tested seeds across categories including Oil Seeds, Pulses, Cereals, Spices, and Hybrid Vegetables.' },
    { settingKey: 'about_en_years_label', settingValue: 'Years of Trust' },
    { settingKey: 'about_hi_title',       settingValue: 'निगम बीज प्राइवेट लिमिटेड में आपका स्वागत है' },
    { settingKey: 'about_hi_para1',       settingValue: 'निगम बीज प्राइवेट लिमिटेड भारत भर के किसानों को प्रीमियम गुणवत्ता वाले रबी फसल बीज, संकर सब्जी बीज और अनुसंधान किस्में प्रदान करने के लिए समर्पित एक अग्रणी बीज कंपनी है।' },
    { settingKey: 'about_hi_para2',       settingValue: 'कृषि नवाचार और किसान समृद्धि के प्रति प्रतिबद्धता के साथ, हम तिलहन, दालें, अनाज, मसाले और संकर सब्जियों सहित श्रेणियों में सावधानीपूर्वक चयनित और परीक्षित बीज प्रदान करते हैं।' },
    { settingKey: 'about_hi_years_label', settingValue: 'विश्वास के वर्ष' },
    { settingKey: 'about_gu_title',       settingValue: 'નિગમ બીજ પ્રાઇવેટ લિમિટેડમાં આપનું સ્વાગત છે' },
    { settingKey: 'about_gu_para1',       settingValue: 'નિગમ બીજ પ્રાઇવેટ લિમિટેડ ભારત ભરના ખેડૂતોને પ્રીમિયમ ગુણવત્તાના ખેત પાક બીજ, હાઇબ્રિડ શાકભાજી બીજ અને સંશોધન જાતો પૂરી પાડવા માટે સમર્પિત અગ્રણી બીજ કંપની છે.' },
    { settingKey: 'about_gu_para2',       settingValue: 'કૃષિ નવીનતા અને ખેડૂત સમૃદ્ધિ પ્રત્યે પ્રતિબદ્ધતા સાથે, અમે તેલીય બીજ, દાળ, અનાજ, મસાલા અને હાઇબ્રિડ શાકભાજી સહિત શ્રેણીઓમાં સાવધાનીપૂર્વક પસંદ કરેલા અને પરીક્ષિત બીજ ઓફર કરીએ છીએ.' },
    { settingKey: 'about_gu_years_label', settingValue: 'વિશ્વાસના વર્ષો' },
  ];
  for (const s of settingsData) {
    const ex = await settingsRepo.findOne({ where: { settingKey: s.settingKey } });
    if (!ex) await settingsRepo.save(settingsRepo.create(s));
  }
  console.log('✓ Settings seeded');

  // Hero slides
  const heroRepo = ds.getRepository(HeroSlide);
  const heroTransRepo = ds.getRepository(HeroSlideTranslation);
  const heroCount = await heroRepo.count();
  if (heroCount === 0) {
    const slide1 = await heroRepo.save(heroRepo.create({ sortOrder: 1 }));
    await heroTransRepo.save([
      heroTransRepo.create({ slide: slide1, lang: 'en', title: 'निगम का वादा, उत्पादन ज्यादा', subtitle: 'Premium Quality Seeds for Maximum Yield', ctaLabel: 'Explore Products', ctaUrl: '/products' }),
      heroTransRepo.create({ slide: slide1, lang: 'hi', title: 'निगम का वादा, उत्पादन ज्यादा', subtitle: 'अधिकतम उत्पादन के लिए प्रीमियम गुणवत्ता के बीज', ctaLabel: 'उत्पाद देखें', ctaUrl: '/products' }),
      heroTransRepo.create({ slide: slide1, lang: 'gu', title: 'નિગમ નો વાયદો, ઉત્પાદન વધારો', subtitle: 'વધુ ઉત્પાદન માટે ઉચ્ચ ગુણવત્તાના બીજ', ctaLabel: 'ઉત્પાદો જુઓ', ctaUrl: '/products' }),
    ]);
    const slide2 = await heroRepo.save(heroRepo.create({ sortOrder: 2 }));
    await heroTransRepo.save([
      heroTransRepo.create({ slide: slide2, lang: 'en', title: 'Welcome to Nigam Beej Pvt. Ltd.', subtitle: 'Trusted by 40,000+ Farmers Across India', ctaLabel: 'Contact Us', ctaUrl: '/contact' }),
      heroTransRepo.create({ slide: slide2, lang: 'hi', title: 'निगम बीज प्राइवेट लिमिटेड में आपका स्वागत है', subtitle: 'भारत भर के 40,000+ किसानों का भरोसा', ctaLabel: 'संपर्क करें', ctaUrl: '/contact' }),
      heroTransRepo.create({ slide: slide2, lang: 'gu', title: 'નિગમ બીજ પ્રા. લિ. માં આપનું સ્વાગત છે', subtitle: 'ભારત ભરના 40,000+ ખેડૂતોનો ભરોસો', ctaLabel: 'સંપર્ક કરો', ctaUrl: '/contact' }),
    ]);
    console.log('✓ Hero slides seeded');
  }

  // Blog posts
  const blogRepo = ds.getRepository(BlogPost);
  const blogTransRepo = ds.getRepository(BlogPostTranslation);
  const blogCount = await blogRepo.count();
  if (blogCount === 0) {
    const blogData = [
      {
        slug: 'best-practices-groundnut-cultivation',
        publishedAt: new Date('2026-02-10'),
        en: { title: 'Best Practices for Groundnut Cultivation', excerpt: 'Learn the latest techniques for maximizing your groundnut yield with quality seeds and modern farming methods.' },
        hi: { title: 'मूंगफली की खेती के लिए सर्वोत्तम अभ्यास', excerpt: 'गुणवत्तापूर्ण बीजों और आधुनिक कृषि विधियों के साथ मूंगफली उत्पादन को अधिकतम करने की नवीनतम तकनीकें जानें।' },
        gu: { title: 'મગફળી ખેતી માટે શ્રેષ્ઠ પ્રથાઓ', excerpt: 'ગુણવત્તાયુક્ત બીજ અને આધુનિક ખેતી પદ્ધતિઓ સાથે મગફળી ઉત્પાદન વધારવાની નવીનતમ તકનીકો શીખો.' },
      },
      {
        slug: 'hybrid-vegetable-seeds-guide',
        publishedAt: new Date('2026-02-05'),
        en: { title: "Hybrid Vegetable Seeds: A Farmer's Guide", excerpt: 'Discover how hybrid vegetable seeds can transform your farm productivity and increase your profits.' },
        hi: { title: 'हाइब्रिड सब्जी बीज: एक किसान की गाइड', excerpt: 'जानें कैसे हाइब्रिड सब्जी बीज आपकी खेती की उत्पादकता को बदल सकते हैं।' },
        gu: { title: 'હાઇબ્રિડ શાકભાજી બીજ: ખેડૂત માર્ગદર્શિકા', excerpt: 'જાણો હાઇબ્રિડ શાકભાજી બીજ તમારી ખેતી ઉત્પાદકતા કેવી રીતે બદલી શકે છે.' },
      },
      {
        slug: 'research-in-seed-technology',
        publishedAt: new Date('2026-01-28'),
        en: { title: 'Research in Seed Technology', excerpt: 'Explore our latest R&D breakthroughs in developing disease-resistant and high-yield seed varieties.' },
        hi: { title: 'बीज प्रौद्योगिकी में अनुसंधान', excerpt: 'रोग-प्रतिरोधी और उच्च उत्पादन वाली बीज किस्मों के विकास में हमारी नवीनतम अनुसंधान सफलताओं का अन्वेषण करें।' },
        gu: { title: 'બીજ ટેક્નોલોજીમાં સંશોધન', excerpt: 'રોગ-પ્રતિરોધી અને ઉચ્ચ ઉત્પાદન બીજ જાતો વિકસાવવામાં અમારી નવીનતમ R&D સફળતાઓ શોધો.' },
      },
    ];
    for (const bd of blogData) {
      const post = await blogRepo.save(blogRepo.create({ slug: bd.slug, isPublished: true, publishedAt: bd.publishedAt }));
      for (const lang of ['en', 'hi', 'gu'] as const) {
        const t = bd[lang];
        await blogTransRepo.save(blogTransRepo.create({ post, lang, title: t.title, excerpt: t.excerpt, content: `<p>${t.excerpt}</p>` }));
      }
    }
    console.log('✓ Blog posts seeded');
  }

  console.log('✅ Seed completed!');
}
