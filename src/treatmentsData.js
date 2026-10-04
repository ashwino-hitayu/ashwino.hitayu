// Therapies shown on the Treatments page, in display order. Wording stays
// with "traditionally used for" — these describe classical indications, not
// promised outcomes. `tagline` is the one-liner on the card's photo side;
// `note` (optional) adds a small caution on the details side.
// `image` + `credit`: stock photos (Pexels licence: free, credit optional;
// the Wikimedia one is CC BY-SA 3.0, so its credit must stay visible — see the
// credits line under the grid). Only Kati Basti and Raktamokshan show the
// actual therapy; the rest are close stand-ins until the clinic's own photos
// replace them (drop the `credit` when you do).
export const treatments = [
  {
    id: 'kati-basti',
    image: '/treatments/kati-basti.jpg',
    credit: { author: 'Rishikesh Yoga Valley School', source: 'Pexels', url: 'https://www.pexels.com/photo/38494113/' },
    name: 'Kati Basti',
    tagline: 'Warm oil therapy for the lower back',
    sanskrit: 'कटि बस्ति',
    description: 'Warm medicated oil is held over the lower back inside a ring of herbal dough, letting it soak deep into the muscles and joints of the lumbar spine.',
    uses: ['Lower back pain', 'Stiffness & muscle spasm', 'Sciatica-type pain', 'Lumbar spondylosis']
  },
  {
    id: 'janu-basti',
    image: '/treatments/janu-basti.jpg',
    credit: { author: 'Funkcines Terapijos Centras', source: 'Pexels', url: 'https://www.pexels.com/photo/20860603/' },
    name: 'Janu Basti',
    tagline: 'Nourishing warm oil for the knees',
    sanskrit: 'जानु बस्ति',
    description: 'Warm medicated oil is pooled over the knee within a dough ring, nourishing the joint and the tissues around it.',
    uses: ['Knee pain & stiffness', 'Age-related knee wear', 'Creaking or swollen knees', 'Sports strain']
  },
  {
    id: 'hriday-basti',
    image: '/treatments/hriday-basti.jpg',
    credit: { author: 'Ekaterina Mitkina', source: 'Pexels', url: 'https://www.pexels.com/photo/10976260/' },
    name: 'Hriday Basti',
    tagline: 'A calming oil therapy over the heart',
    sanskrit: 'हृदय बस्ति',
    description: 'Warm herbal oil is retained over the chest, above the heart — a deeply calming therapy for body and mind.',
    uses: ['Stress & anxiety', 'Chest heaviness from tension', 'Disturbed sleep', 'Emotional wellbeing'],
    note: 'Complements, never replaces, care for heart conditions.'
  },
  {
    id: 'nasya',
    image: '/treatments/nasya.jpg',
    credit: { author: 'Karola G', source: 'Pexels', url: 'https://www.pexels.com/photo/4021780/' },
    name: 'Nasya',
    tagline: 'Nasal therapy for the head and senses',
    sanskrit: 'नस्य',
    description: 'Medicated oil or ghee is given through the nostrils after a gentle face massage and steam — the classical therapy for the head and senses.',
    uses: ['Sinus congestion', 'Headache & migraine', 'Neck & shoulder stiffness', 'Hair & scalp health']
  },
  {
    id: 'raktamokshan',
    image: '/treatments/raktamokshan.jpg',
    credit: { author: 'Ravipeenya', source: 'Wikimedia Commons, CC BY-SA 3.0, resized', url: 'https://commons.wikimedia.org/wiki/File:Leech_Treatment_-_Varicose_Vein.jpg' },
    name: 'Raktamokshan',
    tagline: 'Classical blood purification',
    sanskrit: 'रक्तमोक्षण',
    description: 'Classical blood-purification therapy: a small, controlled amount of blood is let, most often with medicinal leeches (Jalaukavacharan), under strict hygiene.',
    uses: ['Chronic skin conditions', 'Localised inflammation', 'Varicose veins', 'Acne & boils']
  },
  {
    id: 'viddhakarma',
    image: '/treatments/viddhakarma.jpg',
    credit: { author: 'Shkraba Anthony', source: 'Pexels', url: 'https://www.pexels.com/photo/6076122/' },
    name: 'Viddhakarma',
    tagline: 'Fine-needle therapy for pain relief',
    sanskrit: 'विद्धकर्म',
    description: 'Precise needling of specific points with a fine sterile needle — a classical technique valued for quick relief from pain.',
    uses: ['Heel pain', 'Frozen shoulder', 'Sciatica', 'Tennis elbow & joint pain']
  },
  {
    id: 'basti',
    image: '/treatments/basti.jpg',
    credit: { author: 'Nora Brody', source: 'Pexels', url: 'https://www.pexels.com/photo/23511158/' },
    name: 'Basti',
    tagline: 'Panchakarma’s principal therapy for Vata',
    sanskrit: 'बस्ति',
    description: 'Medicated decoctions and oils given as an enema — the principal Panchakarma therapy for Vata, called “half of all treatment” in the Charaka Samhita.',
    uses: ['Chronic constipation & bloating', 'Joint & back pain', 'Vata disorders', 'Rejuvenation']
  },
  {
    id: 'snehan-swedan',
    image: '/treatments/snehan-swedan.jpg',
    credit: { author: 'Tima Miroshnichenko', source: 'Pexels', url: 'https://www.pexels.com/photo/6187852/' },
    name: 'Snehan & Swedan',
    tagline: 'Herbal oil massage and steam',
    sanskrit: 'स्नेहन – स्वेदन',
    description: 'A full-body massage with warm herbal oils (Snehan) followed by herbal steam (Swedan) to ease stiffness, open the channels and prepare the body for deeper therapies.',
    uses: ['Body aches & stiffness', 'Fatigue & stress', 'Better circulation', 'Preparation for Panchakarma']
  }
];
