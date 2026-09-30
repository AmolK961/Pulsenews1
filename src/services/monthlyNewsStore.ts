import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const JSON_FILE_PATH = path.join(DATA_DIR, 'monthly_news.json');

export interface Article {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
  category?: string;
}

export interface MonthlyNewsStore {
  month: string;
  lastUpdated: string;
  totalArticles: number;
  categories: Record<string, Article[]>;
}

// Generate base articles for categories to ensure fast instant retrieval
export function initializeMonthlyJsonFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(JSON_FILE_PATH)) {
      const stats = fs.statSync(JSON_FILE_PATH);
      if (stats.size > 500) {
        console.log(`[JSON Store] Loaded existing monthly_news.json (${stats.size} bytes)`);
        return;
      }
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // e.g. 2026-09
    const initialData = generateInitialMonthlyNews(currentMonth);
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    console.log(`[JSON Store] Initialized monthly_news.json for ${currentMonth} with ${initialData.totalArticles} articles`);
  } catch (err) {
    console.error('[JSON Store] Error initializing monthly_news.json:', err);
  }
}

export function readMonthlyNews(): MonthlyNewsStore {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const raw = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[JSON Store] Error reading monthly_news.json:', err);
  }
  return generateInitialMonthlyNews(new Date().toISOString().slice(0, 7));
}

export function saveMonthlyNews(store: MonthlyNewsStore): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[JSON Store] Error writing to monthly_news.json:', err);
  }
}

export function mergeArticlesIntoMonthly(category: string, newArticles: Article[]): MonthlyNewsStore {
  const store = readMonthlyNews();
  if (!store.categories[category]) {
    store.categories[category] = [];
  }

  const existingMap = new Map<string, Article>();
  // Existing articles
  store.categories[category].forEach(a => {
    if (a.url) existingMap.set(a.url, a);
  });

  // Merge newly fetched live articles
  newArticles.forEach(a => {
    if (a.url && a.title && a.title !== '[Removed]') {
      existingMap.set(a.url, { ...a, category });
    }
  });

  // Sort descending by publishedAt
  const mergedList = Array.from(existingMap.values()).sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  store.categories[category] = mergedList;
  store.lastUpdated = new Date().toISOString();

  // Recalculate total
  let count = 0;
  Object.values(store.categories).forEach(arr => { count += arr.length; });
  store.totalArticles = count;

  saveMonthlyNews(store);
  return store;
}

