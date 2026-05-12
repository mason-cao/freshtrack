export type FoodCategory =
  | "produce"
  | "dairy"
  | "meat"
  | "seafood"
  | "bakery"
  | "grains";

export interface ShelfLifeRow {
  condition: string;
  duration: string;
  note?: string;
}

export interface FoodSource {
  label: string;
  url: string;
}

export interface FoodPageData {
  slug: string;
  displayName: string;
  pluralDisplayName?: string;
  category: FoodCategory;
  h1: string;
  intro: string;
  metaDescription: string;
  imageKey: string;
  imageAlt: string;
  quickStats: {
    counter?: string;
    fridge?: string;
    freezer?: string;
  };
  shelfLife: ShelfLifeRow[];
  storageTips: string[];
  spoilageSigns: string[];
  faqs: { q: string; a: string }[];
  recipeMatchIngredients: string[];
  relatedFoods: string[];
  sources: FoodSource[];
}

export const foods: FoodPageData[] = [
  {
    slug: "avocado",
    displayName: "Avocado",
    pluralDisplayName: "Avocados",
    category: "produce",
    h1: "How long does avocado last? And how to keep it fresh longer.",
    intro:
      "Avocados ripen on the counter and slow down in the fridge. Knowing when to move them, and how to store the cut half, is the difference between a perfect avocado toast and a sad brown lump.",
    metaDescription:
      "How long avocados last on the counter, in the fridge, and frozen. Storage tips, spoilage signs, recipes, and FAQs from a free pantry tracker for busy households.",
    imageKey: "avocado",
    imageAlt: "Whole and halved avocados on a wooden board",
    quickStats: {
      counter: "3-5 days (until ripe)",
      fridge: "1-2 weeks (whole) / 1-3 days (cut)",
      freezer: "4-6 months (mashed)",
    },
    shelfLife: [
      {
        condition: "Whole, unripe, counter",
        duration: "3-5 days",
        note: "Until soft to gentle pressure.",
      },
      {
        condition: "Whole, ripe, counter",
        duration: "1-2 days",
        note: "Move to the fridge once ripe.",
      },
      {
        condition: "Whole, unripe, fridge",
        duration: "7-10 days",
        note: "Cold slows ripening significantly.",
      },
      {
        condition: "Whole, ripe, fridge",
        duration: "3-5 days",
        note: "Best holding window for ripe fruit.",
      },
      {
        condition: "Cut, with pit, fridge",
        duration: "1-2 days",
        note: "Brush with lemon or lime juice and seal airtight.",
      },
      {
        condition: "Mashed, frozen",
        duration: "4-6 months",
        note: "Mix with a teaspoon of lemon juice per avocado.",
      },
    ],
    storageTips: [
      "Buy avocados firm and dark green if you do not plan to eat them within two days. They ripen on the counter at room temperature.",
      "Speed up ripening by placing avocados in a paper bag with a banana or apple. The ethylene gas from the other fruit accelerates the process.",
      "Once ripe, move avocados to the refrigerator. Cold storage slows further ripening by three to five days.",
      "For a cut avocado, leave the pit in the unused half, brush the exposed flesh with lemon or lime juice, and store airtight. The pit does not actually prevent browning, but reducing air contact does.",
      "To freeze, peel and mash the flesh with a teaspoon of lemon juice per avocado. Store in airtight containers or freezer bags with the air pressed out. Texture changes on thaw, so use frozen avocado for guacamole, smoothies, or baking, not for slicing.",
    ],
    spoilageSigns: [
      "Black, stringy strands running through the flesh (not just surface browning from oxidation).",
      "A sour, rancid, or chemical smell when you cut into it.",
      "Visible mold on the skin or inside the fruit.",
      "Flesh that has gone fully black and mushy, beyond a bruised spot.",
      "The pit feels loose and rattles when you shake the whole fruit.",
    ],
    faqs: [
      {
        q: "Can you freeze whole avocados?",
        a: "Whole avocados do not freeze well. The texture turns watery and stringy on thaw. Freeze mashed avocado with lemon juice instead, and use it for guacamole, smoothies, or baked goods.",
      },
      {
        q: "Is brown avocado safe to eat?",
        a: "Surface browning from oxidation is harmless. Scrape it off and eat the green flesh underneath. Avocado that is brown throughout, accompanied by a sour smell or stringy texture, has gone bad and should be discarded.",
      },
      {
        q: "How do you ripen an avocado overnight?",
        a: "Place the avocado in a brown paper bag with a banana or apple and leave it on the counter. The trapped ethylene gas can ripen a firm avocado in 18 to 36 hours.",
      },
      {
        q: "Does keeping the pit prevent the cut half from browning?",
        a: "Not really. The pit just covers a small area of flesh. What actually slows browning is reducing oxygen contact, so brush the surface with lemon or lime juice and store the cut half airtight.",
      },
    ],
    recipeMatchIngredients: ["avocado"],
    relatedFoods: ["banana", "tomato", "lettuce"],
    sources: [
      {
        label: "USDA FoodKeeper App",
        url: "https://www.foodsafety.gov/keep-food-safe/foodkeeper-app",
      },
      {
        label: "California Avocado Commission storage guidance",
        url: "https://www.californiaavocado.com/how-tos/storage",
      },
    ],
  },
  {
    slug: "spinach",
    displayName: "Spinach",
    category: "produce",
    h1: "How long does spinach last, and how to keep it from going slimy.",
    intro:
      "Spinach is one of the fastest produce items to wilt and slime. The good news: a single paper towel and a high-humidity drawer can double how long it stays usable.",
    metaDescription:
      "How long spinach lasts in the fridge and freezer, how to store it without going slimy, signs of spoilage, recipes, and FAQs.",
    imageKey: "spinach",
    imageAlt: "Fresh spinach leaves in a colander",
    quickStats: {
      counter: "Not recommended",
      fridge: "5-10 days",
      freezer: "8-12 months (blanched)",
    },
    shelfLife: [
      {
        condition: "Counter, room temperature",
        duration: "A few hours",
        note: "Wilts visibly within half a day. Not a storage option.",
      },
      {
        condition: "Fridge, original clamshell",
        duration: "5-7 days",
        note: "Check daily, remove any slimy leaves.",
      },
      {
        condition: "Fridge, washed and dried in paper towels",
        duration: "7-10 days",
        note: "The paper towel absorbs the moisture that causes slime.",
      },
      {
        condition: "Frozen, blanched",
        duration: "8-12 months",
        note: "Blanch one minute, ice bath, drain, freeze.",
      },
      {
        condition: "Frozen, raw (unblanched)",
        duration: "1-2 months",
        note: "Texture turns mushy and slightly bitter on thaw.",
      },
    ],
    storageTips: [
      "Do not wash spinach until you are ready to use it. Surface moisture accelerates slime and wilting by two to three days.",
      "If the original container has condensation, transfer the spinach to a bag or container lined with a paper towel. The towel pulls excess moisture away from the leaves.",
      "Store spinach in the crisper drawer set to high humidity. Most fridges have a slider on the drawer that controls this.",
      "Check bagged spinach daily and remove any wilted, yellow, or slimy leaves. One bad leaf accelerates spoilage in the leaves around it.",
      "To freeze, blanch the leaves in boiling water for one minute, plunge into ice water, drain thoroughly, and store in airtight portions. Skip blanching and the texture suffers significantly.",
    ],
    spoilageSigns: [
      "Slimy or mushy texture on the leaves, especially in the bag or container.",
      "Yellow or brown discoloration spreading from the edges inward.",
      "A sour or off smell when you open the container.",
      "Watery liquid pooling at the bottom of the bag.",
      "Wilted leaves that do not perk up after a brief cold water bath.",
    ],
    faqs: [
      {
        q: "Can you eat slimy spinach?",
        a: "No. Slime indicates bacterial breakdown. Washing does not make it safe, and the leaves often have an off taste even when the slime is rinsed away. Compost the bag.",
      },
      {
        q: "Should you wash spinach before storing it?",
        a: "No. Wash right before use. Wet leaves spoil two to three times faster than dry ones, even in the fridge.",
      },
      {
        q: "Can you freeze fresh spinach without blanching?",
        a: "Technically yes, but the texture turns mushy and the flavor goes bitter within a month or two. Blanching preserves texture, color, and shelf life for up to a year.",
      },
      {
        q: "Is wilted spinach still good?",
        a: "Soft wilting with no slime or smell is usually fine. Submerge the leaves in cold water for ten minutes to revive them. Yellow leaves, slime, or a sour smell mean the spinach is past saving.",
      },
    ],
    recipeMatchIngredients: ["spinach"],
    relatedFoods: ["lettuce", "broccoli", "avocado"],
    sources: [
      {
        label: "USDA FoodKeeper App",
        url: "https://www.foodsafety.gov/keep-food-safe/foodkeeper-app",
      },
      {
        label: "UC Davis Postharvest Technology Center",
        url: "https://postharvest.ucdavis.edu/Commodity_Resources/Fact_Sheets/",
      },
    ],
  },
];

