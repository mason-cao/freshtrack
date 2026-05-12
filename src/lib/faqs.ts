export interface FaqItem {
  q: string;
  a: string;
}

export const faqs: FaqItem[] = [
  {
    q: "Is FreshTrack really free?",
    a: "Yes, free forever. No Pro tier, no upsells, no ads. It is a personal project, and running costs stay low because it is a small tool. That is the way I want to keep it.",
  },
  {
    q: "Do I need to download anything from the App Store?",
    a: 'No. FreshTrack runs in your browser and installs as a home-screen app on iPhone and Android when you tap "Add to Home Screen." You can also use it on your laptop without installing anything.',
  },
  {
    q: "How is this different from a notes app or a spreadsheet?",
    a: "Two things. Every item has a freshness date that the app surfaces actively, and it ranks recipes by what you already have expiring. A notes list will not nudge you to use the spinach before it goes off, and a spreadsheet will not suggest dinner.",
  },
  {
    q: "What if I forget to mark items as used or wasted?",
    a: "Nothing breaks. The dashboard still shows what is approaching its date. If you backfill once a week (taking out the trash, doing groceries) the numbers stay honest. There is no shame meter; the goal is feedback, not pressure.",
  },
  {
    q: "Can my whole family share one account?",
    a: "Right now, FreshTrack is scoped to one Google account per pantry. Most families pick one person to be the keeper, usually whoever does the groceries. Shared multi-user pantries are on the roadmap.",
  },
  {
    q: "Is my data shared, sold, or used to train anything?",
    a: "No. Your pantry, recipes, and waste history live in your account and are not sold, shared, or used to train any model. Sign-in is Google OAuth so you can revoke access at any time.",
  },
];