function generateInitialMonthlyNews(currentMonth: string): MonthlyNewsStore {
  const now = new Date();
  const d = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600 * 1000).toISOString();

  const categories: Record<string, Article[]> = {
    general: [
      {
        source: { id: 'associated-press', name: 'Associated Press' },
        author: 'Global Affairs Bureau',
        title: 'Global Leaders Gather at Summit to Address Climate and Economic Resilience',
        description: 'Delegates from over 80 nations convened this morning to negotiate new international frameworks prioritizing sustainable energy transitions and supply chain security.',
        url: 'https://apnews.com/article/global-climate-resilience-summit',
        urlToImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(1),
        content: 'International delegates reached preliminary consensus on shared climate pledges and investment corridors for next-generation clean infrastructure...'
      },
      {
        source: { id: 'reuters', name: 'Reuters' },
        author: 'Logistics Wire',
        title: 'Global Trade Corridors See Surge as Digital Customs Streamline Freight Flow',
        description: 'New automated logistics hubs and smart port systems have reduced customs processing times by up to 35 percent across major continental maritime lanes.',
        url: 'https://reuters.com/business/global-trade-digital-customs-surge',
        urlToImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(3),
        content: 'Port operations in Rotterdam, Singapore, and Los Angeles report record throughput as container tracking modernization takes full effect...'
      },
      {
        source: { id: 'bbc-news', name: 'BBC News' },
        author: 'Metropolitan Team',
        title: 'Major Metropolitan Transit Expansion Connects Over 12 Million Commuters',
        description: 'City officials celebrated the inauguration of the rapid rail network extension, cutting average cross-city travel times in half while eliminating vehicle congestion.',
        url: 'https://bbc.com/news/transit-expansion-commuter-rail',
        urlToImage: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(5),
        content: 'The zero-emission transit expansion features automated high-frequency train units powered entirely by localized grid solar arrays...'
      },
      {
        source: { id: 'the-guardian', name: 'The Guardian' },
        author: 'Civic Affairs Reporter',
        title: 'New Digital Public Library Initiative Expands Free Access to Global Educational Materials',
        description: 'An international coalition of universities and civic foundations has released a unified open-access portal hosting millions of research papers, archives, and books.',
        url: 'https://theguardian.com/education/digital-public-library-free-access',
        urlToImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(7),
        content: 'Students and researchers worldwide can now access peer-reviewed journals, audiobooks, and historical transcripts completely free of paywalls...'
      },
      {
        source: { id: 'washington-post', name: 'The Washington Post' },
        author: 'Urban Renewal Staff',
        title: 'Clean Water Infrastructure Modernization Program Reaches 500th Community',
        description: 'Federal and local water boards completed major pipe replacements and sensor deployments ensuring lead-free, high-purity tap water for millions.',
        url: 'https://washingtonpost.com/clean-water-infrastructure-reaches-milestone',
        urlToImage: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(9),
        content: 'The nationwide initiative deployed advanced acoustic leak sensors and corrosion-resistant composite piping across aging municipal grids...'
      },
      {
        source: { id: 'bloomberg', name: 'Bloomberg' },
        author: 'Global Energy Desk',
        title: 'Renewable Power Share in Global Electricity Generation Reaches Historic High',
        description: 'Wind, solar, and modern hydroelectric installations accounted for over 38% of worldwide electrical output over the past quarter.',
        url: 'https://bloomberg.com/news/renewable-power-generation-milestone',
        urlToImage: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(12),
        content: 'Grid operators noted improved battery storage buffering has eliminated intermittency problems even during peak industrial hours...'
      },
      {
        source: { id: 'reuters', name: 'Reuters' },
        author: 'Aviation Bureau',
        title: 'Commercial Airlines Report Record Punctuality Following AI Air Traffic Upgrade',
        description: 'Next-generation flight path optimization algorithms have minimized runway delays, reduced airborne holding patterns, and saved millions of gallons of fuel.',
        url: 'https://reuters.com/business/aerospace-air-traffic-ai-upgrade',
        urlToImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(16),
        content: 'Major international hubs reported average arrival delays declined from 24 minutes to under four minutes during high-density flight operations...'
      },
      {
        source: { id: 'associated-press', name: 'Associated Press' },
        author: 'Disaster Prevention Team',
        title: 'Early Warning Satellite Constellation Detects Wildfires Within Seconds of Ignition',
        description: 'High-frequency infrared sensors orbiting the globe now relay thermal alerts directly to local firefighting crews before blazes spread.',
        url: 'https://apnews.com/article/satellite-wildfire-early-warning-system',
        urlToImage: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(20),
        content: 'Early containment rates jumped by over 60 percent during testing along heavily forested western mountain corridors...'
      },
      {
        source: { id: 'bbc-news', name: 'BBC News' },
        author: 'Science & Society',
        title: 'Ocean Clean-Up Fleet Removes 10,000 Metric Tons of Plastic Waste in Single Mission',
        description: 'Autonomous barrier sweeps deployed in oceanic gyres successfully captured massive aggregations of ghost nets and microplastics for recycling.',
        url: 'https://bbc.com/news/ocean-cleanup-record-plastic-removal',
        urlToImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(24),
        content: 'The recovered polymers are being transported to coastal processing facilities to be converted into durable construction materials...'
      },
      {
        source: { id: 'the-guardian', name: 'The Guardian' },
        author: 'Education Desk',
        title: 'Global Literacy Initiative Equips Remote Schools with Solar Satellite Classrooms',
        description: 'Off-grid schools in remote mountain and island regions now enjoy instant access to multilingual interactive curricula and global educators.',
        url: 'https://theguardian.com/global-education-solar-satellite-classrooms',
        urlToImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(28),
        content: 'Self-charging tablet banks and micro-servers allow students to learn STEM and language skills without requiring local grid power...'
      },
      {
        source: { id: 'reuters', name: 'Reuters' },
        author: 'Trade Policy',
        title: 'New Cross-Border Digital Currency Pact Facilitates Instant Zero-Fee Remittances',
        description: 'Central banks across ten emerging markets have unified real-time payment rails to reduce remittance costs for millions of overseas families.',
        url: 'https://reuters.com/business/cross-border-digital-currency-pact',
        urlToImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(32),
        content: 'Transaction settlement times plummeted from 3 business days to under two seconds with complete transparency on foreign exchange rates...'
      },
      {
        source: { id: 'associated-press', name: 'Associated Press' },
        author: 'Civic Infrastructure',
        title: 'Smart Seismic Dampening Retrofits Completed Across 200 Earthquake-Prone High-Rises',
        description: 'New tuned mass liquid dampers and active computer stabilization systems provide unprecedented seismic protection for high-density downtown apartments.',
        url: 'https://apnews.com/article/smart-seismic-damping-skyscrapers',
        urlToImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(36),
        content: 'Sensors embedded throughout building foundations detect P-waves seconds ahead of violent shaking, automatically locking elevators and gas mains...'
      }
    ],
    technology: [
      {
        source: { id: 'techcrunch', name: 'TechCrunch' },
        author: 'Silicon Valley Desk',
        title: 'Next-Generation Quantum Processor Achieves Real-Time Error Correction Milestone',
        description: 'Researchers unveiled a fault-tolerant logical qubit breakthrough that paves the path toward commercial-scale quantum algorithms for materials discovery.',
        url: 'https://techcrunch.com/quantum-processor-error-correction-breakthrough',
        urlToImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(2),
        content: 'The computing team demonstrated fidelity thresholds above 99.9% while running complex optimization circuits on superconducting silicon arrays...'
      },
      {
        source: { id: 'the-verge', name: 'The Verge' },
        author: 'Gadget & Hardware Review',
        title: 'High-Density Solid-State Batteries Enter Mass Vehicle Field Trials',
        description: 'Automakers have begun on-road deployment of silicon-anode solid-state battery packs capable of 600 miles of range and 12-minute ultra-fast charging.',
        url: 'https://theverge.com/solid-state-battery-mass-trials',
        urlToImage: 'https://images.unsplash.com/photo-1558441719-8b489c63f771?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(4),
        content: 'Test vehicles subjected to sub-zero winter testing showed minimal degradation, providing a major boost to long-distance clean transportation...'
      },
      {
        source: { id: 'wired', name: 'Wired' },
        author: 'AI Innovation Lab',
        title: 'Open Source Neural Architectures Match Proprietary Benchmarks on Edge Devices',
        description: 'Lightweight distilled models can now execute multi-modal vision and reasoning tasks locally on mobile phones without transmitting data to cloud servers.',
        url: 'https://wired.com/open-source-ai-edge-mobile-breakthrough',
        urlToImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(6),
        content: 'By optimizing INT4 quantization and speculative decoding, modern smartphone chips can run 15 tokens per second while using less than 2 watts of battery...'
      },
      {
        source: { id: 'ars-technica', name: 'Ars Technica' },
        author: 'Cybersecurity Desk',
        title: 'Post-Quantum Cryptography Standards Formally Adopted by Web Infrastructure Providers',
        description: 'Major browser engines and CDN networks have begun defaulting to lattice-based key exchange algorithms to safeguard encrypted web traffic against future quantum attacks.',
        url: 'https://arstechnica.com/security/post-quantum-cryptography-adopted',
        urlToImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(8),
        content: 'The migration represents one of the largest cryptographic overhauls since the introduction of public-key encryption in the late 1970s...'
      },
      {
        source: { id: 'techcrunch', name: 'TechCrunch' },
        author: 'Hardware Team',
        title: 'Ultra-Fast 6G Terahertz Wireless Data Transmission Verified in Urban Field Test',
        description: 'Telecommunications engineers demonstrated continuous 100 Gbps wireless transfers between skyscrapers, enabling instant holographic communications.',
        url: 'https://techcrunch.com/6g-wireless-terahertz-urban-test',
        urlToImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(10),
        content: 'The prototype transceiver operates in the 300 GHz band with dynamic beamforming to bypass precipitation and physical building interference...'
      },
      {
        source: { id: 'the-verge', name: 'The Verge' },
        author: 'Computing Bureau',
        title: 'Next-Gen MicroLED Displays Eliminate Burn-In While Delivering 5,000 Nits Brightness',
        description: 'Display manufacturers have solved commercial transfer bottlenecks, clearing the way for razor-sharp, ultra-bright AR glasses and laptop screens.',
        url: 'https://theverge.com/microled-display-breakthrough-brightness',
        urlToImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(13),
        content: 'Each pixel is an inorganic microscopic light-emitting diode with a lifetime exceeding 100,000 operating hours under full peak luminance...'
      },
      {
        source: { id: 'wired', name: 'Wired' },
        author: 'Robotics Review',
        title: 'Bipedal Warehouse Robots Achieve Autonomous 24-Hour Duty Cycles with Zero Collisions',
        description: 'Equipped with end-to-end vision-language-action neural policies, humanoid logistics bots now sort and pack irregular cargo with human-grade agility.',
        url: 'https://wired.com/humanoid-robotics-warehouse-milestone',
        urlToImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(17),
        content: 'The robots autonomously navigate changing floor layouts, charge themselves using magnetic floor plates, and communicate directly with automated forklifts...'
      },
      {
        source: { id: 'engadget', name: 'Engadget' },
        author: 'Consumer Tech',
        title: 'Foldable Phone Hinge Redesign Promises Zero Crease and Water Submersion Resistance',
        description: 'New liquid metal teardrop hinges and flexible ultra-thin glass allow next-generation foldable smartphones to close completely flat without creasing.',
        url: 'https://engadget.com/foldable-hinge-no-crease-water-resistant',
        urlToImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(21),
        content: 'Mechanical stress tests verified over 500,000 folding cycles at temperatures ranging from -20°C to 50°C without screen delamination...'
      },
      {
        source: { id: 'ars-technica', name: 'Ars Technica' },
        author: 'Developer Tools',
        title: 'Native WebAssembly Compilers Achieve Parity with Bare-Metal C++ Execution Speeds',
        description: 'Browser engines have rolled out new SIMD extensions and ahead-of-time JIT pipelines, allowing intensive 3D CAD and gaming engines to run at 120 FPS inside tabs.',
        url: 'https://arstechnica.com/software/webassembly-bare-metal-performance',
        urlToImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(25),
        content: 'Benchmarking suites demonstrated computational overhead below 2% compared to native desktop executables across complex matrix math workloads...'
      },
      {
        source: { id: 'techcrunch', name: 'TechCrunch' },
        author: 'Startup Wire',
        title: 'Autonomous Drone Delivery Network Approved for Commercial Urban Grocery Drop-Offs',
        description: 'Aviation authorities issued nationwide operating certificates to quiet-rotor delivery drones capable of gently lowering packages into residential backyards.',
        url: 'https://techcrunch.com/drone-delivery-urban-approval',
        urlToImage: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(29),
        content: 'Equipped with acoustic silencing acoustic shrouds, the drones emit less noise than a passing electric car during low-altitude hover drops...'
      },
      {
        source: { id: 'the-verge', name: 'The Verge' },
        author: 'Smart Home',
        title: 'Matter 2.0 Smart Home Standard Unifies Cameras, Energy Meters, and Robot Vacuums',
        description: 'The open smart home alliance released its biggest specification update yet, providing local, cloud-independent device interoperability across brands.',
        url: 'https://theverge.com/smart-home-matter-update-cameras',
        urlToImage: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(33),
        content: 'Users can now control security video feeds and monitor solar inverter outputs seamlessly from any smartphone without manufacturer-specific subscription apps...'
      },
      {
        source: { id: 'wired', name: 'Wired' },
        author: 'Future Computing',
        title: 'Photonic Chip Uses Laser Light Instead of Copper Wiring to Process AI Prompts at 10x Speed',
        description: 'Silicon photonics startups showcased optical tensor accelerators that compute neural weights at the speed of light while generating almost no heat.',
        url: 'https://wired.com/photonic-chip-laser-ai-accelerator',
        urlToImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(37),
        content: 'Data centers testing optical interconnects report a 90% reduction in cooling energy requirements alongside ten-fold throughput surges...'
      }
    ],
    business: [
      {
        source: { id: 'bloomberg', name: 'Bloomberg' },
        author: 'Markets Team',
        title: 'Global Markets Rally as Inflation Cools and Manufacturing Activity Rebounds',
        description: 'Equities surged across Asian, European, and American exchanges after purchasing manager indexes reported solid expansion across electronics and consumer sectors.',
        url: 'https://bloomberg.com/news/markets-rally-inflation-cools',
        urlToImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(2),
        content: 'Treasury yields retreated as bond traders adjusted monetary expectations, encouraging robust capital inflows into innovation and infrastructure equities...'
      },
      {
        source: { id: 'financial-times', name: 'Financial Times' },
        author: 'Corporate Mergers Desk',
        title: 'Renewable Power Producers Form Multi-Billion Grid Transmission Venture',
        description: 'A consortium of utility giants committed $24 billion to construct high-voltage direct-current transmission lines connecting offshore wind arrays to industrial corridors.',
        url: 'https://ft.com/companies/renewable-power-grid-joint-venture',
        urlToImage: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(4),
        content: 'The planned interconnectors will eliminate transmission bottlenecks, lowering wholesale electricity pricing across three major regional grids...'
      },
      {
        source: { id: 'wall-street-journal', name: 'Wall Street Journal' },
        author: 'Enterprise Finance',
        title: 'Fintech Startups Expand Instant Cross-Border Remittance Networks with Zero Margins',
        description: 'New regulatory sandboxes and real-time settlement rails have cut immigrant remittance fees from 6% to under 0.5%, unlocking billions in disposable family income.',
        url: 'https://wsj.com/articles/fintech-cross-border-remittance-expansion',
        urlToImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(6),
        content: 'Direct bank-to-wallet integration between North America, Asia, and Latin America now processes transactions within two seconds round the clock...'
      },
      {
        source: { id: 'cnbc', name: 'CNBC' },
        author: 'Commercial Real Estate',
        title: 'Urban Core Conversions Transform Empty Commercial Towers into Vibrant Mixed-Use Lofts',
        description: 'Tax incentive packages and rapid architectural retrofits have turned vacant downtown office buildings into affordable residential housing, daycare facilities, and community parks.',
        url: 'https://cnbc.com/real-estate/urban-office-tower-residential-conversions',
        urlToImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(8),
        content: 'Downtown business improvement districts report a 25% increase in foot traffic and restaurant revenues following the arrival of thousands of residential tenants...'
      },
      {
        source: { id: 'bloomberg', name: 'Bloomberg' },
        author: 'Commodities Wire',
        title: 'Global Copper and Lithium Supplies Stabilize as Advanced Recycling Plants Go Online',
        description: 'Closed-loop battery recycling facilities recovered over 95% of critical battery metals from decommissioned EVs, dampening mining price volatility.',
        url: 'https://bloomberg.com/commodities/copper-lithium-recycling-supply-surge',
        urlToImage: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(11),
        content: 'Automakers signed direct long-term contracts with hydrometallurgical refiners to supply recycled cathode materials for next-generation vehicle fleets...'
      },
      {
        source: { id: 'reuters', name: 'Reuters' },
        author: 'Retail & Consumer',
        title: 'Consumer Confidence Index Climbs to Two-Year Peak Amid Robust Job Creation',
        description: 'Surveys show households are accelerating discretionary spending and travel bookings as wage gains continue to outpace living costs across key metros.',
        url: 'https://reuters.com/business/consumer-confidence-index-high',
        urlToImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(15),
        content: 'Retailers reported early seasonal inventory turnover hit multi-year records, led by sustainable apparel, smart home electronics, and outdoor gear...'
      },
      {
        source: { id: 'financial-times', name: 'Financial Times' },
        author: 'Banking & Lending',
        title: 'Small Business Lending Rebounds with Automated AI Underwriting Approvals',
        description: 'Community banks and credit unions are approving micro-loans to main-street merchants in minutes by looking at real-time cash flow rather than rigid credit scores.',
        url: 'https://ft.com/small-business-lending-ai-approvals',
        urlToImage: 'https://images.unsplash.com/photo-1556742049-0a67e5572244?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(19),
        content: 'Default rates among algorithmically verified merchants fell 30% below historical averages, proving the resilience of agile local entrepreneurs...'
      },
      {
        source: { id: 'wall-street-journal', name: 'Wall Street Journal' },
        author: 'Venture Capital',
        title: 'Clean Industrial Tech Startups Attract $18 Billion in Series B and C Growth Rounds',
        description: 'Investors are channeling massive capital into green steel, carbon-negative cement, and thermal energy storage solutions capable of decarbonizing heavy manufacturing.',
        url: 'https://wsj.com/venture-capital-green-industrial-tech',
        urlToImage: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(23),
        content: 'Venture firms noted that industrial corporate partners are co-investing alongside financial funds, securing immediate customer pipelines for new pilot plants...'
      },
      {
        source: { id: 'bloomberg', name: 'Bloomberg' },
        author: 'Aviation Economics',
        title: 'Commercial Air Freight Modernization Lowers E-Commerce Shipping Costs by 20%',
        description: 'Automated wide-body cargo conversions and digital route tracking have boosted air cargo load factors, speeding cross-continental delivery guarantees.',
        url: 'https://bloomberg.com/air-freight-ecommerce-shipping-boost',
        urlToImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(27),
        content: 'Major international parcel carriers reported on-time fulfillment rates eclipsed 99.4% throughout the busy late summer shopping season...'
      },
      {
        source: { id: 'cnbc', name: 'CNBC' },
        author: 'Tech Investing',
        title: 'SaaS Multiples Re-Rate Upward as Generative Code Generation Slashes Operating Margins',
        description: 'Software enterprises are demonstrating record operating leverage by employing automated testing and code generation to release features with smaller engineering overhead.',
        url: 'https://cnbc.com/saas-multiples-rerate-code-generation',
        urlToImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(31),
        content: 'Financial analysts raised median margin targets across mid-cap enterprise software vendors by 450 basis points for the upcoming fiscal calendar...'
      },
      {
        source: { id: 'reuters', name: 'Reuters' },
        author: 'Agribusiness',
        title: 'Precision Agricultural Drones and Soil Sensors Yield Record Wheat Harvests with 40% Less Water',
        description: 'Farming cooperatives adopting satellite-guided variable-rate irrigation reported record bushel yields despite regional drought conditions.',
        url: 'https://reuters.com/business/agriculture-precision-drones-harvest',
        urlToImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(35),
        content: 'Commodity grain futures dipped as global supply estimates expanded, easing food inflation pressures across import-dependent nations...'
      },
      {
        source: { id: 'financial-times', name: 'Financial Times' },
        author: 'Automotive Industry',
        title: 'Electric Vehicle Parity Milestone Reached as Median EV Costs Drop Below Gas Equivalents',
        description: 'Plummeting battery cell costs and unified gigacasting vehicle frames have enabled multiple automakers to retail long-range electric compacts under $25,000.',
        url: 'https://ft.com/electric-vehicle-price-parity-milestone',
        urlToImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(39),
        content: 'Dealership inventories for affordable clean hatchbacks and family crossovers are turning over within four days of arriving on showroom floors...'
      }
    ],
    sports: [
      {
        source: { id: 'espn', name: 'ESPN' },
        author: 'Championship Desk',
        title: 'Thrilling Extra-Time Stoppage Winner Crowns Continental Football Champions',
        description: 'In an unforgettable final witnessed by 75,000 roaring fans, a spectacular 94th-minute curling volley sealed an exhilarating 3-2 victory.',
        url: 'https://espn.com/soccer/continental-football-championship-final',
        urlToImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(1),
        content: 'The underdog squad resisted fierce offensive pressure throughout the second half before executing a picture-perfect counterattack in stoppage time...'
      },
      {
        source: { id: 'bbc-sport', name: 'BBC Sport' },
        author: 'Grand Slam Review',
        title: 'Young Tennis Prodigy Becomes Youngest Player to Claim Hard Court Major Title',
        description: 'Displaying remarkable court composure and 130mph baseline serves, the 19-year-old sensation dominated the final set 6-2 to lift their inaugural Grand Slam trophy.',
        url: 'https://bbcsport.com/tennis/grand-slam-hard-court-championship',
        urlToImage: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(3),
        content: 'Standing ovations echoed across the stadium as the champion credited relentless endurance training and mental focus routines for the milestone triumph...'
      },
      {
        source: { id: 'the-athletic', name: 'The Athletic' },
        author: 'Basketball Analytics',
        title: 'Record-Breaking Scoring Streak Highlights Evolution of Pace-and-Space Offense',
        description: 'With triple-double averages soaring and three-point accuracy reaching all-time peaks, analysts explore the tactical innovations driving modern basketball excitement.',
        url: 'https://theathletic.com/basketball/pace-and-space-scoring-surge',
        urlToImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(5),
        content: 'Coaching staffs are utilizing biometric tracking and shot-quality algorithms to optimize court spacing and player rotational recovery during high-tempo schedules...'
      },
      {
        source: { id: 'skysports', name: 'Sky Sports' },
        author: 'Motorsport Wire',
        title: 'Formula 1 Unveils New Aerodynamic Rules and Sustainable Fuel Regulations for 2026 Season',
        description: 'The sport moves to 100% advanced drop-in synthetic biofuels paired with active aerodynamics to dramatically enhance wheel-to-wheel overtaking.',
        url: 'https://skysports.com/f1/aerodynamic-rules-sustainable-biofuels',
        urlToImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(7),
        content: 'Engineers from top constructor teams have reported encouraging dyno test figures, confirming matching horsepower outputs with zero fossil carbon emissions...'
      },
      {
        source: { id: 'espn', name: 'ESPN' },
        author: 'Baseball Bureau',
        title: 'Perfect Game Pitched with Immaculate 27 Strikeouts in Legendary Ballpark Feat',
        description: 'A masterclass of sweeping sliders and 101mph pinpoint fastballs produced the greatest pitching performance in modern baseball history.',
        url: 'https://espn.com/mlb/historic-perfect-game-pitching-record',
        urlToImage: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(10),
        content: 'Baseball historians confirmed the starter threw only 98 total pitches, keeping hitters off balance with unprecedented late movement...'
      },
      {
        source: { id: 'bbc-sport', name: 'BBC Sport' },
        author: 'Athletics & Track',
        title: 'Marathon World Record Shattered by Over One Minute in Fast-Paced Autumn Race',
        description: 'Aided by carbon-composite running flats and precision fueling pacers, the distance legend crossed the finish line in a historic 1 hour, 58 minutes.',
        url: 'https://bbcsport.com/athletics/marathon-world-record-shattered',
        urlToImage: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(14),
        content: 'Crowds along the final boulevard erupted in celebrations as split times revealed an astonishing 4-minute 30-second average mile pace throughout...'
      },
      {
        source: { id: 'the-athletic', name: 'The Athletic' },
        author: 'Combat Sports',
        title: 'Undisputed Heavyweight Boxing Title Unification Delivers 12 Rounds of Non-Stop Drama',
        description: 'Both champions traded thunderous combinations until the final bell, culminating in a razor-thin split decision before 90,000 spectators.',
        url: 'https://theathletic.com/boxing/undisputed-heavyweight-title-unification',
        urlToImage: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(18),
        content: 'Pundits hailed the bout as the fiercest heavyweight clash of the decade, with both fighters pledging an immediate rematch clause for spring...'
      },
      {
        source: { id: 'skysports', name: 'Sky Sports' },
        author: 'Rugby Union',
        title: 'Dramatic Drop Goal in Final Play Decides Six-Nation International Rugby Derby',
        description: 'Under heavy rain and relentless defensive pressure, the fly-half slotted a 45-meter drop goal as the stadium clock hit 82 minutes.',
        url: 'https://skysports.com/rugby/six-nations-dramatic-drop-goal-victory',
        urlToImage: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(22),
        content: 'The winning kick sent traveling supporters into delirium, preserving the national team’s unbeaten championship run for another year...'
      },
      {
        source: { id: 'espn', name: 'ESPN' },
        author: 'Extreme Sports',
        title: '15-Year-Old Skateboarder Lands First Ever 1260-Degree Air in Competition',
        description: 'The jaw-dropping three-and-a-half rotation spin on the mega-ramp scored an unprecedented perfect 100 from judges, revolutionizing the sport.',
        url: 'https://espn.com/action-sports/1260-skateboard-record-landed',
        urlToImage: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(26),
        content: 'Fellow competitors rushed the vert ramp deck in celebration, lifting the young athlete on their shoulders following the clean four-wheel landing...'
      },
      {
        source: { id: 'bbc-sport', name: 'BBC Sport' },
        author: 'Cycling Desk',
        title: 'Solo Mountain Stage Breakaway Clinches Grand Tour Yellow Jersey Victory',
        description: 'Attacking 70 kilometers from the summit finish, the climber navigated alpine switchbacks at breathless speeds to overturn a two-minute deficit.',
        url: 'https://bbcsport.com/cycling/grand-tour-alpine-breakaway-triumph',
        urlToImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(30),
        content: 'Sports directors applauded the audacious tactical gamble, which caught the peloton off guard during freezing high-altitude precipitation...'
      },
      {
        source: { id: 'the-athletic', name: 'The Athletic' },
        author: 'Golf Digest',
        title: 'Historic Eagle on the 72nd Hole Seals Dramatic Major Championship Comeback',
        description: 'A 240-yard hybrid shot over the water hazard settled three feet from the pin, setting up the winning putt in a thrilling Sunday gallery spectacle.',
        url: 'https://theathletic.com/golf/major-championship-72nd-hole-eagle',
        urlToImage: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(34),
        content: 'Fans erupted around the natural amphitheater surrounding the 18th green as the champion raised the coveted trophy aloft...'
      },
      {
        source: { id: 'skysports', name: 'Sky Sports' },
        author: 'Cricket Wire',
        title: 'Sensational Last-Ball Boundary Decides Thrilling World T20 Super Over Clash',
        description: 'Needing five runs off the final delivery, an audacious reverse ramp shot sailed into the stands to trigger wild stadium jubilation.',
        url: 'https://skysports.com/cricket/t20-world-cup-super-over-thriller',
        urlToImage: 'https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(38),
        content: 'Commentators called it one of the most electric atmospheres in tournament history, with both teams scoring matching totals through 40 overs...'
      }
    ],
    entertainment: [
      {
        source: { id: 'variety', name: 'Variety' },
        author: 'Cinema & Awards Bureau',
        title: 'Sci-Fi Epic Sweeps Film Festival with Groundbreaking Practical Effects and Score',
        description: 'Standing ovations lasted fifteen minutes at the premiere as critics lauded the practical cinematography, emotional storytelling, and stellar ensemble performances.',
        url: 'https://variety.com/film/sci-fi-epic-sweeps-festival-awards',
        urlToImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(2),
        content: 'Director and cast detailed the multi-month location shoots in Iceland and the Canary Islands, choosing real physical sets over virtual CGI stages...'
      },
      {
        source: { id: 'rolling-stone', name: 'Rolling Stone' },
        author: 'Music Trends',
        title: 'Global Acoustic Folk and Neo-Soul Revival Dominates Streaming Charts',
        description: 'Listeners are flocking to intimate live instrumentation and acoustic storytelling, propelling independent singer-songwriters to billboard summits.',
        url: 'https://rollingstone.com/music/acoustic-folk-neo-soul-streaming-revival',
        urlToImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(4),
        content: 'Vinyl LP pressings continue to set all-time highs as audiophiles seek authentic warmth and tactile connections with album liner art...'
      },
      {
        source: { id: 'hollywood-reporter', name: 'The Hollywood Reporter' },
        author: 'Streaming Industry',
        title: 'Interactive Narrative Series Let Viewers Shape Characters and Plot Twists',
        description: 'A new wave of cinematic interactive television merges high-budget narrative drama with viewer decision trees, creating hundreds of customized viewing journeys.',
        url: 'https://hollywoodreporter.com/tv/interactive-narrative-streaming-series',
        urlToImage: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(6),
        content: 'Audiences can vote live during premiere broadcasts or explore alternate timelines on-demand, redefining communal weekend entertainment...'
      },
      {
        source: { id: 'deadline', name: 'Deadline' },
        author: 'Stage & Theatre',
        title: 'West End and Broadway Theatres Report Record Global Attendance in Renaissance Season',
        description: 'Original musicals and innovative revivals of literary classics drew over 15 million patrons this season, generating unprecedented economic revitalization in cultural districts.',
        url: 'https://deadline.com/broadway-west-end-record-attendance-season',
        urlToImage: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(9),
        content: 'Youth ticket subsidy programs have successfully introduced hundreds of thousands of first-time attendees to orchestral music and live theatrical arts...'
      },
      {
        source: { id: 'variety', name: 'Variety' },
        author: 'Animation Desk',
        title: 'Hand-Drawn Animated Masterpiece Sets Global Box Office Record for Independent Studio',
        description: 'Fusing traditional cel watercolor backgrounds with subtle depth-of-field lighting, the poetic fantasy fairy tale captivated moviegoers of all ages worldwide.',
        url: 'https://variety.com/animation/hand-drawn-masterpiece-box-office-record',
        urlToImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(13),
        content: 'Film critics praised the studio for preserving analog craft, noting that every single frame was hand-inked by master artisans over a five-year production...'
      },
      {
        source: { id: 'rolling-stone', name: 'Rolling Stone' },
        author: 'Concert Industry',
        title: 'Eco-Friendly Stadium Tour Generates 100% Solar-Powered Audio and Light Spectacles',
        description: 'Major arena pop tour utilizes modular battery banks recharged by venue solar roofs, proving zero-emission rock tours are commercially viable.',
        url: 'https://rollingstone.com/music/solar-powered-stadium-tour-milestone',
        urlToImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(17),
        content: 'Audience kinetic dance tiles in the standing room general admission pit generated an additional 5% of total stage lighting energy...'
      },
      {
        source: { id: 'hollywood-reporter', name: 'The Hollywood Reporter' },
        author: 'Documentary Review',
        title: 'Deep-Ocean Wildlife Documentary Reveals First 8K Footage of Abyssal Creatures',
        description: 'Ten years in the making, camera crews submerged in titanium spheres captured bioluminescent mating dances four miles beneath the Pacific surface.',
        url: 'https://hollywoodreporter.com/documentary-ocean-8k-footage',
        urlToImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(21),
        content: 'Marine biologists confirmed the documentary team documented eleven previously unclassified cephalopods and siphonophore colonies...'
      },
      {
        source: { id: 'deadline', name: 'Deadline' },
        author: 'Literary Adaptations',
        title: 'Classic Fantasy Epic Adaptation Greenlit for Five-Season Cinematic Universe',
        description: 'Showrunners announced filming will commence across New Zealand and Scotland with practical armor sets and an orchestral score composed by award-winning maestros.',
        url: 'https://deadline.com/fantasy-epic-adaptation-five-season-universe',
        urlToImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(25),
        content: 'The production has pledged to construct permanent heritage villages that will be donated to local tourism boards following principal photography...'
      },
      {
        source: { id: 'variety', name: 'Variety' },
        author: 'Gaming & Culture',
        title: 'Open-World Fantasy Role-Playing Game Sells 20 Million Copies in Debut Weekend',
        description: 'Praised for emergent physics, handcrafted side quests, and zero predatory microtransactions, the epic RPG captivated gaming communities globally.',
        url: 'https://variety.com/gaming/open-world-rpg-record-debut-sales',
        urlToImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(29),
        content: 'Player retention stats showed an average playthrough of 45 hours during launch week, with millions sharing organic gameplay clips on social feeds...'
      },
      {
        source: { id: 'rolling-stone', name: 'Rolling Stone' },
        author: 'Classical Music',
        title: 'Youth Symphony Orchestra Wins Prestigious World Award for Reimagining Modern Masterworks',
        description: 'Composed entirely of musicians under age 22, the ensemble blended classical brass sections with electronic ambient soundscapes in sold-out concert halls.',
        url: 'https://rollingstone.com/music/youth-symphony-orchestra-prestigious-award',
        urlToImage: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(33),
        content: 'The recording received a five-star rating across major international arts journals, celebrating the bold bridge between orchestral tradition and modern melody...'
      },
      {
        source: { id: 'hollywood-reporter', name: 'The Hollywood Reporter' },
        author: 'Streaming Series',
        title: 'Mystery Whodunit Thriller Claims Number One Spot in 92 Countries Simultaneously',
        description: 'Featuring an ingenious locked-room premise and unexpected plot revelations, the six-episode miniseries sparked global watercooler discussions.',
        url: 'https://hollywoodreporter.com/tv/mystery-whodunit-thriller-global-number-one',
        urlToImage: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(37),
        content: 'Viewer completion rates reached an unprecedented 94%, with fans dissecting background set clues and costume easter eggs across online forums...'
      },
      {
        source: { id: 'deadline', name: 'Deadline' },
        author: 'Comedy & Standup',
        title: 'Charity Comedy Festival Raises $40 Million for Pediatric Healthcare Centers',
        description: 'Top international comedians took the stage for a marathon 12-hour broadcast, uniting millions of online donors for community children’s hospitals.',
        url: 'https://deadline.com/charity-comedy-festival-pediatric-fundraiser',
        urlToImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(41),
        content: 'Organizers confirmed all proceeds will directly fund neonatal intensive care incubators and specialized pediatric medical research...'
      }
    ],
    science: [
      {
        source: { id: 'new-scientist', name: 'New Scientist' },
        author: 'Deep Space Mission Team',
        title: 'Space Telescope Detects Chemical Signatures of Liquid Oceans on Exoplanet Candidate',
        description: 'Spectroscopic analysis of an Earth-sized world orbiting in the habitable zone revealed atmospheric water vapor and carbon dioxide balance indicative of temperate surface oceans.',
        url: 'https://newscientist.com/space/exoplanet-liquid-ocean-signatures',
        urlToImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(2),
        content: 'Astrophysicists confirmed the planetary system sits roughly 48 light-years away, making it an ideal candidate for targeted high-resolution imaging observations...'
      },
      {
        source: { id: 'nature', name: 'Nature Research' },
        author: 'Genetics Institute',
        title: 'Targeted Epigenetic Reprogramming Reverses Cellular Age Biomarkers in Mammalian Tissues',
        description: 'Biologists demonstrated that temporary activation of non-mutagenic Yamanaka factors restored youthful elasticity and mitochondrial efficiency in aged organ models.',
        url: 'https://nature.com/articles/epigenetic-reprogramming-cellular-age-reversal',
        urlToImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(4),
        content: 'The breakthrough bypasses the risk of oncogenic mutation, opening therapeutic avenues for treating macular degeneration and chronic cardiovascular stiffening...'
      },
      {
        source: { id: 'scientific-american', name: 'Scientific American' },
        author: 'Oceanographic Survey',
        title: 'Deep Sea Autonomous Submersibles Discover Thousands of Unknown Marine Species in Abyssal Plains',
        description: 'High-definition robotic exploration of sub-sea trenches revealed bioluminescent ecosystems thriving under immense pressures around mineral thermal vents.',
        url: 'https://scientificamerican.com/ocean/abyssal-species-discovery',
        urlToImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(7),
        content: 'Marine microbiologists have isolated unique heat-resistant enzymes from deep vent bacteria that could revolutionize sustainable industrial bioremediation...'
      },
      {
        source: { id: 'phys-org', name: 'Phys.org' },
        author: 'Clean Energy Physics',
        title: 'Compact Magnetic Confinement Fusion Device Sustains Continuous High-Density Plasma for 20 Minutes',
        description: 'Using high-temperature superconducting magnet coils, physicists achieved stable burning plasma conditions without turbulent wall degradation.',
        url: 'https://phys.org/physics/compact-magnetic-confinement-fusion-milestone',
        urlToImage: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(11),
        content: 'The experimental run validated predictive fluid-dynamic simulations, confirming engineering designs for the upcoming pilot fusion grid generator...'
      },
      {
        source: { id: 'new-scientist', name: 'New Scientist' },
        author: 'Paleontology Desk',
        title: 'Immaculately Preserved Dinosaur Feather Fossil Yields Intact Pigment Nanostructures',
        description: 'Electron microscope scanning revealed vivid iridescent color patterns in 120-million-year-old feathers, solving longstanding questions about prehistoric plumage.',
        url: 'https://newscientist.com/paleontology/dinosaur-feather-fossil-pigment-discovery',
        urlToImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(15),
        content: 'The structural melanosomes produced shimmering emerald and cobalt tones similar to modern hummingbirds, suggesting complex visual mating displays...'
      },
      {
        source: { id: 'nature', name: 'Nature Research' },
        author: 'Atmospheric Physics',
        title: 'Stratospheric Lidar Measurements Confirm Historic Healing of Antarctic Ozone Layer',
        description: 'Unprecedented satellite and balloon data verify the seasonal ozone hole reached its smallest recorded area since international chlorofluorocarbon bans took effect.',
        url: 'https://nature.com/articles/antarctic-ozone-layer-healing-milestone',
        urlToImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(19),
        content: 'Atmospheric scientists projected full baseline recovery across both polar regions decades ahead of conservative climate modeling estimates...'
      },
      {
        source: { id: 'scientific-american', name: 'Scientific American' },
        author: 'Space Exploration',
        title: 'Mars Rover Drills Subsurface Silica Core Containing Organic Chemical Fingerprints',
        description: 'Analyzing lacustrine mudstone layers deposited billions of years ago in Jezero Crater, the rover rover rover detected aromatic hydrocarbon compounds.',
        url: 'https://scientificamerican.com/space/mars-rover-silica-core-organic-compounds',
        urlToImage: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(23),
        content: 'The sealed sample tubes will be among the priority payloads retrieved by the upcoming international Mars Sample Return return mission...'
      },
      {
        source: { id: 'phys-org', name: 'Phys.org' },
        author: 'Materials Science',
        title: 'Room-Pressure Superconductor Candidate Synthesized Using Graphene-Intercalated Crystals',
        description: 'Independent laboratories replicated zero-resistance electrical transport at temperatures accessible by standard dry-ice refrigeration units.',
        url: 'https://phys.org/materials/superconductor-graphene-intercalated-crystals',
        urlToImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(27),
        content: 'If scalable, the material could eliminate electrical grid transmission losses and democratize affordable medical magnetic resonance imaging...'
      },
      {
        source: { id: 'new-scientist', name: 'New Scientist' },
        author: 'Astrophysics',
        title: 'Gravitational Wave Detectors Catch Inward Spiral of Supermassive Black Hole Binary',
        description: 'Space-based interferometers measured ripples in spacetime generated by two monsters orbiting each other every three minutes prior to eventual coalescence.',
        url: 'https://newscientist.com/space/gravitational-wave-supermassive-black-hole-binary',
        urlToImage: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(31),
        content: 'The observation confirms predictions of general relativity under extreme gravitational curvatures and provides insights into cosmic galaxy mergers...'
      },
      {
        source: { id: 'nature', name: 'Nature Research' },
        author: 'Botany & Ecology',
        title: 'Ancient Underground Fungal Networks Found to Regulate Entire Forest Carbon Exchanges',
        description: 'Isotope tracing showed mycorrhizal networks actively redistribute nitrogen and moisture from mature trees to drought-stressed saplings miles away.',
        url: 'https://nature.com/articles/mycorrhizal-fungal-network-forest-carbon',
        urlToImage: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(35),
        content: 'Foresters are now adapting logging guidelines to preserve the fungal soil tapestry, enhancing wildfire resilience and natural forest regeneration...'
      },
      {
        source: { id: 'scientific-american', name: 'Scientific American' },
        author: 'Quantum Optics',
        title: 'Entangled Photons Transmitted Across 1,200 Kilometers of Standard Fiber Optic Cables',
        description: 'Using novel quantum repeaters that compensate for optical attenuation, physicists established unhackable quantum key distribution between major cities.',
        url: 'https://scientificamerican.com/quantum/entangled-photons-fiber-optic-record',
        urlToImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(39),
        content: 'The trial relied on standard commercial dark fiber already installed along railway corridors, proving nationwide quantum internet is physically feasible...'
      },
      {
        source: { id: 'phys-org', name: 'Phys.org' },
        author: 'Geophysics',
        title: 'Seismic Wave Tomography Reveals Massive Freshwater Aquifers Underneath Continental Shelves',
        description: 'Geophysicists mapped pristine freshwater reservoirs sealed beneath impermeable seabed clays off coastal regions, totaling billions of cubic meters.',
        url: 'https://phys.org/geophysics/subsea-freshwater-aquifers-continental-shelf',
        urlToImage: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(43),
        content: 'The deposits originated during Ice Age sea level regressions and could provide drought-stricken coastal cities with renewable emergency drinking water...'
      }
    ],
    health: [
      {
        source: { id: 'medical-news-today', name: 'Medical News Today' },
        author: 'Clinical Trials Team',
        title: 'Universal mRNA Vaccine Candidate for Seasonal Influenza Enters Phase 3 Multi-Center Trial',
        description: 'The multi-epitope vaccine targets invariant stem regions of flu glycoproteins, designed to confer long-lasting protection across mutating influenza A and B strains.',
        url: 'https://medicalnewstoday.com/clinical-trials/universal-mrna-flu-vaccine-phase3',
        urlToImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(2),
        content: 'Immunology centers across four continents will follow 40,000 enrolled volunteers over two winter seasons to measure neutralizing antibody durability...'
      },
      {
        source: { id: 'healthline', name: 'Healthline' },
        author: 'Neuroscience Review',
        title: 'Non-Invasive Acoustic Stimulation Clears Toxic Protein Aggregates in Early Alzheimer Models',
        description: 'Forty-hertz gamma sensory stimulation via rhythmic sound pulses and flickering light triggered brain microglial scavenger cells to clear amyloid plaque deposits.',
        url: 'https://healthline.com/neuroscience/acoustic-stimulation-alzheimer-protein-clearing',
        urlToImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(4),
        content: 'Clinical trial participants who received one hour of daily evening audio therapy showed sustained improvements in spatial memory and verbal recall scores...'
      },
      {
        source: { id: 'webmd', name: 'WebMD' },
        author: 'Preventative Cardiology',
        title: 'Plant-Rich Polyphenol Diets Proven to Lower Biological Vascular Age by Six Years',
        description: 'A 10-year longitudinal study following 25,000 adults found that diets high in berries, olive oil, leafy greens, and nuts dramatically preserve endothelial flexibility.',
        url: 'https://webmd.com/cardiology/polyphenol-diet-vascular-age-reduction',
        urlToImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(7),
        content: 'Vascular ultrasound scans demonstrated measurable reductions in arterial stiffness, independent of baseline blood pressure and genetic predisposition...'
      },
      {
        source: { id: 'the-lancet', name: 'The Lancet' },
        author: 'Global Wellness Report',
        title: 'Targeted Circadian Light Exposure Drastically Enhances Sleep Quality and Workplace Productivity',
        description: 'New clinical guidelines recommend tailored high-kelvin morning sunlight and amber evening wavelengths to restore natural melatonin cycles in remote and office workers.',
        url: 'https://thelancet.com/wellness/circadian-light-exposure-sleep-quality',
        urlToImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(10),
        content: 'Sleep researchers documented a 48% reduction in chronic insomnia symptoms when bedroom lighting was transitioned away from blue-spectrum LEDs after dusk...'
      },
      {
        source: { id: 'medical-news-today', name: 'Medical News Today' },
        author: 'Oncology Desk',
        title: 'Personalized CAR-T Cell Therapy Achieves Sustained Remission in Refractory Lymphoma Trials',
        description: 'Next-generation gene-edited T-cells equipped with dual antigen receptors successfully neutralized malignant B-cells without inducing severe cytokine release syndrome.',
        url: 'https://medicalnewstoday.com/oncology/car-t-cell-therapy-remission-breakthrough',
        urlToImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(14),
        content: 'All twenty enrolled patients in the phase 2 study achieved complete radiological clearance within six weeks of the outpatient cell infusion...'
      },
      {
        source: { id: 'healthline', name: 'Healthline' },
        author: 'Metabolic Health',
        title: 'Oral Peptide Pill Mimics Fasting-Induced Longevity Pathways in Human Skeletal Muscle',
        description: 'Bioengineers formulated a stable oral capsule that activates AMPK enzymes, prompting cellular autophagy and blood glucose regulation similar to strenuous exercise.',
        url: 'https://healthline.com/nutrition/oral-peptide-fasting-metabolic-breakthrough',
        urlToImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(18),
        content: 'Volunteers showed a 22% improvement in insulin sensitivity and marked drops in circulating triglyceride levels over an eight-week double-blind trial...'
      },
      {
        source: { id: 'webmd', name: 'WebMD' },
        author: 'Vision Science',
        title: 'Nanoparticle Eye Drops Restore Natural Corneal Curvature in Patients with Presbyopia',
        description: 'Biocompatible peptide crosslinking drops temporarily soften the natural lens, allowing middle-aged individuals to read fine text without reading spectacles.',
        url: 'https://webmd.com/eye-health/nanoparticle-eye-drops-presbyopia-restoration',
        urlToImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(22),
        content: 'One morning drop application maintained crisp 20/20 near vision for sixteen continuous hours without blurring intermediate or distance vision...'
      },
      {
        source: { id: 'the-lancet', name: 'The Lancet' },
        author: 'Microbiome Research',
        title: 'High-Diversity Gut Probiotic Consortium Alleviates Systemic Autoimmune Inflammation',
        description: 'A synthetic bacterial consortia of 18 commensal strains restored intestinal epithelial barrier integrity, substantially reducing rheumatoid arthritis flare-ups.',
        url: 'https://thelancet.com/microbiome/gut-probiotic-consortium-autoimmune-relief',
        urlToImage: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(26),
        content: 'Inflammatory biomarkers including C-reactive protein declined by an average of 42%, allowing several trial subjects to taper steroid medications...'
      },
      {
        source: { id: 'medical-news-today', name: 'Medical News Today' },
        author: 'Orthopedics',
        title: '3D-Bioprinted Cartilage Implants Fully Integrate with Native Knee Joints in Athletes',
        description: 'Living chondrocyte scaffolds cultivated from patient cells successfully restored meniscus cushioning in sports injuries, preventing secondary osteoarthritis.',
        url: 'https://medicalnewstoday.com/orthopedics/3d-bioprinted-cartilage-knee-joint-integration',
        urlToImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(30),
        content: 'Magnetic resonance scans one year post-surgery demonstrated complete vascular and cellular assimilation with the patient’s natural femoral bone...'
      },
      {
        source: { id: 'healthline', name: 'Healthline' },
        author: 'Mental Health & Psychology',
        title: 'Nature-Based Cognitive Therapy Outperforms Traditional Screen Breaks for Mental Fatigue',
        description: 'Walking in urban parks with diverse tree canopy for just twenty minutes lowered salivary cortisol by 35% and dramatically boosted working memory.',
        url: 'https://healthline.com/mental-health/nature-cognitive-therapy-mental-fatigue',
        urlToImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(34),
        content: 'The psychological study highlighted that natural fractal patterns in leaves and bird songs allow the prefrontal cortex to replenish voluntary attention...'
      },
      {
        source: { id: 'webmd', name: 'WebMD' },
        author: 'Dentistry & Bone Health',
        title: 'Enamel-Regenerating Toothpaste Forms Natural Hydroxyapatite Shield Over Sensitive Teeth',
        description: 'A biomimetic mineral gel re-calcifies micro-cavities and seals exposed dentin tubules, eliminating temperature sensitivity within forty-eight hours.',
        url: 'https://webmd.com/oral-health/enamel-regenerating-toothpaste-hydroxyapatite',
        urlToImage: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(38),
        content: 'Clinical dental trials showed the re-hardened enamel layer proved more resistant to acidic beverage erosion than original natural tooth surfaces...'
      },
      {
        source: { id: 'the-lancet', name: 'The Lancet' },
        author: 'Public Health',
        title: 'Global Tobacco Reduction Measures Prevent Estimated 12 Million Premature Deaths',
        description: 'Comprehensive plain-packaging laws and smoking cessation clinic subsidies across sixty nations achieved record declines in smoking prevalence.',
        url: 'https://thelancet.com/public-health/tobacco-reduction-prevented-deaths-record',
        urlToImage: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=1200&q=80',
        publishedAt: d(42),
        content: 'Health ministries reported steep decreases in youth nicotine uptake and sharp reductions in cardiovascular emergency hospital admissions...'
      }
    ]
  };

  let totalCount = 0;
  Object.values(categories).forEach(arr => { totalCount += arr.length; });

  return {
    month: currentMonth,
    lastUpdated: new Date().toISOString(),
    totalArticles: totalCount,
    categories
  };
}
