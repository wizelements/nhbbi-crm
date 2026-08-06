import { formatDate, formatCurrency, formatDateTime } from '@/lib/utils'

export type MembershipTier = {
  id: string
  name: string
  priceCents: number
  description: string
  features: string[]
  highlighted?: boolean
  cta: { label: string; href: string }
}

export type Event = {
  id: string
  title: string
  slug: string
  description: string
  location: string
  startAt: string
  endAt?: string
  priceCents: number
  imageUrl?: string
  deadline?: string
}

export type DirectoryListing = {
  id: string
  companyName: string
  slug: string
  description: string
  category: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  logoUrl?: string
  featured?: boolean
}

export type Job = {
  id: string
  title: string
  companyName: string
  location?: string
  description: string
  contactEmail: string
  postedAt: string
}

export type MediaItem = {
  id: string
  title: string
  type: 'video' | 'embed'
  src: string
  poster?: string
}

export const MISSION_STATEMENT =
  'To spiritually and economically transform lives by discipling business champions.'

export const ABOUT_BLURB =
  'Bronner Business Institute (BBI) is a non-profit organization dedicated to continuing the legacy of philanthropy, business mentoring, and life skills training that characterized Nathaniel H. Bronner, Sr., father of Bishop Dale C. Bronner.'

export const ABOUT_HISTORY =
  'The Nathaniel H. Bronner, Sr. Entrepreneurship Center (NHBEC) was founded in 2000 as an extension of the ministry of Word Of Faith Family Worship Center. It was created to encourage, equip, and empower men and women of God to launch, grow, and expand successful businesses.'

export const CREED = [
  'I will walk in the fullness that God has called me to be.',
  'I will be faithful over the God-given talents, relationships and opportunities.',
  'I will seek to bear fruit in my business(es) to advance the Kingdom of God, my local church and my family.',
  'I will assist my fellow saints in the marketplace as God will lead me.',
  'I do this only to bring Him glory.',
  'Through His power, I will succeed.',
]

export const VALUES = [
  { title: 'Faith', body: 'We operate from a foundation of biblical principles in every business decision.' },
  { title: 'Excellence', body: 'We pursue the highest standards, honoring the legacy of N.H. Bronner.' },
  { title: 'Community', body: 'We build bridges between entrepreneurs, churches, and the marketplace.' },
  { title: 'Empowerment', body: 'We equip others with tools, training, and relationships to thrive.' },
]

export const LEADERSHIP = [
  {
    name: 'Bishop Dale C. Bronner',
    role: 'Founder & Visionary',
    bio: 'Founder of Word of Faith Family Worship Center and the spiritual architect behind BBI.',
  },
  {
    name: 'Dr. Al Watkins',
    role: 'Executive Director',
    bio: 'Leads strategic initiatives, partnerships, and the expansion of BBI programs.',
  },
]

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: 'associate',
    name: 'Associate',
    priceCents: 0,
    description: 'Awarded to individuals who regularly attend and support BBI activities.',
    features: [
      'BBI news, announcements and opportunities',
      'Access to training courses and workshops',
      'Networking opportunities with Christian business owners',
    ],
    cta: { label: 'Sign Up', href: '/member/register' },
  },
  {
    id: 'bronze',
    name: 'Bronze',
    priceCents: 5000,
    description: 'Bronze membership allows you to have exposure of your business within BBI.',
    features: [
      'All Associate benefits',
      'Listing in the BBI CHAMPION Online Business Directory',
      'A custom Business Profile Page on the BBI Business Network',
    ],
    cta: { label: 'Join Bronze', href: '/member/register?tier=bronze' },
  },
  {
    id: 'silver',
    name: 'Silver',
    priceCents: 10000,
    description: 'Silver membership allows you to be more connected to our network.',
    highlighted: true,
    features: [
      'All Bronze benefits',
      'Vending opportunities at Kingdom Connections Events',
      'Job posting and candidate resumes via the BBI Connector',
      'Discounts on BBI products and services',
    ],
    cta: { label: 'Join Silver', href: '/member/register?tier=silver' },
  },
  {
    id: 'gold',
    name: 'Gold',
    priceCents: 25000,
    description: 'Gold membership provides mentoring sessions and deeper discounts.',
    features: [
      'All Silver benefits',
      'Interactive advertisement on BBI web pages',
      'One hour Business Tune Up Session with BBI counselors',
      'Deeper discounts on BBI products and services',
    ],
    cta: { label: 'Join Gold', href: '/member/register?tier=gold' },
  },
]

export const SERVICE_TRAINING = {
  title: 'BBI Training',
  subtitle: 'Certified NxLevel™ Entrepreneurial Training',
  body: [
    'BBI is a certified training body for the NxLevel Entrepreneurship curriculum. The curriculum was developed with a 15 million dollar endowment to enable practical, hands-on learning for business development.',
    'We teach an Aspiring (Micro) Start-Up Course, an Advanced Entrepreneurship Course, and a Youth Entrepreneurship Course. Each track is designed to move entrepreneurs from idea to execution with biblical principles as the foundation.',
  ],
  cta: { label: 'View Upcoming Classes', href: '/events' },
}

export const SERVICE_CONSULTING = {
  title: 'BBI Consulting',
  subtitle: 'One-on-one sessions and empowered referrals',
  body: [
    'In addition to robust classroom instruction, BBI offers consulting. The consulting can be in the form of one-on-one sessions to address select topics, as well as an empowered tactical referral system.',
    'BBI also serves as a technical provider for the SBA Community Express Loan Program, helping members access capital to grow.',
  ],
  cta: { label: 'Request a Consultation', href: '/contact' },
}

