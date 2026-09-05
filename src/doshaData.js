// Prakriti (mind-body constitution) assessment data.
// Each section holds rows; each row offers one option per dosha.
// id must be unique across the whole assessment.
//
// IMPORTANT: sections / doshas / totalQuestions below are the original,
// unmodified questionnaire and scoring structure — do not alter row ids,
// or previously saved answers (keyed by id) will silently reset.

export const doshas = {
  vata: { name: 'Vata', tag: 'Movement', symbol: '𓆃', element: 'Air & Ether' },
  pitta: { name: 'Pitta', tag: 'Transformation', symbol: '𓂀', element: 'Fire & Water' },
  kapha: { name: 'Kapha', tag: 'Structure', symbol: '𓇢', element: 'Earth & Water' }
};

// ---------------------------------------------------------------------------
// Ayurvedic Shloka Library — curated, subject-based, sourced from classical
// Samhitas. Every "verse" entry carries verbatim Sanskrit that is among the
// most consistently and widely attested in Ayurvedic literature, together
// with its exact classical citation (sthana / adhyaya / verse). Where a
// verse could not be verified to that standard, the entry is marked as a
// "principle" — a citation-backed educational summary of the classical
// teaching rather than a purported direct quotation — so that nothing here
// is presented as scripture that isn't.
// ---------------------------------------------------------------------------

export const shlokaLibrary = {
  swastha: {
    type: 'verse',
    category: 'Swastha · Definition of Health',
    sanskrit: 'समदोषः समाग्निश्च समधातुमलक्रियः ।\nप्रसन्नात्मेन्द्रियमनाः स्वस्थ इत्यभिधीयते ॥',
    iast: 'sama-doṣaḥ sama-agniś ca sama-dhātu-mala-kriyaḥ,\nprasanna-ātma-indriya-manāḥ svastha ity abhidhīyate.',
    hindi: 'जिसके त्रिदोष, अग्नि (पाचन शक्ति) और धातुएँ सम अवस्था में हों, मल-क्रियाएँ नियमित हों, तथा जिसकी आत्मा, इन्द्रियाँ और मन प्रसन्न हों — उसे ही ‘स्वस्थ’ कहा जाता है।',
    english: 'One whose doshas, digestive fire and bodily tissues are in balance, whose elimination of wastes is regular, and whose self, senses and mind remain content — is called healthy.',
    source: 'Suśruta Saṃhitā, Sūtrasthāna, Ch. 15 (Doṣadhātumalakṣayavṛddhi Vijñānīya Adhyāya), verse 41',
    text: 'Suśruta Saṃhitā'
  },
  ahara: {
    type: 'verse',
    category: 'Āhāra · Food as a Pillar of Life',
    sanskrit: 'आहारः स्वप्नो ब्रह्मचर्यमिति त्रय उपस्तम्भाः ।',
    iast: 'āhāraḥ svapno brahmacaryam iti traya upastambhāḥ.',
    hindi: 'आहार (भोजन), स्वप्न (निद्रा) और ब्रह्मचर्य (संयमित आचरण) — ये तीन शरीर के उपस्तम्भ (आधार-स्तम्भ) कहे गए हैं, जिन पर जीवन टिका है।',
    english: 'Food, sleep, and disciplined conduct (brahmacharya) — these are the three sub-pillars that support and sustain the body.',
    source: 'Caraka Saṃhitā, Sūtrasthāna, Ch. 11 (Tistraiṣaṇīya Adhyāya), verse 35',
    text: 'Caraka Saṃhitā'
  },
  dinacharya: {
    type: 'verse',
    category: 'Dinacharya · The Daily Round',
    sanskrit: 'ब्राह्मे मुहूर्ते उत्तिष्ठेत् स्वस्थो रक्षार्थम् आयुषः ।',
    iast: 'brāhme muhūrte uttiṣṭhet svastho rakṣārtham āyuṣaḥ.',
    hindi: 'स्वस्थ व्यक्ति को अपनी आयु की रक्षा के लिए ब्रह्म मुहूर्त में — अर्थात् सूर्योदय से पूर्व के अंतिम प्रहर में — जाग जाना चाहिए।',
    english: 'A healthy person should rise during Brahma-muhūrta — the last watch of the night, before sunrise — in order to safeguard the span of life.',
    source: 'Vāgbhaṭa, Aṣṭāṅga Hṛdaya, Sūtrasthāna, Ch. 2 (Dinacaryā Adhyāya), verse 1',
    text: 'Aṣṭāṅga Hṛdaya'
  },
  viruddhaAhara: {
    type: 'principle',
    category: 'Viruddha Āhāra · Incompatible Combinations',
    hindi: 'आचार्य चरक ने देश, काल, अग्नि, मात्रा, संस्कार, वीर्य (शीत-उष्ण), संयोग तथा सेवनक्रम जैसे अनेक आधारों पर ‘विरुद्ध आहार’ अर्थात् परस्पर असंगत भोजन-संयोजनों का वर्णन किया है। शरीर की सप्तधातुओं की गुणवत्ता को बिगाड़ने वाले ऐसे संयोजनों से बचने की सलाह दी गई है।',
    english: 'Caraka describes viruddha āhāra — food combinations that are mutually incompatible by criteria such as region, season, digestive capacity, quantity, processing, potency (heating/cooling), combination, and sequence of intake — as capable of vitiating the doshas and impairing the quality of the body’s tissues over time.',
    note: 'This is a classical principle of dietary compatibility, not a verdict on any single food pairing. Ayurveda evaluates viruddha āhāra in the context of an individual’s Prakriti, digestive strength (Agni) and season — it is a matter for personalised guidance, not a blanket prohibition for every person in every circumstance.',
    source: 'Caraka Saṃhitā, Sūtrasthāna, Ch. 26 (Ātreyabhadrakāpyīya Adhyāya) — classification of viruddha āhāra',
    text: 'Caraka Saṃhitā'
  },
  agni: {
    type: 'principle',
    category: 'Agni · The Digestive Fire',
    hindi: 'अग्नि को शरीर के समस्त शारीरिक एवं धातु-निर्माण कार्यों का मूल आधार माना गया है। सम अग्नि दीर्घायु, बल और स्वास्थ्य का कारण है, जबकि अग्नि की विषमता ही अधिकांश रोगों की उत्पत्ति का मूल कारण मानी गई है।',
    english: 'Agni — the body’s digestive and metabolic fire — is described as the root of nourishment, strength and long life when balanced (sama), and as the root cause underlying most disease when impaired.',
    source: 'Caraka Saṃhitā, Chikitsāsthāna, Ch. 15 (Grahaṇī Cikitsā) — on the centrality of Agni to health and disease',
    text: 'Caraka Saṃhitā'
  }
};