// More foods appended below the existing array.

const moreFoods: FoodPageData[] = [
  {
    slug: "banana",
    displayName: "Banana",
    pluralDisplayName: "Bananas",
    category: "produce",
    h1: "How long do bananas last? And how to slow them down or ripen them faster.",
    intro:
      "Bananas ripen on a curve. Knowing how to speed up green ones, slow down ripe ones, and freeze the rest is the difference between a daily fruit and a weekly tax on your kitchen.",
    metaDescription:
      "How long bananas last on the counter, in the fridge, and frozen. Plus how to ripen them quickly, slow them down, and use up overripe bananas.",
    imageKey: "banana",
    imageAlt: "A bunch of bananas on a kitchen counter",
    quickStats: {
      counter: "2-7 days (depending on ripeness)",
      fridge: "5-7 days (skin browns, fruit stays good)",
      freezer: "2-3 months (peeled)",
    },
    shelfLife: [
      {
        condition: "Counter, green to yellow",
        duration: "3-5 days",
        note: "Will continue ripening at room temperature.",
      },
      {
        condition: "Counter, fully ripe (spotted)",
        duration: "1-2 days",
        note: "Move to the fridge to extend, or freeze for later.",
      },
      {
        condition: "Fridge, ripe",
        duration: "5-7 days",
        note: "The peel browns but the fruit inside stays firm and sweet.",
      },
      {
        condition: "Freezer, peeled and sliced",
        duration: "2-3 months",
        note: "Use directly in smoothies or banana bread.",
      },
      {
        condition: "Freezer, peeled whole",
        duration: "2-3 months",
        note: "Wrap individually to avoid sticking together.",
      },
    ],
    storageTips: [
      "Buy bananas at the ripeness you want to eat them. Greener bananas keep longer; yellow with light spots are ready now.",
      "Hang bananas on a hook or stand to reduce bruising. Pressure points from sitting on the counter accelerate brown spots.",
      "To speed up ripening, place bananas in a paper bag with an apple. The trapped ethylene gas can ripen a firm banana in 12 to 24 hours.",
      "Once bananas hit your preferred ripeness, move them to the fridge. The peel will go brown, but the fruit inside holds for another five to seven days.",
      "For freezing, peel first and either slice or freeze whole in a single layer. Bagging unpeeled bananas in the freezer makes peeling them later much harder.",
    ],
    spoilageSigns: [
      "Skin and fruit are fully brown and mushy throughout (not just the skin).",
      "Fuzzy mold growing on the skin or stem.",
      "A fermented or alcoholic smell when you open the peel.",
      "Fruit flies hovering around the bunch.",
      "Liquid leaking from a split skin.",
    ],
    faqs: [
      {
        q: "Are brown bananas still good to eat?",
        a: "A brown peel does not mean the fruit is bad. If the inside is firm and smells sweet, it is fine, often sweeter than a yellow banana. Mushy fruit with a fermented smell is past saving for raw eating but still great for banana bread or smoothies.",
      },
      {
        q: "Can you freeze bananas with the peel on?",
        a: "You can, but the peel turns black and gets sticky and difficult to remove. Peel first and freeze the fruit on a parchment-lined tray, then transfer to a bag. You will thank yourself later.",
      },
      {
        q: "How do you ripen bananas quickly?",
        a: "Put them in a brown paper bag with a ripe apple and leave on the counter for 12 to 24 hours. The bag traps ethylene gas and accelerates ripening.",
      },
      {
        q: "Does the fridge stop bananas from ripening?",
        a: "Cold slows enzymatic ripening dramatically once the fruit is already ripe. Refrigerating an unripe banana stops it from getting sweeter, so wait until it hits your preferred ripeness before moving it in.",
      },
    ],
    recipeMatchIngredients: ["banana"],
    relatedFoods: ["strawberries", "bread", "greek-yogurt"],
    sources: [
      {
        label: "USDA FoodKeeper App",
        url: "https://www.foodsafety.gov/keep-food-safe/foodkeeper-app",
      },
      {
        label: "Dole banana storage guidance",
        url: "https://www.dole.com/en/blog/healthy-living/banana-storage-tips",
      },
    ],
  },
  {
    slug: "broccoli",
    displayName: "Broccoli",
    category: "produce",
    h1: "How long does broccoli last? And how to keep the florets from yellowing.",
    intro:
      "Broccoli wants cold and a little airflow. Stored right, fresh heads last close to a week. Stored wrong, the florets yellow and the stem turns sour within three days.",
    metaDescription:
      "How long broccoli lasts in the fridge and freezer, the right way to store it, what yellowing means, and recipes that use up an aging head.",
    imageKey: "broccoli",
    imageAlt: "Fresh broccoli florets on a wooden board",
    quickStats: {
      counter: "Not recommended (1-2 days)",
      fridge: "3-7 days",
      freezer: "10-12 months (blanched)",
    },
    shelfLife: [
      {
        condition: "Counter, room temperature",
        duration: "1-2 days",
        note: "Florets yellow and stem softens quickly. Avoid if possible.",
      },
      {
        condition: "Fridge, original wrap or perforated bag",
        duration: "3-5 days",
        note: "Crisper drawer, high humidity setting.",
      },
      {
        condition: "Fridge, with stem in shallow water",
        duration: "5-7 days",
        note: "Treat it like a bouquet. Refresh the water every two days.",
      },
      {
        condition: "Freezer, blanched",
        duration: "10-12 months",
        note: "Blanch florets 2 minutes, ice bath, drain, freeze.",
      },
      {
        condition: "Freezer, raw (unblanched)",
        duration: "1-2 months",
        note: "Texture and color suffer significantly.",
      },
    ],
    storageTips: [
      "Do not wash broccoli until you are ready to use it. Surface moisture speeds up yellowing and mold.",
      "Store in a perforated bag or the original packaging in the crisper drawer. Airflow prevents condensation, which causes rot.",
      "For longer storage, wrap the stem in a damp paper towel and stand the head upright in a glass with an inch of water in the fridge. This keeps it fresh up to seven days.",
      "Broccoli is sensitive to ethylene. Keep it away from apples, bananas, and tomatoes, which all give off ethylene gas and speed up yellowing.",
      "To freeze, cut into florets, blanch for two minutes in boiling water, plunge into ice water, drain thoroughly, then freeze in a single layer before bagging.",
    ],
    spoilageSigns: [
      "Florets turning from deep green to yellow or brown.",
      "A strong sulfur or cabbage-like smell (mild broccoli smell is normal; sharp and sour is not).",
      "Slimy or limp texture on the stem or florets.",
      "Black or dark spots on the florets.",
      "Visible mold on the stem cut or florets.",
    ],
    faqs: [
      {
        q: "Can you eat broccoli that is starting to turn yellow?",
        a: "Mild yellowing is a sign of aging, not spoilage. The florets are still safe to eat but taste slightly bitter and lose nutritional value. Use them in soup or stir fry where the flavor is masked, or compost if they are mostly yellow.",
      },
      {
        q: "Why does my broccoli smell bad?",
        a: "Broccoli is a brassica and naturally releases sulfur compounds as it ages. A faint cabbage smell is normal. A strong, sour, or rotten smell means the broccoli is past its prime.",
      },
      {
        q: "Do you have to blanch broccoli before freezing?",
        a: "Yes, for best quality. Blanching stops the enzymes that cause loss of color, texture, and flavor in the freezer. Unblanched broccoli still freezes, but the texture turns mushy and the color dulls within a few weeks.",
      },
      {
        q: "Can you freeze cooked broccoli?",
        a: "Yes, but the texture becomes soft. Frozen cooked broccoli works best in soups, casseroles, and pasta dishes rather than as a side on its own.",
      },
    ],
    recipeMatchIngredients: ["broccoli"],
    relatedFoods: ["spinach", "lettuce", "chicken-breast"],
    sources: [
      {
        label: "USDA FoodKeeper App",
        url: "https://www.foodsafety.gov/keep-food-safe/foodkeeper-app",
      },
      {
        label: "UC Davis Postharvest Technology Center",
        url: "https://postharvest.ucdavis.edu/Commodity_Resources/Fact_Sheets/",
      },
    ],
  },
  {
    slug: "lettuce",
    displayName: "Lettuce",
    category: "produce",
    h1: "How long does lettuce last? And how to keep it from wilting on day three.",
    intro:
      "Lettuce hates moisture, ethylene, and warm fridges. Get those three things right and a head of romaine lasts close to two weeks. Get them wrong and bagged greens slime out in 48 hours.",
    metaDescription:
      "How long different types of lettuce last in the fridge, the paper-towel trick that doubles shelf life, signs it has gone bad, and how to revive wilted leaves.",
    imageKey: "lettuce",
    imageAlt: "Heads of fresh lettuce in a wooden crate",
    quickStats: {
      counter: "Not recommended",
      fridge: "7-14 days (head) / 3-5 days (bagged)",
      freezer: "Not recommended",
    },
    shelfLife: [
      {
        condition: "Counter, room temperature",
        duration: "A few hours",
        note: "Wilts visibly within half a day. Not a storage option.",
      },
      {
        condition: "Fridge, whole head, wrapped",
        duration: "10-14 days",
        note: "Romaine and iceberg are the longest-lasting types.",
      },
      {
        condition: "Fridge, washed and dried with paper towels",
        duration: "7-10 days",
        note: "Paper towels absorb the moisture that causes slime.",
      },
      {
        condition: "Fridge, bagged spring mix",
        duration: "3-5 days",
        note: "Tender greens slime out faster than firmer types.",
      },
    ],
    storageTips: [
      "Do not wash lettuce until you are ready to use it. Moisture is the main driver of slime and wilting in the fridge.",
      "For a whole head, wrap loosely in a paper towel and store in a perforated bag in the crisper drawer. The towel pulls excess moisture away without drying the head out.",
      "For bagged or washed greens, line the container with a paper towel and replace it if it becomes saturated. One bad leaf accelerates spoilage in the leaves around it.",
      "Lettuce is highly ethylene-sensitive. Keep it away from apples, bananas, tomatoes, and avocados, which all give off ethylene and cause brown rust spots on the leaves.",
      "Set the crisper drawer to high humidity. Most fridges have a slider on the drawer that adjusts this.",
    ],
    spoilageSigns: [
      "Slimy or mushy texture on the leaves, especially in bagged greens.",
      "Rust-colored or brown spots, particularly on the cut ends or ribs.",
      "Yellow or wilted leaves that do not perk up after a cold water bath.",
      "Watery liquid pooling in the bag or container.",
      "A sour, off, or fermented smell.",
    ],
    faqs: [
      {
        q: "Can you freeze lettuce?",
        a: "Not really. The high water content turns the leaves to mush on thaw. Lettuce is one of the few foods that simply does not store frozen in a useful way.",
      },
      {
        q: "Can you revive wilted lettuce?",
        a: "Yes, if it is just wilted and not slimy. Submerge the leaves in cold water for 15 to 30 minutes, then spin or pat dry. Lettuce that has gone slimy or smells off is past saving.",
      },
      {
        q: "Why does my bagged lettuce go bad so fast?",
        a: "Pre-washed greens have damaged leaf surfaces from processing, plus they sit in slightly humid bags. Buying whole heads and washing only what you need typically doubles shelf life.",
      },
      {
        q: "Is it safe to eat lettuce past the use-by date?",
        a: "Use-by dates on lettuce are quality dates, not safety dates. If the leaves look, smell, and feel fine (no slime, no sour smell), they are safe regardless of the printed date.",
      },
    ],
    recipeMatchIngredients: ["lettuce"],
    relatedFoods: ["spinach", "tomato", "broccoli"],
    sources: [
      {
        label: "USDA FoodKeeper App",
        url: "https://www.foodsafety.gov/keep-food-safe/foodkeeper-app",
      },
      {
        label: "UC Davis Postharvest Technology Center",
        url: "https://postharvest.ucdavis.edu/Commodity_Resources/Fact_Sheets/",
      },
    ],
  },
  {
    slug: "tomato",
    displayName: "Tomato",
    pluralDisplayName: "Tomatoes",
    category: "produce",
    h1: "How long do tomatoes last? And should you keep them on the counter or in the fridge?",
    intro:
      "The counter-vs-fridge debate has a clear answer if you separate ripening from storing. Underripe tomatoes belong on the counter. Fully ripe ones you cannot eat today belong in the fridge.",
    metaDescription:
      "How long tomatoes last at room temperature, in the fridge, and frozen. The honest answer to the counter-vs-fridge debate, plus storage tips and use-it-up recipes.",
    imageKey: "tomato",
    imageAlt: "Ripe tomatoes on the vine",
    quickStats: {
      counter: "4-7 days (until ripe)",
      fridge: "5-7 days (ripe) / 1-2 days (cut)",
      freezer: "6-8 months (whole or pureed)",
    },
    shelfLife: [
      {
        condition: "Counter, unripe to ripe",
        duration: "4-7 days",
        note: "Best flavor when ripened at room temperature.",
      },
      {
        condition: "Counter, fully ripe",
        duration: "1-2 days",
        note: "Move to the fridge if you cannot use them soon.",
      },
      {
        condition: "Fridge, fully ripe whole",
        duration: "5-7 days",
        note: "Bring back to room temperature 30 minutes before eating for flavor.",
      },
      {
        condition: "Fridge, cut",
        duration: "1-2 days",
        note: "Cover the cut side and store airtight.",
      },
      {
        condition: "Freezer, whole",
        duration: "6-8 months",
        note: "Skin slips off after thawing. Perfect for sauce or soup.",
      },
    ],
    storageTips: [
      "Store unripe and ripening tomatoes stem-side down on the counter, out of direct sunlight. Stem-side down prevents air and moisture loss through the natural scar where the tomato was on the vine.",
      "Move tomatoes to the fridge once they are fully ripe and you cannot eat them within a day. Cold dulls flavor slightly but stops further breakdown.",
      "Bring fridge tomatoes back to room temperature for 30 minutes before eating. This restores most of the flavor that cold suppressed.",
      "Cut tomatoes need to be covered tightly and refrigerated. The exposed flesh dries out and absorbs fridge odors within hours.",
      "To freeze tomatoes whole, wash, dry, and place in a single layer on a tray. Once frozen solid, transfer to a bag. The skin slips off easily after thawing.",
    ],
    spoilageSigns: [
      "Wrinkled, shriveled skin and a sunken appearance.",
      "Mushy spots that weep liquid or feel hollow under pressure.",
      "Visible mold on the skin or stem area.",
      "A sour, fermented, or off smell.",
      "Cracks that have started leaking.",
    ],
    faqs: [
      {
        q: "Should you store tomatoes in the fridge or on the counter?",
        a: "Both, at different stages. Ripen them on the counter for best flavor. Once fully ripe, refrigerate if you cannot use them within a day. Cold storage slows decay but slightly dulls flavor, so warm them back up before eating.",
      },
      {
        q: "Why do fridge tomatoes lose flavor?",
        a: "Cold temperatures damage the enzymes that produce tomato flavor compounds. Letting refrigerated tomatoes warm back to room temperature for 30 minutes restores most of the lost flavor.",
      },
      {
        q: "Can you freeze whole tomatoes?",
        a: "Yes. Freeze them whole on a tray, then transfer to a bag. The skin slips off after thawing, and the soft flesh is ideal for cooked uses like sauce, soup, or chili.",
      },
      {
        q: "Are bruised tomatoes safe to eat?",
        a: "Cut around bruised or soft spots and use the rest. If the bruise is accompanied by mold, leaking liquid, or a sour smell, discard the whole tomato.",
      },
    ],
    recipeMatchIngredients: ["tomato"],
    relatedFoods: ["lettuce", "avocado", "bread"],
    sources: [
      {
        label: "USDA FoodKeeper App",
        url: "https://www.foodsafety.gov/keep-food-safe/foodkeeper-app",
      },
      {
        label: "UC Davis Postharvest Technology Center",
        url: "https://postharvest.ucdavis.edu/Commodity_Resources/Fact_Sheets/",
      },
    ],
  },
  {
    slug: "strawberries",
    displayName: "Strawberry",
    pluralDisplayName: "Strawberries",
    category: "produce",
    h1: "How long do strawberries last? And how to stop them from molding overnight.",
    intro:
      "Strawberries spoil fastest of any common fruit. One moldy berry can take down a whole pint in 24 hours. A quick vinegar rinse and the right container can almost double their shelf life.",
    metaDescription:
      "How long strawberries last in the fridge and freezer, how to prevent mold, and the vinegar rinse that extends shelf life by days.",
    imageKey: "strawberry",
    imageAlt: "Ripe strawberries in a basket",
    quickStats: {
      counter: "1-2 days",
      fridge: "5-7 days (unwashed)",
      freezer: "6-8 months",
    },
    shelfLife: [
      {
        condition: "Counter, room temperature",
        duration: "1-2 days",
        note: "Eat or refrigerate quickly. Counter storage invites mold.",
      },
      {
        condition: "Fridge, unwashed in original container",
        duration: "3-5 days",
        note: "Cull any moldy berries daily.",
      },
      {
        condition: "Fridge, after a vinegar rinse and dry",
        duration: "7-10 days",
        note: "The rinse kills mold spores on the surface.",
      },
      {
        condition: "Freezer, washed, dried, single layer then bagged",
        duration: "6-8 months",
        note: "Use directly in smoothies or thaw for compote.",
      },
    ],
    storageTips: [
      "Do not wash strawberries until you are ready to eat them, unless you do the vinegar rinse described next. Moisture invites mold.",
      "For longer storage, soak strawberries in a mix of one part white vinegar to three parts water for five minutes. Drain, rinse with cold water, dry thoroughly on paper towels, and store. The vinegar kills surface mold spores without affecting flavor.",
      "Store the dried berries in a single layer on paper towels inside a breathable container. Stacking them creates pressure points where mold takes hold first.",
      "Inspect daily and remove any berry that shows mold, soft spots, or weeping liquid. Mold spreads to neighboring berries within hours.",
      "To freeze, hull the berries, slice or leave whole, freeze in a single layer on a tray, then transfer to a bag once solid. This prevents them from clumping.",
    ],
    spoilageSigns: [
      "White or gray fuzzy mold on the surface (toss the moldy berries and any touching them).",
      "Mushy, weeping berries that leak liquid into the container.",
      "Dull, dark red color with shriveled or wrinkled skin.",
      "A sour, fermented, or off smell.",
      "Slimy texture on the outside.",
    ],
    faqs: [
      {
        q: "Should you wash strawberries before storing them?",
        a: "Plain water makes them mold faster. A diluted white vinegar rinse (one part vinegar to three parts water, five minutes, dry thoroughly) actually extends shelf life by killing surface mold spores.",
      },
      {
        q: "If one strawberry has mold, are the rest safe to eat?",
        a: "Discard the moldy berry and any berry touching it. Inspect the remaining berries carefully. Mold spreads quickly through soft fruit, so when in doubt, throw it out.",
      },
      {
        q: "Can you freeze strawberries whole?",
        a: "Yes. Hull, wash, dry thoroughly, then freeze on a single-layer tray before bagging. They lose some texture on thaw and are best used in smoothies, baking, or sauces rather than eaten raw.",
      },
      {
        q: "Why do my strawberries go bad so fast?",
        a: "Three main reasons: ambient mold spores on the surface, soft skin that bruises in transit, and condensation in plastic containers. The vinegar rinse plus a paper-towel-lined breathable container fixes all three.",
      },
    ],
    recipeMatchIngredients: ["strawberry", "strawberries", "berries", "berry"],
    relatedFoods: ["banana", "greek-yogurt", "spinach"],
    sources: [
      {
        label: "USDA FoodKeeper App",
        url: "https://www.foodsafety.gov/keep-food-safe/foodkeeper-app",
      },
      {
        label: "UC Davis Postharvest Technology Center",
        url: "https://postharvest.ucdavis.edu/Commodity_Resources/Fact_Sheets/",
      },
    ],
  },
  {
    slug: "salmon",
    displayName: "Salmon",
    category: "seafood",
    h1: "How long does salmon last? And how to tell the difference between fresh and fading.",
    intro:
      "Raw salmon has a short window. Two days in the fridge is the safe upper bound, and the visible signs of spoilage are subtle enough that smell is your best guide.",
    metaDescription:
      "How long raw and cooked salmon last in the fridge and freezer, food safety guidelines, signs of spoilage, and recipes that use it up.",
    imageKey: "salmon",
    imageAlt: "Fresh salmon fillet on parchment paper",
    quickStats: {
      counter: "Not safe (under 2 hours)",
      fridge: "1-2 days (raw) / 3-4 days (cooked)",
      freezer: "2-3 months (best quality)",
    },
    shelfLife: [
      {
        condition: "Counter, room temperature",
        duration: "Under 2 hours",
        note: "Bacteria multiply quickly above 40°F. Do not leave raw salmon out.",
      },
      {
        condition: "Fridge, raw",
        duration: "1-2 days",
        note: "Coldest part of the fridge, sealed.",
      },
      {
        condition: "Fridge, cooked",
        duration: "3-4 days",
        note: "Refrigerate within 2 hours of cooking.",
      },
      {
        condition: "Freezer, raw",
        duration: "2-3 months for best quality",
        note: "Safe indefinitely, but quality declines after 3 months.",
      },
      {
        condition: "Freezer, cooked",
        duration: "2-3 months",
        note: "Wrap airtight to prevent freezer burn.",
      },
    ],
    storageTips: [
      "Store raw salmon in the coldest part of the fridge, typically the bottom shelf at the back. The door is the warmest spot and a poor choice.",
      "If the original packaging is intact, leave it. Otherwise, wrap tightly in plastic wrap or parchment, then in foil, and place on a plate to catch any liquid.",
      "Cook salmon within two days of purchase. If you cannot, freeze it within the first 24 hours, when quality is highest.",
      "Always thaw frozen salmon in the fridge overnight, never on the counter. Counter thawing puts the outer layer in the bacterial growth zone while the inside is still frozen.",
      "Cool cooked salmon to room temperature within an hour before refrigerating. Tightly sealed in a shallow container, it keeps three to four days.",
    ],
    spoilageSigns: [
      "Strong fishy, ammonia, or sour smell (fresh salmon smells faintly of the ocean, never sharp).",
      "Gray or dull color instead of bright pink-orange.",
      "Slimy or sticky surface texture.",
      "Flesh that feels mushy or falls apart at the slightest touch.",
      "Pale, watery liquid pooling in the package.",
    ],
    faqs: [
      {
        q: "How can you tell if raw salmon has gone bad?",
        a: "Smell is the clearest signal. Fresh salmon smells faintly of the ocean. Bad salmon smells sharp, ammonia-like, or sour. Visually, look for gray patches and a slimy surface. If anything seems off, do not taste-test, just discard.",
      },
      {
        q: "Can you eat salmon past the use-by date?",
        a: "Use-by dates on raw fish are tighter than on most foods because seafood spoils quickly. If the salmon smells and looks fresh on the use-by date, it is generally safe to cook that day, but should not be held longer. When in doubt, freeze it instead.",
      },
      {
        q: "Can you refreeze salmon after thawing?",
        a: "If thawed in the fridge and still cold, yes, you can refreeze it within a day or two, with some quality loss. If thawed on the counter or in warm water, do not refreeze.",
      },
      {
        q: "Does salmon spoil faster than other fish?",
        a: "Yes. Salmon's higher fat content makes it more prone to going rancid than lean white fish like cod. Use it sooner or freeze it promptly.",
      },
    ],
    recipeMatchIngredients: ["salmon"],
    relatedFoods: ["chicken-breast", "spinach", "broccoli"],
    sources: [
      {
        label: "USDA FoodKeeper App",
        url: "https://www.foodsafety.gov/keep-food-safe/foodkeeper-app",
      },
      {
        label: "FDA seafood safety guidance",
        url: "https://www.fda.gov/food/buy-store-serve-safe-food/selecting-and-serving-fresh-and-frozen-seafood-safely",
      },
    ],
  },
  {
    slug: "chicken-breast",
    displayName: "Chicken breast",
    pluralDisplayName: "Chicken breasts",
    category: "meat",
    h1: "How long does chicken breast last? And the food safety rules that actually matter.",
    intro:
      "Raw chicken has the shortest fridge window of common proteins. The difference between safe and risky is mostly about temperature, timing, and how you handle the package.",
    metaDescription:
      "Food safety guidelines for raw and cooked chicken breast: fridge and freezer storage times, thawing rules, spoilage signs, and use-it-up recipes.",
    imageKey: "chicken breast",
    imageAlt: "Raw chicken breasts on parchment paper",
    quickStats: {
      counter: "Not safe (under 2 hours)",
      fridge: "1-2 days (raw) / 3-4 days (cooked)",
      freezer: "9 months (raw whole pieces)",
    },
    shelfLife: [
      {
        condition: "Counter, room temperature",
        duration: "Under 2 hours",
        note: "Do not leave raw or cooked chicken out longer than 2 hours.",
      },
      {
        condition: "Fridge, raw",
        duration: "1-2 days",
        note: "Coldest part of the fridge, on a plate to catch any drips.",
      },
      {
        condition: "Fridge, cooked",
        duration: "3-4 days",
        note: "Refrigerate within 2 hours of cooking.",
      },
      {
        condition: "Freezer, raw whole pieces",
        duration: "9 months for best quality",
        note: "Safe indefinitely if kept at 0°F, but quality declines.",
      },
      {
        condition: "Freezer, cooked",
        duration: "2-6 months",
        note: "Wrap airtight to prevent freezer burn.",
      },
    ],
    storageTips: [
      "Store raw chicken on the bottom shelf of the fridge to prevent any drips from contaminating other foods. Keep it in a sealed bag or container on a plate.",
      "Use raw chicken within two days of purchase. If you cannot, freeze it within the first 24 hours for best quality on thaw.",
      "Thaw frozen chicken in the fridge (overnight), in cold water (change every 30 minutes), or in the microwave. Never thaw on the counter, where the outer layer enters the bacterial growth zone.",
      "Cool cooked chicken to room temperature within an hour before refrigerating. Store in shallow containers so it cools through evenly.",
      "Use separate cutting boards or wash thoroughly between raw chicken and any other food, especially produce that will not be cooked.",
    ],
    spoilageSigns: [
      "Gray, green, or unusual color on the surface (fresh chicken is pale pink).",
      "A sour, ammonia-like, or sulfurous smell.",
      "Slimy or sticky texture, even after rinsing.",
      "Liquid in the package that has turned cloudy or strongly smelling.",
      "Fuzzy mold or dark spots on cooked chicken.",
    ],
    faqs: [
      {
        q: "Can you cook chicken directly from frozen?",
        a: "Yes, but cooking time increases by about 50 percent and even cooking is harder. The USDA confirms it is safe as long as the chicken reaches 165°F internal temperature. For best results, thaw in the fridge first.",
      },
      {
        q: "How can you tell if raw chicken has gone bad?",
        a: "Smell is the clearest signal. Fresh chicken has almost no smell. Bad chicken smells sour, sulfurous, or ammonia-like. Sliminess and color changes (gray, green, dull) confirm it. When in doubt, throw it out.",
      },
      {
        q: "How long does cooked chicken last in the fridge?",
        a: "Three to four days if refrigerated within two hours of cooking and stored in an airtight container. After that, freeze any leftovers you have not used.",
      },
      {
        q: "Should you wash raw chicken before cooking?",
        a: "No. The CDC and USDA advise against it. Rinsing chicken sprays bacteria around the sink and onto surrounding surfaces. Cooking to 165°F kills any bacteria far more reliably than rinsing does.",
      },
    ],
    recipeMatchIngredients: ["chicken breast", "chicken"],
    relatedFoods: ["salmon", "broccoli", "cooked-rice"],
    sources: [
      {
        label: "USDA FoodKeeper App",
        url: "https://www.foodsafety.gov/keep-food-safe/foodkeeper-app",
      },
      {
        label: "USDA chicken food safety guidance",
        url: "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/chicken-from-farm-to-table",
      },
    ],
  },
  {
    slug: "eggs",
    displayName: "Egg",
    pluralDisplayName: "Eggs",
    category: "dairy",
    h1: "How long do eggs last? And the float test that beats the printed date.",
    intro:
      "Refrigerated eggs last weeks longer than the carton date suggests. The float test takes ten seconds and tells you exactly where each egg sits on the freshness curve.",
    metaDescription:
      "How long eggs last in the fridge and freezer, how to do the float test, why eggs go in the fridge shelf not the door, and how to freeze eggs for later.",
    imageKey: "eggs",
    imageAlt: "Fresh eggs in a wire basket",
    quickStats: {
      counter: "Not recommended (US-washed eggs)",
      fridge: "3-5 weeks past purchase",
      freezer: "12 months (beaten, not in shell)",
    },
    shelfLife: [
      {
        condition: "Counter, room temperature (US-washed)",
        duration: "Not recommended",
        note: "US commercial eggs are washed, which removes the natural protective coating and requires refrigeration.",
      },
      {
        condition: "Fridge, in original carton, on a shelf",
        duration: "3-5 weeks past purchase",
        note: "USDA confirms safety for 3-5 weeks if continuously refrigerated.",
      },
      {
        condition: "Fridge, in the door",
        duration: "Reduced shelf life",
        note: "Door is the warmest part of the fridge. Avoid for eggs.",
      },
      {
        condition: "Freezer, beaten whole or yolks/whites separated",
        duration: "12 months",
        note: "Use in baking or scrambles after thawing.",
      },
      {
        condition: "Freezer, in the shell",
        duration: "Not safe",
        note: "Shells crack from expansion and the eggs become contaminated.",
      },
    ],
    storageTips: [
      "Store eggs in the original carton on a fridge shelf, not in the door. The shelf is colder and more stable in temperature. The carton protects against absorbing fridge odors.",
      "Do not wash eggs at home, even if they look a little dirty. US commercial eggs are already washed, and adding water can drive bacteria through the porous shell.",
      "If you use eggs in a recipe and have leftover yolks or whites, store them in an airtight container in the fridge for up to 2-4 days, or freeze for longer.",
      "To freeze eggs, beat them lightly and pour into ice cube trays (each cube is about one egg), then transfer to a bag once frozen. Or freeze yolks and whites separately if recipes call for one or the other.",
      "Hard-boiled eggs keep in the fridge for one week, peeled or unpeeled. Store peeled hard-boiled eggs in water if you want to keep them moist.",
    ],
    spoilageSigns: [
      "Float test: in a bowl of water, fresh eggs sink and lie flat, week-old eggs stand on end, bad eggs float.",
      "Sulfur, rotten, or strong off smell when you crack the egg.",
      "Pink, green, or iridescent yolks or whites indicate bacterial contamination.",
      "Cracks, leaks, or sticky residue on the shell.",
      "A loud rattling sound when you shake the egg (very stale).",
    ],
    faqs: [
      {
        q: "How does the float test work?",
        a: "Fill a bowl with cold water and place the egg inside. Fresh eggs sink and lie flat on the bottom. Eggs about 2-3 weeks old sink but stand on end. Bad eggs float to the surface and should be discarded. As eggs age, the air pocket inside grows, making them more buoyant.",
      },
      {
        q: "Can you eat eggs past the printed date?",
        a: "Usually yes. The USDA confirms refrigerated eggs are safe for 3-5 weeks past purchase, often well beyond the printed date. Use the float test to verify before cracking.",
      },
      {
        q: "Why shouldn't eggs go in the fridge door?",
        a: "The door is the warmest part of the fridge and the temperature fluctuates every time you open it. Eggs last longer on a shelf in the middle or back where temperature is more stable.",
      },
      {
        q: "Can you freeze eggs?",
        a: "Yes, but not in the shell. Beat the eggs first, or separate yolks and whites, then freeze in ice cube trays or a freezer bag. Use within 12 months for baking, scrambles, or omelets.",
      },
    ],
    recipeMatchIngredients: ["egg", "eggs"],
    relatedFoods: ["bread", "milk", "cheese"],
    sources: [
      {
        label: "USDA FoodKeeper App",
        url: "https://www.foodsafety.gov/keep-food-safe/foodkeeper-app",
      },
      {
        label: "USDA shell egg food safety",
        url: "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/eggs/shell-eggs-farm-table",
      },
    ],
  },
  {
    slug: "milk",
    displayName: "Milk",
    category: "dairy",
    h1: "How long does milk last? And why the fridge door is the worst place to store it.",
    intro:
      "Milk is more durable than its sell-by date suggests, but only if you store it cold and stable. The fridge door is the most common reason milk turns early.",
    metaDescription:
      "How long milk lasts before and after opening, why the fridge door shortens its life, the difference between sell-by and use-by dates, and how to freeze milk.",
    imageKey: "milk",
    imageAlt: "A glass bottle of milk on a kitchen counter",
    quickStats: {
      counter: "Not safe (under 2 hours)",
      fridge: "Sell-by + 5-7 days (unopened) / 5-7 days (opened)",
      freezer: "3 months",
    },
    shelfLife: [
      {
        condition: "Counter, room temperature",
        duration: "Under 2 hours",
        note: "Milk left out grows bacteria quickly. Refrigerate promptly.",
      },
      {
        condition: "Fridge, unopened, on a shelf",
        duration: "Sell-by + 5-7 days",
        note: "The sell-by date is for the store, not for you. Milk is usually good for a week after.",
      },
      {
        condition: "Fridge, opened",
        duration: "5-7 days",
        note: "Tightly sealed, on a shelf (not the door).",
      },
      {
        condition: "Fridge, in the door",
        duration: "Reduced by 2-3 days",
        note: "The door is the warmest part and temperature fluctuates with every open.",
      },
      {
        condition: "Freezer, sealed container",
        duration: "3 months",
        note: "Leave room for expansion. Texture separates on thaw, but it is fine for baking, coffee, or cooked use.",
      },
    ],
    storageTips: [
      "Store milk on a shelf in the middle or back of the fridge, never in the door. Door temperature fluctuates with every open and can be 5-10°F warmer than the back of the fridge.",
      "Keep milk in its original container, sealed tightly between uses. Pouring into a fancier carafe accelerates spoilage by exposing it to air and possibly bacteria.",
      "Sell-by dates indicate when stores should pull product, not when milk goes bad. Most milk stays fresh for 5-7 days past sell-by if kept cold and unopened.",
      "If you will not use milk fast enough, freeze it before the sell-by date. Pour off about an inch to allow for expansion, freeze, and thaw in the fridge overnight when needed.",
      "Frozen and thawed milk separates and looks watery. Shake or whisk well before using. It works well for baking, coffee, smoothies, and cooked applications, less ideal for drinking straight.",
    ],
    spoilageSigns: [
      "Sour smell when you open the container or pour a glass.",
      "Lumps, clumps, or thickened texture when poured.",
      "Yellow tinge or visible curdling.",
      "Sour or off taste even if it smells fine (taste with a sip; do not drink a glass).",
      "Slimy texture or mold near the cap or rim.",
    ],
    faqs: [
      {
        q: "Is milk safe past the sell-by date?",
        a: "Usually yes. Sell-by dates are for retailers, not consumers. Most milk stays fresh 5-7 days past sell-by if continuously refrigerated below 40°F. Trust the smell test over the printed date.",
      },
      {
        q: "Can you freeze milk?",
        a: "Yes. Pour off about an inch from the container to allow for expansion, then freeze. Thaw in the fridge. Texture separates on thaw and looks slightly watery, but it works fine for baking, cooking, and coffee.",
      },
      {
        q: "Why does milk in the fridge door go bad faster?",
        a: "The door is the warmest part of the fridge and the temperature fluctuates every time you open it. Bacteria multiply faster at higher and unstable temperatures. The back of a middle shelf is the most stable spot.",
      },
      {
        q: "Can you drink milk that has gone slightly sour?",
        a: "Slightly soured milk that smells off should not be consumed straight, but it can still be used in baking (it acts like buttermilk in pancakes, biscuits, and cakes). If it has visible mold or lumps, discard entirely.",
      },
    ],
    recipeMatchIngredients: ["milk"],
    relatedFoods: ["eggs", "greek-yogurt", "cheese"],
    sources: [
      {
        label: "USDA FoodKeeper App",
        url: "https://www.foodsafety.gov/keep-food-safe/foodkeeper-app",
      },
      {
        label: "USDA dairy food safety",
        url: "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/dairy-products",
      },
    ],
  },
  {
    slug: "greek-yogurt",
    displayName: "Greek yogurt",
    category: "dairy",
    h1: "How long does Greek yogurt last? And why the watery liquid on top is a good sign.",
    intro:
      "Yogurt is one of the longer-lasting dairy products in your fridge. The watery layer that gathers on top is not spoilage. It is whey, and it means your yogurt is doing exactly what it should.",
    metaDescription:
      "How long Greek yogurt lasts before and after opening, why the watery whey on top is normal, freezer tips, and how to tell when it has actually gone bad.",
    imageKey: "yogurt",
    imageAlt: "A bowl of Greek yogurt topped with berries",
    quickStats: {
      counter: "Not safe (under 2 hours)",
      fridge: "Sell-by + 1-2 weeks (unopened) / 5-7 days (opened)",
      freezer: "1-2 months (texture changes)",
    },
    shelfLife: [
      {
        condition: "Counter, room temperature",
        duration: "Under 2 hours",
        note: "Live cultures notwithstanding, leaving yogurt out invites unwanted bacteria.",
      },
      {
        condition: "Fridge, unopened, on a shelf",
        duration: "Sell-by + 1-2 weeks",
        note: "Sealed yogurt holds well past the printed date.",
      },
      {
        condition: "Fridge, opened",
        duration: "5-7 days",
        note: "Sealed tightly, on a shelf (not the door).",
      },
      {
        condition: "Freezer, sealed",
        duration: "1-2 months",
        note: "Texture turns grainy on thaw. Use for smoothies or baking.",
      },
    ],
    storageTips: [
      "Store yogurt on a fridge shelf, not in the door. Like milk, yogurt keeps longer at stable, cold temperatures away from the door's temperature swings.",
      "Keep yogurt in its original container. Decanting introduces air and bacteria. Seal tightly after each use.",
      "The watery liquid on top is whey, a natural part of yogurt. You can stir it in for more creaminess, or pour it off if you prefer a thicker texture. It is not a sign of spoilage.",
      "Sell-by dates are for retailers. Sealed Greek yogurt typically stays fresh one to two weeks past the sell-by date. Trust your senses over the printed date.",
      "To freeze, leave the container sealed (with a little room for expansion if it is full) and use within two months. Texture grains on thaw, so frozen-then-thawed yogurt is best for smoothies, baking, or marinades.",
    ],
    spoilageSigns: [
      "Mold on the surface or under the lid (any color, fuzzy or otherwise).",
      "Pink, yellow, or green discoloration in the yogurt itself.",
      "A strong sour, rancid, or off smell beyond the normal tang.",
      "Bloated container or popping seal when opened (indicates fermentation by unwanted bacteria).",
      "A slimy or stringy texture when stirred.",
    ],
    faqs: [
      {
        q: "Is the watery liquid on top of yogurt safe to eat?",
        a: "Yes. It is whey, the protein-rich liquid that naturally separates from yogurt. Stir it back in for creaminess, or pour it off for a thicker texture. Some people drink the whey on its own.",
      },
      {
        q: "Can you eat Greek yogurt past the expiration date?",
        a: "Often yes, especially if unopened. Sealed Greek yogurt typically stays fresh one to two weeks past sell-by. Open the container, check for mold or off smell, and trust the sniff test over the date.",
      },
      {
        q: "Can you freeze Greek yogurt?",
        a: "Yes, but the texture grains and becomes less smooth on thaw. Frozen-then-thawed yogurt works well for smoothies, baking, and marinades, but is less appealing eaten by the spoonful.",
      },
      {
        q: "Why does my yogurt taste more sour over time?",
        a: "The live cultures continue producing lactic acid even in the fridge, so yogurt gradually becomes tangier. Increased sourness alone is not spoilage. Look for mold, off color, or bloating to confirm if it has gone bad.",
      },
    ],
    recipeMatchIngredients: ["yogurt"],
    relatedFoods: ["milk", "strawberries", "eggs"],
    sources: [
      {
        label: "USDA FoodKeeper App",
        url: "https://www.foodsafety.gov/keep-food-safe/foodkeeper-app",
      },
      {
        label: "International Dairy Foods Association",
        url: "https://www.idfa.org/yogurt",
      },
    ],
  },
  {
    slug: "cheese",
    displayName: "Cheese",
    category: "dairy",
    h1: "How long does cheese last? And when mold means cut around it versus toss it.",
    intro:
      "Cheese is one of the longest-keeping dairy products if stored right, but mold rules vary dramatically between hard and soft varieties. The wrong call can mean food poisoning or a wasted block of cheddar.",
    metaDescription:
      "How long different cheeses last in the fridge and freezer, when mold is fine to cut around and when it means toss the whole block, plus how to wrap cheese properly.",
    imageKey: "cheese",
    imageAlt: "A wedge of aged cheese on a wooden board",
    quickStats: {
      counter: "Hard: a few hours / Soft: not safe",
      fridge: "3-4 weeks (hard, sealed) / 1-2 weeks (soft)",
      freezer: "6 months (hard, for cooking)",
    },
    shelfLife: [
      {
        condition: "Fridge, hard cheese unopened (cheddar, parmesan, gouda)",
        duration: "Sell-by + 3-4 weeks",
        note: "Vacuum-sealed blocks last longer.",
      },
      {
        condition: "Fridge, hard cheese opened",
        duration: "3-4 weeks",
        note: "Wrap in parchment, then loosely in plastic.",
      },
      {
        condition: "Fridge, soft cheese (brie, fresh mozzarella, feta)",
        duration: "1-2 weeks",
        note: "Once opened, use within a week.",
      },
      {
        condition: "Fridge, shredded cheese opened",
        duration: "5-7 days",
        note: "Higher surface area means faster mold growth.",
      },
      {
        condition: "Freezer, hard cheese",
        duration: "6 months",
        note: "Texture crumbles slightly on thaw. Best used in cooked dishes.",
      },
    ],
    storageTips: [
      "Wrap hard cheese in parchment or wax paper first, then loosely in plastic wrap or a reusable beeswax wrap. Parchment lets the cheese breathe; plastic alone traps moisture and accelerates mold.",
      "Store soft cheeses (brie, fresh mozzarella, feta, ricotta) in their original packaging if possible. Once opened, transfer to an airtight container.",
      "Keep cheese in the warmest part of the fridge, typically the bottom shelf or cheese drawer. Very cold storage dries cheese out and can dull flavor.",
      "If you see condensation building inside the wrap, replace the wrap. Moisture trapped against the cheese is the leading cause of premature mold.",
      "To freeze, slice or shred hard cheese first, then freeze in airtight portions. Frozen-then-thawed cheese works best in cooked dishes (pizza, casseroles, mac and cheese) rather than on a board.",
    ],
    spoilageSigns: [
      "On hard cheese: mold on the surface, which can usually be cut away with a one-inch margin around it.",
      "On soft cheese: mold anywhere is a sign to discard the whole package, because the moisture lets mold spread invisibly.",
      "A strong ammonia or rancid smell (some cheeses naturally smell strong; rancid is sharper and unpleasant).",
      "Slimy, sticky surface texture not present when fresh.",
      "Off-color patches: pink, gray, or unusual yellow areas that were not there before.",
    ],
    faqs: [
      {
        q: "Can you cut mold off cheese and eat the rest?",
        a: "On firm and hard cheeses (cheddar, parmesan, gouda, swiss), yes. Cut at least one inch around and below the mold. On soft cheeses (brie, ricotta, fresh mozzarella, cottage cheese), no. The high moisture content lets mold spread invisibly through the entire product.",
      },
      {
        q: "Can you freeze cheese?",
        a: "Yes, especially hard cheeses for cooking. Shred or slice first, freeze in airtight portions, and use within six months. Texture becomes crumbly on thaw, so frozen-then-thawed cheese is best in melted applications.",
      },
      {
        q: "How do you store cheese to keep it from getting moldy?",
        a: "Wrap in parchment paper first, then loosely in plastic or a beeswax wrap. The parchment lets the cheese breathe; plastic alone traps moisture and feeds mold. Replace the wrap if condensation builds up.",
      },
      {
        q: "Why does my cheese sweat or have liquid drops on it?",
        a: "Condensation. The cheese was either wrapped too warm or moved quickly between cold and warm. Wipe off the moisture, replace the wrap, and store in a stable cold spot. Excess moisture leads to mold within days.",
      },
    ],
    recipeMatchIngredients: ["cheese", "cheddar", "feta", "parmesan"],
    relatedFoods: ["milk", "bread", "eggs"],
    sources: [
      {
        label: "USDA FoodKeeper App",
        url: "https://www.foodsafety.gov/keep-food-safe/foodkeeper-app",
      },
      {
        label: "USDA Ask Karen on moldy cheese",
        url: "https://ask.usda.gov/s/article/Are-molds-on-cheese-dangerous",
      },
    ],
  },
  {
    slug: "bread",
    displayName: "Bread",
    category: "bakery",
    h1: "How long does bread last? And why the fridge makes it go stale faster.",
    intro:
      "Bread storage is mostly counterintuitive. The fridge actually accelerates staling. The freezer is the right answer for anything longer than a few days, and visible mold means the whole loaf goes.",
    metaDescription:
      "How long bread lasts on the counter, in the fridge, and in the freezer. Why the fridge is the wrong storage choice, the right way to revive stale bread, and when mold means discard the whole loaf.",
    imageKey: "bread",
    imageAlt: "A sliced loaf of crusty bread",
    quickStats: {
      counter: "2-4 days",
      fridge: "Not recommended (stales faster)",
      freezer: "3 months",
    },
    shelfLife: [
      {
        condition: "Counter, paper bag (crusty bread)",
        duration: "2-3 days",
        note: "Paper keeps crust crisp but allows the inside to dry slowly.",
      },
      {
        condition: "Counter, plastic bag or bread box (soft sandwich bread)",
        duration: "5-7 days",
        note: "Sealed plastic holds moisture but speeds mold in humid conditions.",
      },
      {
        condition: "Fridge",
        duration: "7-14 days",
        note: "Technically lasts longer, but stales 2-3x faster than the counter. Not recommended.",
      },
      {
        condition: "Freezer, sliced and double-wrapped",
        duration: "3 months",
        note: "Toast slices directly from frozen.",
      },
      {
        condition: "Freezer, whole loaf wrapped",
        duration: "3 months",
        note: "Thaw at room temperature for an hour before slicing.",
      },
    ],
    storageTips: [
      "Store bread at room temperature for the first few days. The fridge is a trap: cold temperatures speed up the retrogradation of starches, which is the chemistry behind staling.",
      "For crusty artisan loaves, use a paper bag or bread box to keep the crust crisp. Plastic softens the crust and the bread loses its appeal.",
      "For soft sandwich bread, the original plastic bag or a sealed bread box works. The trade-off is faster mold growth in warm or humid kitchens.",
      "For anything you will not eat within two to three days, freeze. Slice the loaf first if possible, then wrap tightly in plastic and a layer of foil or place in a freezer bag with air pressed out.",
      "Revive day-old stale bread by sprinkling lightly with water and warming in a 350°F oven for five to ten minutes. The moisture and heat reverse some of the staling.",
    ],
    spoilageSigns: [
      "Visible mold of any color on the surface of the loaf or slices (discard the entire loaf, do not just cut around it).",
      "An off, sour, or musty smell that was not there originally.",
      "Slimy patches on the crust or crumb.",
      "Very hard, rock-like texture that does not soften after warming (this is staleness, not spoilage, but past usability for sandwiches).",
      "Discolored spots (greenish, yellow, dark) that are not part of the original bread.",
    ],
    faqs: [
      {
        q: "Why does the fridge make bread stale faster?",
        a: "Cold temperatures around 35-40°F accelerate starch retrogradation, the molecular process that makes bread go stale. Bread stales 2-3 times faster in the fridge than at room temperature. The freezer is so cold it stops the process entirely, which is why freezing works but refrigerating does not.",
      },
      {
        q: "Can you cut mold off bread and eat the rest?",
        a: "No. Unlike cheese, bread has a porous and moist structure that lets mold spores spread invisibly through the entire loaf. If you see mold on one slice, mold has likely spread throughout. Discard the whole loaf.",
      },
      {
        q: "How do you revive stale bread?",
        a: "Sprinkle the crust lightly with water and place in a 350°F oven for 5-10 minutes. The water turns to steam and the heat partly reverses staling. Best for crusty loaves; less effective on sandwich bread.",
      },
      {
        q: "Can you freeze bread for sandwiches?",
        a: "Yes. Slice first, wrap tightly, and freeze. Pull out slices as needed and let them thaw at room temperature for 20 minutes, or toast directly from frozen.",
      },
    ],
    recipeMatchIngredients: ["bread"],
    relatedFoods: ["eggs", "cheese", "banana"],
    sources: [
      {
        label: "USDA FoodKeeper App",
        url: "https://www.foodsafety.gov/keep-food-safe/foodkeeper-app",
      },
      {
        label: "USDA Ask Karen on moldy bread",
        url: "https://ask.usda.gov/s/article/Can-you-cut-the-mold-off-and-eat-the-remaining-bread",
      },
    ],
  },
  {
    slug: "cooked-rice",
    displayName: "Cooked rice",
    category: "grains",
    h1: "How long does cooked rice last? And the food safety reason it deserves more attention.",
    intro:
      "Leftover rice is not casual food safety. Bacillus cereus, a heat-resistant bacterium common on rice, produces toxins at room temperature that survive reheating. Cool fast, refrigerate fast, reheat hot.",
    metaDescription:
      "How long cooked rice lasts in the fridge and freezer, why the Bacillus cereus risk makes it special, how to cool it quickly, and how to reheat leftovers safely.",
    imageKey: "rice",
    imageAlt: "A bowl of steamed white rice",
    quickStats: {
      counter: "Under 1 hour (food safety critical)",
      fridge: "3-6 days",
      freezer: "6 months",
    },
    shelfLife: [
      {
        condition: "Counter, room temperature",
        duration: "Under 1 hour",
        note: "Bacillus cereus toxins form at room temperature. Refrigerate within an hour.",
      },
      {
        condition: "Fridge, airtight container",
        duration: "3-6 days",
        note: "Spread thinly to cool quickly before sealing.",
      },
      {
        condition: "Freezer, sealed portions",
        duration: "6 months",
        note: "Freeze flat in bags for quick reheating.",
      },
    ],
    storageTips: [
      "Cool cooked rice as quickly as possible after serving. Spread it in a thin layer on a baking sheet, or divide into shallow containers. The faster it cools, the less time Bacillus cereus has to grow.",
      "Refrigerate within one hour of cooking, ideally within 30 minutes. Rice is one of the highest-risk foods for room-temperature bacterial growth.",
      "Store in airtight containers in the fridge for three to six days. Beyond that, the quality drops sharply and food safety concerns rise.",
      "Reheat rice thoroughly until steaming hot throughout, at least 165°F internal temperature. Reheating to lukewarm does not kill toxins.",
      "Only reheat rice once. Repeat heating-cooling cycles grow bacterial populations and the toxins they leave behind survive subsequent reheats.",
    ],
    spoilageSigns: [
      "Dry, hard, or crusty texture that does not soften with reheating.",
      "Sour, fermented, or off smell when you open the container.",
      "Watery liquid pooling at the bottom of the container.",
      "Fuzzy spots, slime, or discoloration on the surface.",
      "Any unusual taste even if it looks fine (the toxins are tasteless, so dispose if anything seems off rather than risk it).",
    ],
    faqs: [
      {
        q: "Why is leftover rice considered a food safety risk?",
        a: "Bacillus cereus, a bacterium that survives cooking as spores on raw rice, multiplies and produces toxins when cooked rice sits at room temperature. Those toxins are heat-resistant, meaning reheating does not destroy them. Cool fast, refrigerate fast, and reheat thoroughly is the rule.",
      },
      {
        q: "Can you eat rice that has been in the fridge for a week?",
        a: "Not safely. Cooked rice keeps three to six days in the fridge, with three to four days being the comfortable zone. Past that, the bacterial population grows beyond what most people should risk. Freeze it earlier instead.",
      },
      {
        q: "Can you reheat rice in the microwave?",
        a: "Yes, but reheat until steaming hot throughout, not just warm. Stir halfway through to avoid cold spots. Reheat only once, and never reheat rice that has been sitting out at room temperature for more than an hour.",
      },
      {
        q: "How do you freeze cooked rice?",
        a: "Cool quickly, then portion into freezer bags. Flatten the bags so the rice freezes thin and reheats fast. Use within six months. Reheat directly from frozen in the microwave with a splash of water, or thaw briefly in hot water for stir fry.",
      },
    ],
    recipeMatchIngredients: ["rice"],
    relatedFoods: ["chicken-breast", "salmon", "broccoli"],
    sources: [
      {
        label: "USDA FoodKeeper App",
        url: "https://www.foodsafety.gov/keep-food-safe/foodkeeper-app",
      },
      {
        label: "UK NHS guidance on Bacillus cereus and reheated rice",
        url: "https://www.nhs.uk/conditions/food-poisoning/",
      },
    ],
  },
];

foods.push(...moreFoods);

export function getFoodBySlug(slug: string): FoodPageData | undefined {
  return foods.find((f) => f.slug === slug);
}

export function getAllFoodSlugs(): string[] {
  return foods.map((f) => f.slug);
}

export function getRelatedFoods(slug: string): FoodPageData[] {
  const food = getFoodBySlug(slug);
  if (!food) return [];
  return food.relatedFoods
    .map((relatedSlug) => getFoodBySlug(relatedSlug))
    .filter((f): f is FoodPageData => f !== undefined);
}
