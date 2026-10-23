import { Product, CollectionNotification } from '../types';

// Bundled image assets for production reliability
import heroImg from '../assets/images/hero_edser_lifestyle_1791993264904.jpg';
import mealPlannerImg from '../assets/images/product_meal_planner_sheet_1791993267093.jpg';
import roseDailyImg from '../assets/images/product_rose_daily_planner_1791993267128.jpg';
import nationalParksImg from '../assets/images/product_national_parks_adventure_1791993267417.jpg';

export const HERO_IMAGE = heroImg;

export const PRODUCTS: Product[] = [
  {
    id: 'weekly-meal-planner-spreadsheet',
    title: 'Weekly Meal Planner & Grocery List',
    category: 'planners-organization',
    categoryLabel: 'Planners & Organization',
    price: 9.00,
    shortDescription: 'An editable four-week spreadsheet for meal planning and grocery organization.',
    fullDescription: 'Take the guesswork out of family dinners and pantry stocking. This editable four-week spreadsheet streamlines your weekly meal schedule, tracks ingredient inventories, and automatically compiles your categorized grocery shopping list as you plan.',
    image: mealPlannerImg,
    formats: ['Excel Spreadsheet (.xlsx)', 'Google Sheets One-Click Copy Link', 'Printable PDF Template (US Letter & A4)'],
    sizes: ['US Letter (8.5 × 11 in)', 'A4 (210 × 297 mm)', 'Dynamic Screen Display'],
    includedContents: [
      '4-week rotating meal planner tabs (Breakfast, Lunch, Dinner & Snacks)',
      'Automated grocery list generator organized by grocery aisle (Produce, Dairy, Pantry, Protein)',
      'Pantry staple stock tracker and recipe quick-reference index',
      'Quick-start video walkthrough link and step-by-step setup guide',
      'Clean 1-page printable weekly refrigerator sheet'
    ],
    compatibility: [
      'Google Sheets (free in any web browser, iPad, iPhone, Android)',
      'Microsoft Excel 2016, 2019, 2021, and Microsoft 365 (Mac, Windows)',
      'Apple Numbers (Mac & iPad)',
      'Any standard home or commercial printer for PDF export'
    ],
    printingGuidance: {
      recommendedPaper: 'Standard 20–24 lb (75–90 gsm) copy paper or magnetic refrigerator paper sheets.',
      printerSettings: 'Select "Fit to 1 Page Wide" in spreadsheet print settings, Landscape orientation, Black & White or Color.',
      margins: 'Default standard 0.5-inch margins pre-configured.',
      bindingTips: 'Ideal for clipboard display on kitchen counters or magnetic fridge clip.'
    },
    features: [
      'Automated grocery quantity summation',
      'Pre-built meal rotation formulas',
      'Print-ready high-contrast summary page',
      'Compatible with free Google accounts'
    ],
    ownerNotesPrompt: 'Store Owner Note: Ensure the automated Google Sheets sharing link is configured with View/Make a Copy permissions prior to public deployment.'
  },
  {
    id: 'rose-daily-undated-planner',
    title: 'Rose Daily Undated Planner',
    category: 'planners-organization',
    categoryLabel: 'Planners & Organization',
    price: 14.00,
    shortDescription: 'Printable daily, weekly, and monthly planner PDFs in A4 and US Letter sizes.',
    fullDescription: 'A serene, undated planning system designed to reduce overwhelm and bring calm intentionality to each day. Featuring delicate soft rose tones and warm ivory accents, this printable suite includes comprehensive daily schedules, weekly overviews, and 12 flexible monthly spreads that you can start anytime.',
    image: roseDailyImg,
    formats: ['Print-Ready High-Res Vector PDF (300 DPI)', 'Interactive Hyperlinked PDF for Tablet Apps'],
    sizes: ['US Letter (8.5 × 11 in)', 'A4 (210 × 297 mm)'],
    includedContents: [
      'Undated Daily Planning Layout (Top 3 Priorities, Hourly Schedule, To-Do Checklist, Gratitude Note)',
      'Undated Weekly Focus Spread (7-Day Overview, Weekly Habit Tracker, Wins & Reflections)',
      '12 Undated Monthly Calendar Spreads with generous note margins',
      'Quarterly Goal Breakdown and Mindful Habits Tracker sheets',
      'Lined, Grid, and Dot-Matrix Note Pages'
    ],
    compatibility: [
      'All desktop and mobile PDF viewers (Adobe Acrobat, Preview, Chrome, Safari)',
      'Digital note-taking apps with stylus support (GoodNotes 5/6, Notability, Samsung Notes, Penly, Xodo)',
      'Any monochrome or full-color laser/inkjet printer'
    ],
    printingGuidance: {
      recommendedPaper: '28 lb to 32 lb (105–120 gsm) smooth ivory or bright white paper for zero pen bleed-through.',
      printerSettings: 'Select "Actual Size" or "Scale: 100%" to preserve true margin proportions. Do not select "Fit to Printable Area".',
      margins: 'Designed with generous 0.6-inch inner margins to accommodate spiral binding, discbound rings, or 3-hole punch.',
      bindingTips: 'Compatible with Happy Planner discs, A5 binder inserts (when scaled), or coil binding at your local copy shop.'
    },
    features: [
      'Start any day of the year with zero wasted pages',
      'Clean typography with high-legibility contrast',
      'Dual-format for physical printing or iPad stylus use',
      'Includes both US Letter and A4 document files'
    ],
    ownerNotesPrompt: 'Store Owner Note: If providing a hyperlinked Monday-start and Sunday-start variant, ensure both PDF files are included in the compressed delivery bundle.'
  },
  {
    id: 'my-first-national-parks-adventure',
    title: 'My First National Parks Adventure',
    category: 'kids-activities',
    categoryLabel: "Kids’ Activities",
    price: 8.50,
    shortDescription: 'A printable coloring and activity book for children ages 4–8.',
    fullDescription: 'Ignite curiosity about the great outdoors with screen-free, hands-on creative play. This printable 34-page adventure book guides young explorers through Yellowstone, Yosemite, the Grand Canyon, and more with delightful animal illustrations, simple wilderness mazes, word-tracing, and nature scavenger hunts.',
    image: nationalParksImg,
    formats: ['Printable High-Res PDF (300 DPI Black & White Artwork + Full-Color Cover)'],
    sizes: ['US Letter (8.5 × 11 in)', 'A4 (210 × 297 mm)'],
    includedContents: [
      '24 hand-drawn wildlife & park landscape coloring pages (Bears, Bisons, Geysers, Giant Redwoods)',
      '8 screen-free nature activity pages (Trail maze puzzles, Footprint matching, Nature scavenger hunt)',
      'Official "Junior Explorer Certificate" to personalize with child’s name and date',
      'Parent & Teacher discussion guide with 10 engaging park fun facts',
      'Print as many copies as needed for home, classroom, or road trips'
    ],
    compatibility: [
      'Compatible with any home or school printer (optimized for ink-friendly black & white printing)',
      'Digital drawing apps on tablets (Procreate, Apple Books markup, GoodNotes) using stylus or finger-painting'
    ],
    printingGuidance: {
      recommendedPaper: 'Standard 24 lb paper for crayons and colored pencils; 65 lb (176 gsm) light cardstock if children use markers or watercolors to prevent bleed-through.',
      printerSettings: 'Print in "Black & White" or "Grayscale" on standard quality to conserve printer ink. Borderless or standard margins.',
      margins: 'Even 0.5-inch border on all sides for easy stapling or folder binding.',
      bindingTips: 'Staple left edge with 3 heavy staples, place in a 3-prong folder, or punch for a mini travel binder.'
    },
    features: [
      'Targeted for ages 4 to 8 years old',
      'Screen-free road trip, rainy day, or homeschool learning',
      'Eco-conscious: print individual pages on demand',
      'Includes Junior Ranger completion certificate'
    ],
    ownerNotesPrompt: 'Store Owner Note: Educational bulk licensing or school co-op permissions should be explicitly stated in licensing documentation if commercial classroom use is permitted.'
  }
];