// Placement of wisdom panels through the assessment flow (see design brief):
// Patient Details → swastha → 01 Physical Body → ahara → 02 Lifestyle →
// dinacharya + viruddhaAhara → 03 Communication → agni → 04 Mind & Emotions →
// swastha (recap) → 05 Common Imbalances
export const wisdomFlow = [
  { after: 'profile', keys: ['swastha'] },
  { after: 0, keys: ['ahara'] },
  { after: 1, keys: ['dinacharya', 'viruddhaAhara'] },
  { after: 2, keys: ['agni'] },
  { after: 3, keys: ['swastha'] }
];

export const sections = [
  {
    title: 'Physical Body',
    altColors: true,
    rows: [
      { id: 'body-frame', label: 'Body Frame', vata: 'Naturally thin; hard to gain weight', pitta: 'Medium build', kapha: 'Larger or solid build; gains weight easily' },
      { id: 'weight-pattern', label: 'Weight Pattern', vata: 'Light; loses weight easily', pitta: 'Moderate; fairly stable', kapha: 'Gains weight easily; hard to lose' },
      { id: 'skin-type', label: 'Skin Type', vata: 'Dry, thin, may itch', pitta: 'Warm, flushed, prone to moles or freckles', kapha: 'Soft, smooth, can look pale' },
      { id: 'hair', label: 'Hair', vata: 'Thin, dry, brittle', pitta: 'Fine; may thin, recede, or grey early', kapha: 'Thick, full, slightly oily' },
      { id: 'face-shape', label: 'Face Shape', vata: 'Oval', pitta: 'Triangular or pointed chin', kapha: 'Round' },
      { id: 'eyes', label: 'Eyes', vata: 'Small, dry, darting', pitta: 'Sharp, focused gaze', kapha: 'Large, round, calm' },
      { id: 'hands', label: 'Hands', vata: 'Small, dry, rough', pitta: 'Warm, pink, slightly moist', kapha: 'Firm, thick, solid' },
      { id: 'fingers', label: 'Fingers', vata: 'Long, thin', pitta: 'Medium, tapered', kapha: 'Large, sturdy' },
      { id: 'complexion', label: 'Complexion', vata: 'Dull or darker tone', pitta: 'Reddish, glowing', kapha: 'Pale, fair' },
      { id: 'joints', label: 'Joints', vata: 'Small; may crack', pitta: 'Medium, flexible', kapha: 'Larger, well-padded' },
      { id: 'sweating', label: 'Sweating', vata: 'Rarely sweats', pitta: 'Sweats easily', kapha: 'Sweats with exertion' }
    ]
  },
  {
    title: 'Lifestyle & Daily Habits',
    rows: [
      { id: 'activity-level', label: 'Activity Level', vata: 'Very active; always moving', pitta: 'Thoughtful, purposeful', kapha: 'Steady, unhurried' },
      { id: 'pace', label: 'Pace', vata: 'Fast walker, fast talker', pitta: 'Precise and efficient', kapha: 'Slow and relaxed' },
      { id: 'sleep', label: 'Sleep', vata: 'Light sleeper; wakes easily', pitta: 'Light but falls back asleep', kapha: 'Deep, heavy sleeper' },
      { id: 'appetite', label: 'Appetite', vata: 'Irregular; anxious if skipping meals', pitta: 'Strong appetite; irritable if hungry', kapha: 'Mild appetite; can skip meals easily' },
      { id: 'digestion', label: 'Digestion', vata: 'Tends toward constipation', pitta: 'Regular; sometimes loose', kapha: 'Regular; steady morning routine' },
      { id: 'weather-pref', label: 'Weather Preference', vata: 'Prefers warm, humid', pitta: 'Prefers cool', kapha: 'Likes warm, dry' },
      { id: 'hobbies', label: 'Hobbies', vata: 'Creative arts, travel', pitta: 'Competitive sports, politics', kapha: 'Nature, gardening, reading' },
      { id: 'work-style', label: 'Work Style', vata: 'Creative, multitasking, scattered', pitta: 'Focused, organized, perfectionist', kapha: 'Slow, steady, thorough, methodical' },
      { id: 'stamina', label: 'Stamina', vata: 'Short bursts; tires easily', pitta: 'Moderate endurance', kapha: 'Long-lasting stamina' },
      { id: 'immunity', label: 'Immunity', vata: 'Gets sick easily', pitta: 'Moderate immunity', kapha: 'Strong immunity' },
      { id: 'sports-approach', label: 'Sports Approach', vata: 'Loves action', pitta: 'Loves to win', kapha: 'Plays for fun' }
    ]
  },
  {
    title: 'Communication',
    rows: [
      { id: 'voice', label: 'Voice', vata: 'Soft or hoarse', pitta: 'Strong; can be loud, high-pitched', kapha: 'Deep and pleasant' },
      { id: 'speech-style', label: 'Speech Style', vata: 'Talkative, expressive', pitta: 'Direct, clear, to the point', kapha: 'Quiet, thoughtful listener' }
    ]
  },
  {
    title: 'Mind & Emotions',
    rows: [
      { id: 'emotional-tendency', label: 'Emotional Tendency', vata: 'Worry, anxious, nervous', pitta: 'Irritability, anger', kapha: 'Calm, loving, nurturing' },
      { id: 'memory', label: 'Memory', vata: 'Learns fast, forgets fast', pitta: 'Sharp, focused memory', kapha: 'Slow to learn, long retention' },
      { id: 'dreams', label: 'Dreams', vata: 'Many, active, anxious — flying, running', pitta: 'Vivid, colorful, passionate — fire', kapha: 'Few, romantic, sentimental — water' },
      { id: 'action-style', label: 'Action Style', vata: 'Spontaneous; acts first', pitta: 'Planner; makes lists', kapha: 'Goes with the flow, sustained action' },
      { id: 'mind-state', label: 'Mind State', vata: 'Restless, racing thoughts', pitta: 'Impatient', kapha: 'Calm, steady' },
      { id: 'stress-response', label: 'Stress Response', vata: 'Anxiety, panic, overwhelm', pitta: 'Anger, frustration, irritation', kapha: 'Withdrawal, denial, low mood' },
      { id: 'decision-making', label: 'Decision Making', vata: 'Changes mind often', pitta: 'Decisive and firm', kapha: 'Prefers others decide' },
      { id: 'personality-motto', label: 'Personality Motto', vata: '"Can I change my mind?"', pitta: '"My way or the highway."', kapha: '"Don’t worry, be happy."' }
    ]
  },
  {
    title: 'Common Imbalances',
    rows: [
      { id: 'tendencies', label: 'Tendencies', vata: 'Anxiety, constipation, fatigue, pain', pitta: 'Heartburn, skin issues, fevers', kapha: 'Congestion, allergies, weight gain' }
    ]
  }
];

export const totalQuestions = sections.reduce((sum, s) => sum + s.rows.length, 0);