export const SERVICE_NETWORKING = {
  title: 'BBI Networking',
  subtitle: 'Power Networking & Kingdom Connections',
  body: [
    'Power Networking events are a cornerstone of BBI’s programmatic offering. These events are designed to allow fellow entrepreneurs to meet, greet, and develop leads.',
    'Our featured networking event is Kingdom Connections. Kingdom Connections combine inspirational speakers with an open format designed to engage entrepreneurs to network and expand their circles of influence and potential client or referral base.',
  ],
  cta: { label: 'Attend Kingdom Connections', href: '/events' },
}

export async function getFeaturedEvents(): Promise<Event[]> {
  // Stub: replace with real DB/API call.
  return [
    {
      id: 'gap-2026',
      title: 'Grant Acceleration Program (GAP)',
      slug: 'grant-acceleration-program-2026',
      description:
        'Your organization needs funds. BBI is here to help you bridge the gap. Write a grant proposal in 5 short weeks guided by the pros at Bronner Business Institute.',
      location: 'WOF Life Training Center 221',
      startAt: '2026-08-15T09:00:00',
      endAt: '2026-08-15T12:00:00',
      priceCents: 29900,
      deadline: '2026-08-13',
    },
    {
      id: 'nxlevel-fall-2026',
      title: 'BBI NxLeveL Growing Your Business',
      slug: 'nxlevel-growing-your-business-fall-2026',
      description:
        'Do you want to launch a new business or really grow an existing business to a new level in 2026? Write the vision! This 10-week training experience will help you turn your dream into a profitable reality.',
      location: 'Riverside EpiCenter 202',
      startAt: '2026-09-14T18:00:00',
      endAt: '2026-09-14T21:00:00',
      priceCents: 75000,
      deadline: '2026-08-30',
    },
  ]
}

export async function getAllEvents(): Promise<Event[]> {
  return getFeaturedEvents()
}

export async function getDirectoryListings(): Promise<DirectoryListing[]> {
  return [
    {
      id: 'christian-brothers',
      companyName: 'Christian Brothers Mechanical',
      slug: 'christian-brothers-mechanical',
      description: 'Heating, air conditioning and plumbing services with integrity.',
      category: 'Home Repair & Maintenance',
      website: 'https://www.christianbrothersmechanical.com/',
    },
    {
      id: 'plumbing-plus',
      companyName: 'Plumbing Plus',
      slug: 'plumbing-plus',
      description: 'Residential and commercial plumbing solutions.',
      category: 'Plumbing',
      website: 'https://www.nhbb.org/business/plumbingplus',
    },
    {
      id: 'miss-ds',
      companyName: "Miss D's Pralines",
      slug: 'miss-ds-pralines',
      description: 'Handmade southern pralines and sweet treats.',
      category: 'Food & Beverage',
      website: 'https://www.nhbbi.org/business/missdspralines',
    },
    {
      id: 'jc-huffman',
      companyName: 'J.C. Huffman Country Inn',
      slug: 'jc-huffman-country-inn',
      description: 'Charming country inn and event venue.',
      category: 'Hospitality',
      website: 'https://www.nhbbi.org/business/jchuffmancountryinn',
    },
    {
      id: 'pmy-model-fitness',
      companyName: 'PMM Fit',
      slug: 'pmm-fit',
      description: 'Model fitness coaching and wellness programs.',
      category: 'Health & Wellness',
      website: 'https://www.nhbbi.org/business/pamela-myers-model-fitness',
    },
  ]
}

export async function getDirectoryCategories(): Promise<string[]> {
  const listings = await getDirectoryListings()
  return Array.from(new Set(listings.map((l) => l.category))).sort()
}

export async function getJobs(): Promise<Job[]> {
  return [
    {
      id: 'job-1',
      title: 'Administrative Assistant',
      companyName: 'Christian Brothers Mechanical',
      location: 'Austell, GA',
      description: 'Support scheduling, customer service, and dispatch for a growing trades company.',
      contactEmail: 'careers@christianbrothersmechanical.com',
      postedAt: '2026-07-20',
    },
    {
      id: 'job-2',
      title: 'Production Baker',
      companyName: "Miss D's Pralines",
      location: 'Atlanta, GA',
      description: 'Hand-craft pralines and manage daily production schedules.',
      contactEmail: 'jobs@missdspralines.com',
      postedAt: '2026-07-28',
    },
  ]
}

export async function getMediaItems(): Promise<MediaItem[]> {
  return [
    {
      id: 'nxlevel-promo',
      title: 'NxLeveL Promo',
      type: 'video',
      src: 'https://www.nhbbi.org/videos/NxLeveL_Promo_FINAL.mp4',
    },
    {
      id: 'graduation-2026',
      title: 'BBI NxLeveL Graduation Ceremony',
      type: 'video',
      src: 'https://www.nhbbi.org/videos/BBI_Graduation_2026.mp4',
    },
    {
      id: 'kc-2021-02',
      title: 'BBI Kingdom Connections: Sift and Shift',
      type: 'video',
      src: 'https://onedrive.live.com/download?cid=EFEF630FD43C958B&resid=EFEF630FD43C958B%2114701&authkey=AOSsB7OmkrNwHqw',
      poster: 'https://www.nhbbi.org/images/KC/2021-02/KC_video_cover_2021-02-09.jpg',
    },
  ]
}

export { formatDate, formatCurrency, formatDateTime }