export const INITIAL_NOTIFICATIONS: CollectionNotification[] = [
  {
    id: 'notif-1',
    title: 'Autumn Nature Journal & Foraging Guide',
    date: 'Dropping November 2026',
    category: 'kids-activities',
    description: 'A 28-page illustrated leaf-pressing, bird observation, and backyard nature tracking journal for curious little explorers.',
    status: 'upcoming'
  },
  {
    id: 'notif-2',
    title: 'Minimalist Household Budget & Cash-Flow Planner',
    date: 'Just Released',
    category: 'planners-organization',
    description: 'An undated, guilt-free monthly finance sheet with auto-categorized expense tracking and visual savings milestones.',
    status: 'just-launched'
  }
];

export const FAQS = [
  {
    question: 'How do I access my digital downloads after purchasing?',
    answer: 'Immediately upon checkout completion, you will be directed to an instant download confirmation screen with direct download links for your files. In addition, an automated receipt email with your permanent, lifetime download access link is dispatched immediately to your email address.'
  },
  {
    question: 'What devices and software are required to use these files?',
    answer: 'Our printable planners and activity books are provided in universal PDF format, compatible with any free PDF reader (Adobe Acrobat Reader, Apple Preview, Google Chrome) as well as tablet note-taking apps like GoodNotes, Notability, and Samsung Notes. Spreadsheets are supplied in standard Microsoft Excel (.xlsx) and include a 1-click Google Sheets template copy link.'
  },
  {
    question: 'What type of paper is recommended for home printing?',
    answer: 'For everyday planners and coloring pages, standard 22–24 lb copy paper works wonderfully. If you use gel pens, fountain pens, or markers and want zero bleed-through, we strongly recommend 28–32 lb (100–120 gsm) paper. For watercolor painting or durable activity covers, 65 lb cardstock is ideal.'
  },
  {
    question: 'Can I print these files multiple times?',
    answer: 'Yes! All EDSER purchases include a personal, household license. You are welcome to print pages as many times as you need for your own personal use, your children, or your immediate household.'
  },
  {
    question: 'Are physical goods shipped to my home address?',
    answer: 'No physical products are packaged or shipped. EDSER exclusively sells instant digital downloads. This eliminates shipping delays, shipping fees, and carbon emissions, allowing you to access and enjoy your templates immediately.'
  },
  {
    question: 'What is your refund policy on digital goods?',
    answer: 'Due to the immediate digital nature of our downloads, all sales are final once files have been accessed. However, if you experience any technical difficulties, corrupt files, or accidentally purchase duplicate items, our customer care team will gladly resolve it or replace your files right away.'
  }
];
