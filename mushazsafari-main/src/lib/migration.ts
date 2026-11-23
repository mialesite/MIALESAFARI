export type MigrationPhase = "calving" | "westward" | "crossing" | "return";

export type MigrationMonth = {
  index: number;
  short: string;
  name: string;
  phase: MigrationPhase;
  title: string;
  location: string;
  blurb: string;
  signals: [string, string, string];
  crossings: ("mara" | "grumeti")[];
};

export const PHASE_LABEL: Record<MigrationPhase, string> = {
  calving: "Calving season",
  westward: "Heading west",
  crossing: "River crossings",
  return: "Moving south",
};

export const PHASE_COLOUR: Record<MigrationPhase, string> = {
  calving: "#C4633F",
  westward: "#B68D40",
  crossing: "#4E7C74",
  return: "#8FA98C",
};

export const CROSSING_LABEL = {
  mara: "Mara River crossing",
  grumeti: "Grumeti River crossing",
} as const;

export const PHASE_LABEL_SW: Record<MigrationPhase, string> = {
  calving: "Msimu wa kuzaa",
  westward: "Kuelekea magharibi",
  crossing: "Kuvuka mito",
  return: "Kuelekea kusini",
};

export const CROSSING_LABEL_SW = {
  mara: "Kuvuka Mto Mara",
  grumeti: "Kuvuka Mto Grumeti",
} as const;

export type MigrationMonthSw = {
  short: string;
  name: string;
  title: string;
  location: string;
  blurb: string;
  signals: [string, string, string];
};

/**
 * Kiswahili text for the twelve migration months, keyed by month index.
 * The English array above stays the source of truth for structure and phasing.
 */
export const MONTHS_SW: Record<number, MigrationMonthSw> = {
  0: {
    short: "Jan",
    name: "Januari",
    title: "Nyika za nyasi fupi kusini mashariki",
    location: "Ndutu na Serengeti ya kusini",
    blurb: "Mvua zimekwisha na nyasi ni fupi. Makundi yametulia kwenye nyika za kusini na kuzaa kunaanza, wiki chache kabla ya kilele.",
    signals: ["Ndama wa kwanza kwenye nyika wazi", "Wanyama wawindaji wamenea kusini", "Mbingu wazi, jua kali ya mchana"],
  },
  1: {
    short: "Feb",
    name: "Februari",
    title: "Ndutu, Rotima na nyika za Gol",
    location: "Nyika za kusini na ukingo wa Ngorongoro",
    blurb: "Kuzaa kufika kilele; karibu kila ndama huzaliwa ndani ya wiki mbili. Makundi yakitulia mahali pamoja, wanyama wawindaji wakubwa huwinda wazi mchana kutwa.",
    signals: ["Wingi mkubwa wa kuzaa kwa mwaka", "Duma nyika wazi, simba chini ya migunga", "Safari za usiku kwenye udongo uliobanwa"],
  },
  2: {
    short: "Mac",
    name: "Machi",
    title: "Nyika zinaanza kuachwa",
    location: "Serengeti kusini mashariki, kupitia njia ya Duwe",
    blurb: "Mvua za masika zinaanza na ndama wana nguvu ya kutembea. Makundi yaondoka taratibu nyika za kusini yakaengea nyasi za magharibi.",
    signals: ["Majani mapya yanawaka nyikani", "Ndama wadogo wanaanza safari yao ya kwanza", "Msimu wa utulivu kwa safari za uhamiaji"],
  },
  3: {
    short: "Apr",
    name: "Aprili",
    title: "Masika, makundi magharibi",
    location: "Sasumya na Ikoroni, Serengeti ya magharibi",
    blurb: "Mvua inasukuma makundi kupita nyasi za magharibi kuelekea Grumeti. Mito inaongezeka maji, njia zingine hulainika, na hifadhi hazina magari karibu yote.",
    signals: ["Msimu bora wa picha za majani mabichi", "Maporomoko ya maji na mabonde yamejaa maji", "Wageni wachache zaidi kwa mwaka"],
  },
  4: {
    short: "Mei",
    name: "Mei",
    title: "Kukusanyika kando ya Grumeti",
    location: "Grumeti na Ikoroge, uwanda wa magharibi",
    blurb: "Makundi yakusanyika kando ya Mto Grumeti kabla ya kusogea kaskazini. Mamba wanashikamana na vichochoro chini ya maporomoko, na kuvuka kunaanza kwa kweli.",
    signals: ["Kuvuka Grumeti kunaanza", "Makundi mengi mstari wa mto", "Mito bado ya juu kutokana na masika"],
  },
  5: {
    short: "Jun",
    name: "Juni",
    title: "Kaskazini kupitia uwanda wa magharibi",
    location: "Morukuru na uwanda kaskazini mwa Grumeti",
    blurb: "Huku wamevuka, makundi husogea kaskazini katika mstari mrefu. Kiangazi kinaanza na misitu kuanza kutanua.",
    signals: ["Kambi za uwanda zikiwa bora zaidi", "Kuzaa cha pili njiani", "Vumbi vya kwanza vya kiangazi"],
  },
  6: {
    short: "Jul",
    name: "Julai",
    title: "Kugeukia Maasai Mara",
    location: "Seronera hadi Lobo, Serengeti kaskazini",
    blurb: "Mstari unafika kaskazini. Makundi ya kwanza yanajaribu Mto Mara, na ukingo wa Kogatende unajaa wanyama na wanyama wawindaji.",
    signals: ["Kuvuka Mara kunaanza, muda unategemea ngazi ya maji", "Wawindaji wakubwa misitu ya kaskazini", "Asubuhi za baridi, mchana wa joto"],
  },
  7: {
    short: "Ago",
    name: "Agosti",
    title: "Kipindi cha kuvuka kikamilifu",
    location: "Kogatende, Mto Mara na ndani ya Maasai Mara",
    blurb: "Kuvuka mito ndiyo tukio la kupigiwa kelele zaidi kwenye kalenda. Makundi yakusanyika kwenye pwani, yasitee, yakusanyika tena, kisha kukimbia. Siku nyingi wanyama husogea mara mbili.",
    signals: ["Kuvuka Mara kila siku", "Mamba na kiboko kwenye kila kizingiti", "Msimu wa kilele, panga kaskazini mapema"],
  },
  8: {
    short: "Sep",
    name: "Septemba",
    title: "Nyasi za kaskazini",
    location: "Serengeti kaskazini na nyika za Mara",
    blurb: "Makundi yamenea kote kaskazini kulisha badala ya kusogea. Kuvuka kunaendelea pande zote mbili za mpaka wakati nyasi inadumu.",
    signals: ["Kuvuka mito bado kunaendelea", "Chui bora kwenye misitu ya Lagaja", "Kavu, joto na wazi kabisa"],
  },
  9: {
    short: "Okt",
    name: "Oktoba",
    title: "Kugeuka kuelekea kusini",
    location: "Lobo na Seronera, Serengeti katikati",
    blurb: "Kaskazini imeishiwa na nyasi na mvua bado ni wiki mbilinga; makundi yanaanza kurudi kusini kupitia Serengeti katikati.",
    signals: ["Makundi mabonde ya Seronera", "Mito ya Seronera inapungua maji", "Kambi tupu kabla ya mvua vuli"],
  },
  10: {
    short: "Nov",
    name: "Novemba",
    title: "Vuli vinaleta makundi nyumbani",
    location: "Sininja na Serengeti ya kusini",
    blurb: "Mvua vuli vinaanza na kuvuta uhamiaji sehemu iliyobaki ya njia ya kusini. Mwanga wa dhoruba juu ya miamba ya kopje, na nyasi kuiwaka kijani ndani ya siku chache.",
    signals: ["Mvua vuli, kwa kawaida dhoruba za mchana", "Makundi husogea kwa kasi kwenye nyasi mpya", "Ndege zinarudi kwa wingi"],
  },
  11: {
    short: "Des",
    name: "Desemba",
    title: "Kurudi nyikani",
    location: "Ndutu na nyika za kusini",
    blurb: "Mzunguko unakamilika. Makundi yamo tena kwenye nyasi fupi za kusini mashariki, ndama wa kwanza wanafika, na mzunguko mzima unaanza tena.",
    signals: ["Kuzaa kunaanza tena", "Nyika za kijani na wawindaji wakusanyika", "Wiki za Krismasi na Mwaka Mpya zina watu wengi"],
  },
};

/**
 * The loop the herds work through between the Serengeti and the Maasai Mara.
 * Positions are indicative: the rain decides the timing, not the calendar.
 */
export const MIGRATION_MONTHS: MigrationMonth[] = [
  {
    index: 0,
    short: "Jan",
    name: "January",
    phase: "calving",
    title: "Short-grass plains of the south east",
    location: "Ndutu and the southern Serengeti",
    blurb: "The rains are done and the grass is short. The herds settle on the southern plains and the first calving begins, a few weeks ahead of the peak.",
    signals: ["First calves on the open plains", "Predators spread thin across the south", "Clear skies, hard midday light"],
    crossings: [],
  },
  {
    index: 1,
    short: "Feb",
    name: "February",
    phase: "calving",
    title: "Ndutu, Rotima and the Gol plains",
    location: "Southern plains and the Ngorongoro highlands edge",
    blurb: "Calving reaches its peak and almost every calf is dropped inside a fortnight. With the herds standing still, the big cats hunt in the open all day.",
    signals: ["Highest calving density of the year", "Cheetah on the open plains, lions in the acacia", "Night drives on hard packed ground"],
    crossings: [],
  },  {
    index: 2,
    short: "Mar",
    name: "March",
    phase: "calving",
    title: "The plains start to empty",
    location: "South east Serengeti, towards the Duwe corridor",
    blurb: "The long rains arrive and the calves are strong enough to walk. The herds drift off the southern plains and turn towards the western grass.",
    signals: ["Green flush on the plains", "Young calves moving for the first time", "Migration safaris at their quietest"],
    crossings: [],
  },
  {
    index: 3,
    short: "Apr",
    name: "April",
    phase: "westward",
    title: "Long rains, herds in the west",
    location: "Sasumya and the Ikoroni, western Serengeti",
    blurb: "Rain pushes the herds across the western grass toward the Grumeti. Rivers rise, some tracks soften, and the parks are almost empty of vehicles.",
    signals: ["Peak green season photography", "Waterfalls and flooded valleys", "Lowest visitor numbers of the year"],
    crossings: ["grumeti"],
  },
  {
    index: 4,
    short: "May",
    name: "May",
    phase: "westward",
    title: "Gathering on the Grumeti",
    location: "Grumeti and Ikoroge, Western Corridor",
    blurb: "The herds mass along the Grumeti River before they push north. Crocodiles hold the pools below the falls, and the crossings begin in earnest.",
    signals: ["Grumeti crossings open", "Dense herd concentrations on the river line", "Rivers still high from the long rains"],
    crossings: ["grumeti"],
  },
  {
    index: 5,
    short: "Jun",
    name: "June",
    phase: "crossing",
    title: "North through the Western Corridor",
    location: "Morukuru and the corridor north of the Grumeti",
    blurb: "Having crossed, the herds work north through the corridor in a long column. Dry season starts and the woodlands begin to open out.",
    signals: ["Corridor camps at their best", "Second calving on the move", "First dry season dust in the air"],
    crossings: ["grumeti"],
  },
  {
    index: 6,
    short: "Jul",
    name: "July",
    phase: "crossing",
    title: "The turn towards the Mara",
    location: "Seronera up through Lobo, northern Serengeti",
    blurb: "The column reaches the north. The first herds test the Mara River, and the Kogatende end of the park fills with animals and predators.",
    signals: ["Mara crossings begin, timing varies by water level", "Big cat activity in the northern woodlands", "Cold mornings, hot afternoons"],
    crossings: ["mara"],
  },
  {
    index: 7,
    short: "Aug",
    name: "August",
    phase: "crossing",
    title: "Crossing season in full",
    location: "Kogatende, the Mara River and beyond into the Maasai Mara",
    blurb: "The river crossings are the loudest event in the calendar. Herds gather on the banks, refuse, gather again, then run. Most days the animals are on the move twice.",
    signals: ["Daily Mara crossings", "Crocodile and hippo pressure at every pool", "Peak season, book the north well ahead"],
    crossings: ["mara"],
  },
  {
    index: 8,
    short: "Sep",
    name: "September",
    phase: "crossing",
    title: "Grazing the north",
    location: "Northern Serengeti and the Mara plains",
    blurb: "The herds spread across the north to graze rather than march. Crossings continue on both sides of the border while the grass holds.",
    signals: ["River crossings still running", "Best leopard sightings in the Lagaja woodlands", "Dry, hot and very clear"],
    crossings: ["mara"],
  },
  {
    index: 9,
    short: "Oct",
    name: "October",
    phase: "return",
    title: "The turn south",
    location: "Lobo and Seronera, central Serengeti",
    blurb: "With the north grazed out and the rains still weeks away, the herds begin to filter back south through the central Serengeti.",
    signals: ["Herds spread across the Seronera valleys", "Seronera rivers running low", "Empty camps before the short rains"],
    crossings: ["mara"],
  },
  {
    index: 10,
    short: "Nov",
    name: "November",
    phase: "return",
    title: "Short rains bring the herds home",
    location: "Sininja and the southern Serengeti",
    blurb: "The short rains start and pull the migration the rest of the way south. Storm light over the kopjes, and the grass greens within days.",
    signals: ["Short rains, usually afternoon storms", "Herds moving fast on fresh grass", "Bird life returns in numbers"],
    crossings: [],
  },
  {
    index: 11,
    short: "Dec",
    name: "December",
    phase: "calving",
    title: "Back on the plains",
    location: "Ndutu and the southern plains",
    blurb: "The loop closes. The herds are back on the short grass of the south east, the first calves arrive, and the whole cycle starts again.",
    signals: ["Calving begins again", "Green plains and predator concentration", "Christmas and New Year weeks are busy"],
    crossings: [],
  },
];
