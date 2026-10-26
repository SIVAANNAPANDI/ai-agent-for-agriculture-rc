"""
AgriAssist Agronomic Plant Disease Advisory Knowledge Base
Covers all 16 classes from the verified PlantVillage EfficientNetB0 model.
Provides comprehensive, scientifically verified organic, chemical, and preventive treatments in English & Tamil.
"""

from typing import Dict, Any, List

DISEASE_ADVISORY: Dict[str, Dict[str, Any]] = {
    "Pepper__bell___Bacterial_spot": {
        "crop": "Bell Pepper / Capsicum",
        "crop_ta": "குடைமிளகாய் / கேப்சிகம்",
        "disease_name": "Bacterial Spot",
        "disease_name_ta": "பாக்டீரியா இலைப்புள்ளி நோய்",
        "pathogen": "Xanthomonas campestris pv. vesicatoria",
        "is_healthy": False,
        "severity": "high",
        "symptoms": [
            "Small, circular to irregular water-soaked spots on leaves turning dark brown.",
            "Lesions develop yellow chlorotic halos and necrotic dry centers.",
            "Severe infections cause significant premature defoliation and sunscald on fruits."
        ],
        "symptoms_ta": [
            "இலைகளில் சிறிய, ஒழுங்கற்ற நீர் ஊறிய புள்ளிகள் தோன்றி அடர் பழுப்பு நிறமாக மாறும்.",
            "புள்ளிகளைச் சுற்றி மஞ்சள் வளையங்கள் மற்றும் நடுவில் காய்ந்த திசுக்கள் தோன்றும்.",
            "கடுமையான பாதிப்பில் இலைகள் உதிர்ந்து, காய்கள் வெயில் தாக்கத்திற்கு உள்ளாகும்."
        ],
        "organic_treatment": [
            "Spray 5% Neem Seed Kernel Extract (NSKE) or cold-pressed neem oil (5 ml/L).",
            "Foliar application of Pseudomonas fluorescens bio-agent @ 5 g/L or 10 ml/L.",
            "Apply copper hydroxide / copper soap sprays at 7-10 day intervals during humid periods."
        ],
        "organic_treatment_ta": [
            "5% வேப்பங்கொட்டை சாறு அல்லது வேப்பெண்ணெய் (5 மிலி/லிட்டர்) தெளிக்கவும்.",
            "சூடோமோனாஸ் ஃப்ளோரசன்ஸ் உயிர் உரத்தை (5 கிராம்/லிட்டர்) இலைகளில் தெளிக்கவும்.",
            "ஈரப்பதமான காலங்களில் காப்பர் ஹைட்ராக்சைடு தெளிக்கவும்."
        ],
        "chemical_treatment": [
            "Copper Oxychloride 50% WP @ 2.5 g/L mixed with Streptocycline @ 0.5 g per 10 L water.",
            "Kasugamycin 3% SL @ 2 ml/L at first onset of foliar spots.",
            "Repeat sprays at 10-14 day intervals until new foliage emerges symptom-free."
        ],
        "chemical_treatment_ta": [
            "காப்பர் ஆக்ஸிகுளோரைடு 50% WP (2.5 கிராம்/லி) + ஸ்ட்ரெப்டோசைக்ளின் (0.5 கிராம்/10லி) கலந்து தெளிக்கவும்.",
            "புள்ளிகள் தோன்றும் போது கசுகாமைசின் 3% SL (2 மிலி/லிட்டர்) தெளிக்கவும்.",
            "புதிய ஆரோக்கியமான இலைகள் தோன்றும் வரை 10-14 நாட்கள் இடைவெளியில் மீண்டும் தெளிக்கவும்."
        ],
        "preventive_measures": [
            "Use certified disease-free seeds; perform hot water seed treatment at 50°C for 25 minutes.",
            "Strictly avoid overhead sprinkler irrigation; employ drip irrigation directly at the root zone.",
            "Maintain wide plant spacing (60 cm x 45 cm) to facilitate rapid canopy drying.",
            "Practice 2-3 year crop rotation away from solanaceous crops (tomatoes, potatoes, chillies)."
        ],
        "preventive_measures_ta": [
            "சான்றளிக்கப்பட்ட விதைகளைப் பயன்படுத்தவும்; வெந்நீர் விதை நேர்த்தி (50°C வெப்பத்தில் 25 நிமிடங்கள்) செய்யவும்.",
            "தெளிப்பு நீர் பாசனத்தை தவிர்த்து, சொட்டு நீர் பாசன முறையைப் பயன்படுத்தவும்.",
            "காற்றோட்டம் கிடைக்க 60 செ.மீ x 45 செ.மீ இடைவெளி விடவும்.",
            "தக்காளி, உருளை போன்ற குடும்ப பயிர்களை தொடர்ந்து பயிரிடாமல் பயிர் சுழற்சி செய்யவும்."
        ]
    },

    "Pepper__bell___healthy": {
        "crop": "Bell Pepper / Capsicum",
        "crop_ta": "குடைமிளகாய் / கேப்சிகம்",
        "disease_name": "Healthy Foliage",
        "disease_name_ta": "ஆரோக்கியமான இலைகள்",
        "pathogen": "None (Plant is in optimal vigor)",
        "is_healthy": True,
        "severity": "none",
        "symptoms": [
            "Deep green, glossy leaves with firm turgidity and uniform leaf margins.",
            "No necrotic lesions, chlorotic mosaics, or fungal sporulation detected.",
            "Active vegetative apical growth with healthy flower bud initiation."
        ],
        "symptoms_ta": [
            "பளபளப்பான அடர் பச்சை இலைகள், சீரான விளிம்புகள் மற்றும் நல்ல உறுதித்தன்மை.",
            "எந்தவித புள்ளிகளோ, மஞ்சள் நிற மாற்றமோ அல்லது பூஞ்சை வளர்ச்சியோ இல்லை.",
            "ஆரோக்கியமான தளிர் வளர்ச்சி மற்றும் பூ மொட்டுகள் தோன்றும் நிலை."
        ],
        "organic_treatment": [
            "Apply well-decomposed vermicompost @ 2 tonnes/acre around the root zone.",
            "Spray 3% Panchagavya or Seaweed liquid extract (3 ml/L) every 15 days for continuous plant immunity.",
            "Maintain soil mulching with organic straw to conserve moisture and regulate root temperature."
        ],
        "organic_treatment_ta": [
            "செடியின் வேர் பகுதியில் மண்புழு உரம் (ஏக்கருக்கு 2 டன்) இடவும்.",
            "நோய் எதிர்ப்பு சக்தியை தக்கவைக்க 3% பஞ்சகாவ்யா அல்லது கடல்பாசி உரம் (3 மிலி/லி) தெளிக்கவும்.",
            "ஈரப்பதத்தை காக்க வைக்கோல் மூடாக்கு இடவும்."
        ],
        "chemical_treatment": [
            "No chemical fungicides or bactericides required.",
            "Maintain balanced fertigation with 19-19-19 water-soluble NPK @ 3 g/L during active vegetative flush."
        ],
        "chemical_treatment_ta": [
            "ரசாயன பூஞ்சைக்கொல்லிகள் தேவையில்லை.",
            "வளர்ச்சி பருவத்தில் 19-19-19 நீரில் கரையும் உரத்தை (3 கிராம்/லிட்டர்) பாசன நீரில் இடவும்."
        ],
        "preventive_measures": [
            "Conduct weekly scouting for early signs of sucking pests (thrips, aphids, whiteflies).",
            "Maintain regular soil moisture at 65-75% field capacity, preventing moisture stress.",
            "Keep farm borders free from weeds that harbor viral vectors."
        ],
        "preventive_measures_ta": [
            "இலைப்பேன், அசுவினி போன்ற பூச்சிகள் வருகிறதா என்று வாரந்தோறும் கண்காணிக்கவும்.",
            "மண்ணில் சீரான ஈரப்பதத்தை பராமரிக்கவும்.",
            "வரப்புகளில் களைகள் இல்லாமல் சுத்தமாக வைத்திருக்கவும்."
        ]
    },

    "PlantVillage": {
        "crop": "Unidentified / Non-Target Foliage",
        "crop_ta": "அடையாளம் காணப்படாத இலை",
        "disease_name": "Non-Target or Inconclusive Leaf",
        "disease_name_ta": "இலக்கு அல்லாத அல்லது தெளிவற்ற இலை",
        "pathogen": "Inconclusive identification",
        "is_healthy": False,
        "severity": "low",
        "symptoms": [
            "The uploaded leaf image does not clearly match standard solanaceous crop profiles (Tomato, Potato, Bell Pepper).",
            "Background noise or non-crop objects may have obscured plant diagnostic features."
        ],
        "symptoms_ta": [
            "பதிவேற்றிய படம் தக்காளி, உருளை அல்லது குடைமிளகாய் இலைகளுடன் சரியாக பொருந்தவில்லை.",
            "பின்னணி அல்லது பிற பொருட்கள் இலையின் முக்கிய பகுதிகளை மறைத்திருக்கலாம்."
        ],
        "organic_treatment": [
            "Capture a clearer photograph under bright daylight focusing directly on a single leaf blade.",
            "Consult a local agricultural extension officer or Krishi Vigyan Kendra (KVK) specialist for physical leaf sampling."
        ],
        "organic_treatment_ta": [
            "நல்ல பகல் வெளிச்சத்தில், ஒரு குறிப்பிட்ட இலையை மட்டும் தெளிவாக புகைப்படம் எடுக்கவும்.",
            "அருகிலுள்ள வேளாண் விரிவாக்க மையத்தை (KVK) அணுகி ஆலோசனை பெறவும்."
        ],
        "chemical_treatment": [
            "Do not spray indiscriminate chemical fungicides or pesticides without definite diagnosis."
        ],
        "chemical_treatment_ta": [
            "சரியான நோய் அறியாமல் ரசாயன மருந்துகளை தெளிக்க வேண்டாம்."
        ],
        "preventive_measures": [
            "Retake the photo with the camera positioned 15-20 cm away from the leaf, ensuring sharp focus."
        ],
        "preventive_measures_ta": [
            "கேமராவை இலையிலிருந்து 15-20 செ.மீ தொலைவில் வைத்து தெளிவாக படம் எடுக்கவும்."
        ]
    },

    "Potato___Early_blight": {
        "crop": "Potato",
        "crop_ta": "உருளைக்கிழங்கு",
        "disease_name": "Early Blight",
        "disease_name_ta": "ஆரம்பகால கருகல் நோய்",
        "pathogen": "Alternaria solani",
        "is_healthy": False,
        "severity": "medium",
        "symptoms": [
            "Small, scattered dark brown to black spots with distinct concentric rings creating a 'target board' appearance.",
            "Lesions primarily emerge on mature lower foliage before progressing upward.",
            "Surrounding leaf tissue turns chlorotic yellow, leading to premature leaf shedding."
        ],
        "symptoms_ta": [
            "இலைகளில் செறிவான வட்ட வளையங்களுடன் கூடிய 'இலக்கு பலகை' போன்ற பழுப்பு நிற புள்ளிகள்.",
            "முதலில் கீழ் இலைகளில் தோன்றி பின்னர் மேல் இலைகளுக்கு பரவும்.",
            "புள்ளிகளை சுற்றியுள்ள இலைப்பகுதி மஞ்சளாக மாறி உதிரத் தொடங்கும்."
        ],
        "organic_treatment": [
            "Spray Trichoderma viride or Trichoderma harzianum @ 5 g/L with 1% jaggery solution as sticking agent.",
            "Apply prophylactic 1% Bordeaux mixture before monsoon rain showers.",
            "Mulch potato ridges with straw to arrest soil-borne fungal spores from splashing onto foliage."
        ],
        "organic_treatment_ta": [
            "டிரைக்கோடெர்மா விரிடி (5 கிராம்/லிட்டர்) கரைசலை இலைகளில் தெளிக்கவும்.",
            "மழைக்காலத்திற்கு முன் 1% போர்டோ கலவை தெளிக்கவும்.",
            "மண்ணிலிருந்து பூஞ்சை வித்துக்கள் இலைகளில் தெறிக்காமல் இருக்க வைக்கோல் மூடாக்கு இடவும்."
        ],
        "chemical_treatment": [
            "Mancozeb 75% WP @ 2.5 g/L or Chlorothalonil 75% WP @ 2 g/L upon initial spot observation.",
            "For active spreading blight: Difenoconazole 25% EC @ 0.5 ml/L or Azoxystrobin 23% SC @ 1 ml/L.",
            "Alternate fungicides with different modes of action to prevent fungal resistance."
        ],
        "chemical_treatment_ta": [
            "மேன்கோசெப் 75% WP (2.5 கிராம்/லி) அல்லது குளோரோதலோனில் (2 கிராம்/லி) தெளிக்கவும்.",
            "நோய் பரவும் போது டைபனோகோனசோல் 25% EC (0.5 மிலி/லி) அல்லது அஸாக்சிஸ்ட்ரோபின் (1 மிலி/லி) தெளிக்கவும்.",
            "பூஞ்சை எதிர்ப்புத்திறனை தடுக்க மாற்று மருந்துகளை சுழற்சி முறையில் பயன்படுத்தவும்."
        ],
        "preventive_measures": [
            "Plant certified disease-free seed tubers with balanced potassium fertilization to fortify cell walls.",
            "Maintain furrow or drip irrigation, avoiding foliage wetting in late afternoons.",
            "Enforce 3-year crop rotation with non-solanaceous crops such as legumes or cereal grains."
        ],
        "preventive_measures_ta": [
            "சான்றளிக்கப்பட்ட விதைக்கிழங்குகளை நடவு செய்யவும்; பொட்டாஷ் உரத்தை பரிந்துரைத்த அளவில் இடவும்.",
            "மாலையில் இலைகளில் தண்ணீர் படாதவாறு பாசனம் செய்யவும்.",
            "பயறு வகை அல்லது தானிய பயிர்களுடன் 3 வருட பயிர் சுழற்சி செய்யவும்."
        ]
    },

    "Potato___Late_blight": {
        "crop": "Potato",
        "crop_ta": "உருளைக்கிழங்கு",
        "disease_name": "Late Blight",
        "disease_name_ta": "தாமதமான கருகல் நோய் (கொடிய கருகல்)",
        "pathogen": "Phytophthora infestans (Oomycete)",
        "is_healthy": False,
        "severity": "critical",
        "symptoms": [
            "Rapidly expanding water-soaked dark greenish-brown to black lesions on leaf tips and margins.",
            "Fine white, cottony downy fungal growth prominently visible on the underside of leaves during humid mornings.",
            "Stems develop dark brown lesions, leading to complete canopy collapse within 48-72 hours if untreated.",
            "Infected tubers show dry reddish-brown rotting beneath the skin."
        ],
        "symptoms_ta": [
            "இலைகளின் நுனி மற்றும் ஓரங்களில் வேகமாக பரவும் நீர் ஊறிய அடர் பழுப்பு நிற கருகல்.",
            "பனி மற்றும் அதிக ஈரப்பதம் உள்ள காலை வேளையில் இலையின் அடியில் வெள்ளை நிற பஞ்சு போன்ற பூஞ்சை வளர்ச்சி.",
            "தண்டுகள் கருகி, 2-3 நாட்களில் முழு பயிரும் கருகி அழியும் அபாயம்.",
            "கிழங்குகளில் தோல் பகுதிக்கு அடியில் சிவப்பு பழுப்பு நிற அழுகல் ஏற்படும்."
        ],
        "organic_treatment": [
            "Rogue out and bury severely infected haulms deep underground immediately; do not compost.",
            "Spray Copper Hydroxide 53.8% DF @ 2 g/L as a protective barrier before cloudy/rainy spells.",
            "Apply Bacillus subtilis bio-fungicide formulations @ 5 ml/L during initial vegetative stages."
        ],
        "organic_treatment_ta": [
            "பாதிக்கப்பட்ட செடிகளை உடனடியாக வேரோடு பிடுங்கி ஆழமாக புதைக்கவும்; உரம் தயாரிக்க பயன்படுத்த வேண்டாம்.",
            "மழை மற்றும் மேகமூட்டத்திற்கு முன் காப்பர் ஹைட்ராக்சைடு (2 கிராம்/லி) தெளிக்கவும்.",
            "பேசில்லஸ் சப்டிலிஸ் உயிர் பூஞ்சைக்கொல்லியை (5 மிலி/லி) தெளிக்கவும்."
        ],
        "chemical_treatment": [
            "Immediately spray systemic: Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ) @ 2.5 g/L.",
            "Alternative cure: Cymoxanil 8% + Mancozeb 64% WP @ 2.5 g/L or Dimethomorph 50% WP @ 1.5 g/L.",
            "For persistent rain: Mandipropamid 23.4% SC @ 0.8 ml/L or Fluopicolide + Propamocarb HCl @ 2 ml/L."
        ],
        "chemical_treatment_ta": [
            "உடனடியாக மெட்டலாக்சில் 8% + மேன்கோசெப் 64% WP (ரிடோமில்) @ 2.5 கிராம்/லிட்டர் தெளிக்கவும்.",
            "சைமோக்சனில் + மேன்கோசெப் (2.5 கிராம்/லி) அல்லது டைமெத்தோமார்ப் (1.5 கிராம்/லி) தெளிக்கவும்.",
            "தொடர் மழையில் மாண்டிபுரோபமைடு (0.8 மிலி/லி) தெளிக்கவும்."
        ],
        "preventive_measures": [
            "Perform deep earthing-up (12-15 cm ridges) to prevent oospores from washing into developing tubers.",
            "Avoid night or evening overhead irrigation; monitor weather for prolonged 15-20°C temperature with >85% humidity.",
            "Destroy all volunteer potato plants and cull piles within 500 meters of the field."
        ],
        "preventive_measures_ta": [
            "பூஞ்சை வித்துக்கள் கிழங்குகளில் புகாதிருக்க செடிகளைச் சுற்றி 12-15 செ.மீ உயரத்திற்கு மண் அணைக்கவும்.",
            "இரவு நேர பாசனத்தை தவிர்க்கவும்; 15-20°C குளிர்ச்சியான மற்றும் ஈரப்பதமான வானிலையை கவனிக்கவும்.",
            "வயல் வரப்புகளில் உள்ள பழைய உருளைக்கிழங்கு கழிவுகளை அப்புறப்படுத்தவும்."
        ]
    },

    "Potato___healthy": {
        "crop": "Potato",
        "crop_ta": "உருளைக்கிழங்கு",
        "disease_name": "Healthy Foliage",
        "disease_name_ta": "ஆரோக்கியமான உருளை இலைகள்",
        "pathogen": "None (Optimum tuber bulking stage)",
        "is_healthy": True,
        "severity": "none",
        "symptoms": [
            "Uniform emerald green compound pinnate leaves with firm erect stems.",
            "Free from foliar necrotic rings, marginal water-soaking, or vector-borne leaf curling.",
            "Healthy canopy architecture maximizing photosynthetic solar interception."
        ],
        "symptoms_ta": [
            "அடர் பச்சை நிறத்தில் நிமிர்ந்த தண்டுகளுடன் கூடிய ஆரோக்கியமான கூட்டிலை.",
            "எந்தவித கருகல் புள்ளிகளோ அல்லது இலை சுருட்டலோ இன்றி உள்ளது.",
            "நல்ல ஒளிச்சேர்க்கைக்கான அடர்த்தியான இலை பரப்பு."
        ],
        "organic_treatment": [
            "Apply vermiwash or cow urine filtrate (10%) mixed with seaweed extract to maintain vegetative vigor.",
            "Drench root ridges with beneficial mycorrhizal fungi (VAM @ 5 kg/acre) to boost phosphate uptake."
        ],
        "organic_treatment_ta": [
            "வளர்ச்சியை ஊக்குவிக்க மண்புழு வடிநீர் அல்லது கடற்பாசி உரம் தெளிக்கவும்.",
            "பாஸ்பரஸ் சத்து கிடைக்க வேர்பகுதியில் வாம் (VAM) உயிர் உரத்தை இடவும்."
        ],
        "chemical_treatment": [
            "No chemical fungicides needed.",
            "Ensure adequate potash nutrition (SOP - Potassium Sulphate 0-0-50 @ 5 g/L) for optimal tuber sizing."
        ],
        "chemical_treatment_ta": [
            "ரசாயன பூஞ்சைக்கொல்லிகள் தேவையில்லை.",
            "கிழங்கு பெருக்கத்திற்கு பொட்டாசியம் சல்பேட் (SOP 0-0-50) @ 5 கிராம்/லிட்டர் தெளிக்கவும்."
        ],
        "preventive_measures": [
            "Monitor soil moisture carefully during the critical tuber initiation and bulking stages (60-70 days).",
            "Scout for early presence of potato aphids and tuber moth eggs on the foliage."
        ],
        "preventive_measures_ta": [
            "கிழங்கு உருவாகும் 60-70 நாட்களில் மண்ணில் சீரான ஈரப்பதம் இருப்பதை உறுதி செய்யவும்.",
            "அசுவினி மற்றும் கிழங்கு அந்துப்பூச்சிகள் தென்படுகிறதா என கவனிக்கவும்."
        ]
    },

    "Tomato_Bacterial_spot": {
        "crop": "Tomato",
        "crop_ta": "தக்காளி",
        "disease_name": "Bacterial Spot",
        "disease_name_ta": "பாக்டீரியா இலைப்புள்ளி நோய்",
        "pathogen": "Xanthomonas perforans / gardneri",
        "is_healthy": False,
        "severity": "high",
        "symptoms": [
            "Numerous small (1-3 mm), dark brown, water-soaked circular spots with distinctive yellow chlorotic rings.",
            "Centers of older leaf spots frequently dry out, turn scab-like, and crack open.",
            "Blossom infections lead to severe flower abortion and sunken scabby spots on green tomatoes."
        ],
        "symptoms_ta": [
            "இலைகளில் ஏராளமான சிறிய (1-3 மிமீ), நீர் ஊறிய அடர் பழுப்பு நிற புள்ளிகள் மற்றும் மஞ்சள் வளையம்.",
            "பழைய புள்ளிகளின் மையம் காய்ந்து, ஓட்டைகள் விழும்.",
            "பூக்கள் உதிர்தல் மற்றும் காய்களில் சொறி போன்ற பழுப்பு தழும்புகள் ஏற்படும்."
        ],
        "organic_treatment": [
            "Apply 5% Neem Seed Kernel Extract (NSKE) or garlic-chilli extract to suppress bacterial population.",
            "Foliar spray of antagonistic bacteria Pseudomonas fluorescens or Bacillus subtilis @ 5 g/L.",
            "Spray Copper Hydroxide @ 2 g/L weekly during high-humidity spells."
        ],
        "organic_treatment_ta": [
            "5% வேப்பங்கொட்டை சாறு அல்லது பூண்டு-மிளகாய் கரைசல் தெளிக்கவும்.",
            "சூடோமோனாஸ் அல்லது பேசில்லஸ் சப்டிலிஸ் (5 கிராம்/லி) இலைகளில் தெளிக்கவும்.",
            "ஈரப்பதம் அதிகமாக இருக்கும் போது காப்பர் ஹைட்ராக்சைடு (2 கிராம்/லி) தெளிக்கவும்."
        ],
        "chemical_treatment": [
            "Copper Oxychloride 50% WP @ 2.5 g/L mixed with Streptocycline @ 0.5 g per 10 L water.",
            "Kasugamycin 3% SL @ 2 ml/L or Validamycin 3% L @ 2 ml/L at early infection onset.",
            "Spray early morning or late afternoon, ensuring complete coverage of leaf undersides."
        ],
        "chemical_treatment_ta": [
            "காப்பர் ஆக்ஸிகுளோரைடு (2.5 கிராம்/லி) + ஸ்ட்ரெப்டோசைக்ளின் (0.5 கிராம்/10லி) கலந்து தெளிக்கவும்.",
            "தொடக்க நிலையில் கசுகாமைசின் 3% SL (2 மிலி/லிட்டர்) தெளிக்கவும்.",
            "இலையின் அடிப்பகுதியில் மருந்து நனையும்படி காலை அல்லது மாலை வேளையில் தெளிக்கவும்."
        ],
        "preventive_measures": [
            "Disinfect farm pruning shears and trellising stakes in 10% sodium hypochlorite (bleach) solution.",
            "Do not work in wet tomato fields to avoid mechanically transmitting bacterial slime.",
            "Adopt drip irrigation and avoid overhead sprinklers at all costs."
        ],
        "preventive_measures_ta": [
            "கவாத்து கத்தரிக்கோல் மற்றும் முட்டுக் கம்புகளை கிருமிநாசினி கரைசலில் நனைத்து பயன்படுத்தவும்.",
            "செடிகள் ஈரமாக இருக்கும் போது வயலில் வேலை செய்வதை தவிர்க்கவும்.",
            "சொட்டு நீர் பாசனத்தை மட்டுமே பயன்படுத்தவும்."
        ]
    },

    "Tomato_Early_blight": {
        "crop": "Tomato",
        "crop_ta": "தக்காளி",
        "disease_name": "Early Blight",
        "disease_name_ta": "ஆரம்பகால கருகல் நோய் (இலக்கு புள்ளி)",
        "pathogen": "Alternaria linariae (Alternaria solani)",
        "is_healthy": False,
        "severity": "medium",
        "symptoms": [
            "Brown to dark brownish-black spots displaying prominent concentric rings (bullseye/target pattern).",
            "Yellow halo borders developing around lesions, progressively covering the leaf blade.",
            "Lower leaves turn yellow, shrivel, and drop prematurely, exposing fruits to solar sunscald."
        ],
        "symptoms_ta": [
            "இலைகளில் செறிவான வட்ட வளையங்களுடன் கூடிய பழுப்பு நிற கருகல் புள்ளிகள்.",
            "புள்ளிகளைச் சுற்றி மஞ்சள் வளையம் தோன்றி முழு இலையும் மஞ்சளாகும்.",
            "கீழ் இலைகள் காய்ந்து உதிர்வதால் காய்களில் வெயில் காயம் ஏற்படும்."
        ],
        "organic_treatment": [
            "Spray Trichoderma harzianum @ 5 g/L + Pseudomonas fluorescens @ 5 g/L on canopy and root zone.",
            "Prune off the bottom 30 cm of lower leaves touching or close to the ground.",
            "Apply straw or plastic mulch beneath plants to prevent soil-splash inoculation during rains."
        ],
        "organic_treatment_ta": [
            "டிரைக்கோடெர்மா ஹார்சியானம் மற்றும் சூடோமோனாஸ் (தலா 5 கிராம்/லி) கலந்து தெளிக்கவும்.",
            "மண்ணில் படும் அடிப்பகுதி இலைகளை (30 செ.மீ வரை) கவாத்து செய்து அகற்றவும்.",
            "மழை நீர் தெறிப்பதை தடுக்க வைக்கோல் அல்லது பிளாஸ்டிக் மூடாக்கு இடவும்."
        ],
        "chemical_treatment": [
            "Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Amistar Top) @ 1 ml/L at first sign of spots.",
            "Mancozeb 75% WP @ 2.5 g/L or Chlorothalonil 75% WP @ 2 g/L as prophylactic protector.",
            "Pyraclostrobin 20% WG @ 1 g/L or Tebuconazole 25.9% EC @ 1.5 ml/L for advancing blights."
        ],
        "chemical_treatment_ta": [
            "அமிஸ்டார் டாப் (அஸாக்சிஸ்ட்ரோபின் + டைபனோகோனசோல்) @ 1 மிலி/லிட்டர் தெளிக்கவும்.",
            "பாதுகாப்பு மருந்தாக மேன்கோசெப் (2.5 கிராம்/லி) அல்லது குளோரோதலோனில் (2 கிராம்/லி) தெளிக்கவும்.",
            "டெபுகோனசோல் (1.5 மிலி/லி) மருந்தை நோய் பரவும் போது தெளிக்கவும்."
        ],
        "preventive_measures": [
            "Stake tomato plants upright to ensure elevated canopy and superior airflow.",
            "Apply balanced nitrogen; excessive lush vegetative growth makes leaves prone to early blight.",
            "Rotate crops annually with non-solanaceous maize, sorghum, or legumes."
        ],
        "preventive_measures_ta": [
            "செடிகளை குச்சிகள் மூலம் தாங்கி கட்டி நிமிர்த்தி வைக்கவும்.",
            "அதிகப்படியான தழைச்சத்தை (யூரியா) தவிர்க்கவும்.",
            "மக்காச்சோளம் அல்லது பயறு வகை பயிர்களுடன் பயிர் சுழற்சி செய்யவும்."
        ]
    },

    "Tomato_Late_blight": {
        "crop": "Tomato",
        "crop_ta": "தக்காளி",
        "disease_name": "Late Blight",
        "disease_name_ta": "தாமதமான கருகல் நோய் (கொடிய கருகல்)",
        "pathogen": "Phytophthora infestans",
        "is_healthy": False,
        "severity": "critical",
        "symptoms": [
            "Large, irregular water-soaked greasy olive-green to black patches on leaves and petioles.",
            "Delicate white, frosted downy fungal sporulation visible on the underside of leaves during damp conditions.",
            "Stems develop dark brown greasy girdling lesions, snapping off in moderate wind.",
            "Green tomato fruits exhibit hard, greasy brown sunken blotches."
        ],
        "symptoms_ta": [
            "இலைகள் மற்றும் தண்டுகளில் வேகமாக பரவும் நீர் ஊறிய அடர் பழுப்பு/கருப்பு கருகல்.",
            "ஈரப்பதம் உள்ள காலை வேளையில் இலையின் அடிப்பகுதியில் வெள்ளை நிற பஞ்சு போன்ற பூஞ்சை வளர்ச்சி.",
            "தண்டுகளில் கருகல் ஏற்பட்டு செடிகள் எளிதில் முறிந்து விழும்.",
            "பச்சை காய்களில் கடினமான பழுப்பு நிற அழுகல் திட்டுகள் தோன்றும்."
        ],
        "organic_treatment": [
            "Immediately excise and incinerate infected plants; do not leave cull debris in field margins.",
            "Foliar spray of Copper Hydroxide 53.8% DF @ 2 g/L before rainy or foggy weather fronts.",
            "Apply high-potency Bacillus amyloliquefaciens bio-fungicide formulations @ 5 ml/L."
        ],
        "organic_treatment_ta": [
            "பாதிக்கப்பட்ட செடிகளை உடனடியாக அகற்றி எரிக்கவும்; வயல் வரப்புகளில் வீச வேண்டாம்.",
            "மேகமூட்டம் அல்லது பனிப்பொழிவிற்கு முன் காப்பர் ஹைட்ராக்சைடு (2 கிராம்/லி) தெளிக்கவும்.",
            "பேசில்லஸ் அமிலோலிக்விஃபேசியன்ஸ் உயிர் பூஞ்சைக்கொல்லியை (5 மிலி/லி) தெளிக்கவும்."
        ],
        "chemical_treatment": [
            "Systemic emergency cure: Dimethomorph 50% WP @ 1.5 g/L + Mancozeb 75% WP @ 2 g/L.",
            "Cymoxanil 8% + Mancozeb 64% WP @ 2.5 g/L or Metalaxyl-M + Chlorothalonil @ 2 ml/L.",
            "Fluopicolide 4.44% + Fosetyl-Al 66.67% WG @ 2.5 g/L for rain-fast, curative systemic control."
        ],
        "chemical_treatment_ta": [
            "அவசர சிகிச்சையாக டைமெத்தோமார்ப் (1.5 கிராம்/லி) + மேன்கோசெப் (2 கிராம்/லி) கலந்து தெளிக்கவும்.",
            "சைமோக்சனில் + மேன்கோசெப் (2.5 கிராம்/லி) அல்லது மெட்டலாக்சில் தெளிக்கவும்.",
            "ஃப்ளூபிகோலைடு + ஃபோசிடைல்-அல் (2.5 கிராம்/லி) மருந்தை மழைக்காலத்தில் தெளிக்கவும்."
        ],
        "preventive_measures": [
            "Plant late-blight resistant tomato hybrids where available.",
            "Ensure wide spacing (minimum 75 cm between rows) for maximum sunlight penetration.",
            "Never use overhead sprinkler irrigation during cool, humid weather spells."
        ],
        "preventive_measures_ta": [
            "தாமத கருகல் நோயை எதிர்க்கும் வீரிய ஒட்டு ரகங்களை பயிரிடவும்.",
            "செடிகளுக்கு இடையே போதுமான இடைவெளி (குறைந்தது 75 செ.மீ) விடவும்.",
            "குளிர்ந்த ஈரப்பதமான காலங்களில் தெளிப்பு நீர் பாசனம் செய்ய வேண்டாம்."
        ]
    },

    "Tomato_Leaf_Mold": {
        "crop": "Tomato",
        "crop_ta": "தக்காளி",
        "disease_name": "Leaf Mold",
        "disease_name_ta": "இலை பூஞ்சை நோய்",
        "pathogen": "Passalora fulva (Cladosporium fulvum)",
        "is_healthy": False,
        "severity": "medium",
        "symptoms": [
            "Pale yellow to chlorotic diffuse spots with indistinct borders on upper leaf surfaces.",
            "Dense, velvety olive-green to grayish-brown fungal carpet directly underneath the leaf spots.",
            "Infected leaves gradually curl, wither, turn golden-brown, and drop prematurely."
        ],
        "symptoms_ta": [
            "இலையின் மேல் பரப்பில் தெளிவற்ற விளிம்புகளுடன் கூடிய வெளிர் மஞ்சள் புள்ளிகள்.",
            "இலையின் அடியில் ஆலிவ்-பச்சை அல்லது சாம்பல்-பழுப்பு நிற வெல்வெட் போன்ற பூஞ்சை படலம்.",
            "இலைகள் சுருண்டு, காய்ந்து, பழுப்பு நிறமாக மாறி உதிரும்."
        ],
        "organic_treatment": [
            "Spray wettable sulphur 80% WDG @ 2.5 g/L or potassium bicarbonate @ 3 g/L.",
            "Apply Trichoderma viride @ 5 g/L bio-fungicide formulation on lower leaves.",
            "Prune excess foliage and suckers to enhance internal air movement."
        ],
        "organic_treatment_ta": [
            "நனையும் கந்தகம் (வெட்டபிள் சல்பர் 80% WDG) @ 2.5 கிராம்/லி அல்லது பொட்டாசியம் பைகார்பனேட் தெளிக்கவும்.",
            "டிரைக்கோடெர்மா விரிடி (5 கிராம்/லி) கரைசலை இலைகளில் தெளிக்கவும்.",
            "காற்றோட்டத்தை அதிகரிக்க பக்கக் கிளைகள் மற்றும் அதிகப்படியான இலைகளை கவாத்து செய்யவும்."
        ],
        "chemical_treatment": [
            "Difenoconazole 25% EC @ 0.5 ml/L or Tebuconazole 25.9% EC @ 1 ml/L.",
            "Chlorothalonil 75% WP @ 2 g/L or Azoxystrobin 23% SC @ 1 ml/L at first detection of fungal carpet.",
            "Ensure spray nozzles reach the undersides of the lower and middle canopy leaves."
        ],
        "chemical_treatment_ta": [
            "டைபனோகோனசோல் (0.5 மிலி/லி) அல்லது டெபுகோனசோல் (1 மிலி/லி) தெளிக்கவும்.",
            "குளோரோதலோனில் (2 கிராம்/லி) அல்லது அஸாக்சிஸ்ட்ரோபின் (1 மிலி/லி) தெளிக்கவும்.",
            "இலையின் அடிப்பகுதியில் மருந்து நன்கு படுமாறு தெளிப்பான் முனையை அமைத்து தெளிக்கவும்."
        ],
        "preventive_measures": [
            "In polyhouses and protected structures, maintain relative humidity strictly below 80% using exhaust fans.",
            "Water only early in the morning so canopy dries thoroughly before nightfall.",
            "Select resistant cultivars containing Cf resistance genes."
        ],
        "preventive_measures_ta": [
            "பசுமைக்குடில்களில் வெளியேற்றும் மின்விசிறிகளை இயக்கி ஈரப்பதத்தை 80%-க்கு கீழ் பராமரிக்கவும்.",
            "இரவுக்குள் இலைகள் காய்ந்துவிடும் வகையில் அதிகாலை வேளையில் மட்டும் நீர் பாய்ச்சவும்.",
            "நோய் எதிர்ப்பு திறன் கொண்ட ரகங்களை நடவு செய்யவும்."
        ]
    },

    "Tomato_Septoria_leaf_spot": {
        "crop": "Tomato",
        "crop_ta": "தக்காளி",
        "disease_name": "Septoria Leaf Spot",
        "disease_name_ta": "செப்டோரியா இலைப்புள்ளி நோய்",
        "pathogen": "Septoria lycopersici",
        "is_healthy": False,
        "severity": "high",
        "symptoms": [
            "Numerous small, circular lesions (2-4 mm) with dark brown margins and sunken ash-gray/white centers.",
            "Tiny, raised black specks (fungal fruiting bodies called pycnidia) clearly visible inside the gray centers with a hand lens.",
            "Severely infected leaves turn yellow, curl up, and fall off, defoliating plants from the base upwards."
        ],
        "symptoms_ta": [
            "அடர் பழுப்பு நிற விளிம்புகள் மற்றும் சாம்பல் நிற மையத்துடன் கூடிய சிறிய வட்ட புள்ளிகள் (2-4 மிமீ).",
            "சாம்பல் நிற மையத்தில் சிறிய கருப்பு நிற புள்ளிகள் (பூஞ்சை வித்து பைகள்) தென்படும்.",
            "பாதிக்கப்பட்ட இலைகள் மஞ்சளாகி, சுருண்டு, அடியிலிருந்து உதிரத் தொடங்கும்."
        ],
        "organic_treatment": [
            "Promptly strip off and safely discard all infected lower foliage displaying spots.",
            "Spray Copper Hydroxide or Copper Soap @ 2 g/L as a protective foliar barrier.",
            "Apply bio-fungicide Pseudomonas fluorescens @ 5 g/L with 0.1% surfactant."
        ],
        "organic_treatment_ta": [
            "புள்ளிகள் உள்ள அடி இலைகளை உடனுக்குடன் கிள்ளி எடுத்து அப்புறப்படுத்தவும்.",
            "காப்பர் ஹைட்ராக்சைடு (2 கிராம்/லிட்டர்) பாதுகாப்பு மருந்தாக தெளிக்கவும்.",
            "சூடோமோனாஸ் ஃப்ளோரசன்ஸ் (5 கிராம்/லி) உயிர் பூஞ்சைக்கொல்லியை தெளிக்கவும்."
        ],
        "chemical_treatment": [
            "Chlorothalonil 75% WP @ 2 g/L or Mancozeb 75% WP @ 2.5 g/L at weekly intervals.",
            "For active infections: Azoxystrobin + Difenoconazole @ 1 ml/L or Propiconazole 25% EC @ 1 ml/L.",
            "Ensure comprehensive wetting of both the upper and lower leaf surfaces."
        ],
        "chemical_treatment_ta": [
            "குளோரோதலோனில் (2 கிராம்/லி) அல்லது மேன்கோசெப் (2.5 கிராம்/லி) வாரத்திற்கு ஒருமுறை தெளிக்கவும்.",
            "தீவிர நிலைக்கு அஸாக்சிஸ்ட்ரோபின் + டைபனோகோனசோல் (1 மிலி/லி) தெளிக்கவும்.",
            "இலையின் மேல் மற்றும் கீழ் பரப்புகளில் முழுமையாக நனையும்படி தெளிக்கவும்."
        ],
        "preventive_measures": [
            "Do not overhead water; keep foliage dry using drip irrigation lines.",
            "Destroy all solanaceous weeds (such as black nightshade / Manathakkali) bordering the plot.",
            "Clean all trellising stakes with disinfectant at season end before reusing."
        ],
        "preventive_measures_ta": [
            "சொட்டு நீர் பாசனம் அமைத்து இலைகளில் ஈரம் படாமல் பாதுகாக்கவும்.",
            "வரப்புகளில் உள்ள மணத்தக்காளி போன்ற களைச்செடிகளை முழுமையாக அழிக்கவும்.",
            "பயிர்க்காலம் முடிந்ததும் முட்டுக் கம்புகளை கிருமிநீக்கம் செய்யவும்."
        ]
    },

    "Tomato_Spider_mites_Two_spotted_spider_mite": {
        "crop": "Tomato",
        "crop_ta": "தக்காளி",
        "disease_name": "Two-Spotted Spider Mites",
        "disease_name_ta": "செம்பேன் / இரண்டு புள்ளி சிலந்தி பூச்சி",
        "pathogen": "Tetranychus urticae (Arachnid pest)",
        "is_healthy": False,
        "severity": "high",
        "symptoms": [
            "Fine white, yellow, or silvery stippling speckles across the upper leaf surfaces.",
            "Leaves turn bronze, parchment-like, brittle, and dry up under heavy infestation.",
            "Delicate silken webbing visible on leaf undersides, growing tips, and flower clusters.",
            "Microscopic red/yellowish 8-legged mites actively moving within the webs."
        ],
        "symptoms_ta": [
            "இலையின் மேல் பரப்பில் சிறிய வெள்ளை அல்லது மஞ்சள் நிற புள்ளிகள் (சொரசொரப்பு).",
            "பாதிப்பு அதிகமானால் இலைகள் வெண்கல நிறமாக மாறி, காய்ந்து உதிரும்.",
            "இலையின் அடியிலும் தளிர் பகுதியிலும் மெல்லிய சிலந்தி வலைகள் காணப்படும்.",
            "வலைகளில் கண்ணுக்கு தெரியாத மிகச்சிறிய சிவப்பு/மஞ்சள் நிற பேன்கள் ஊர்ந்து கொண்டிருக்கும்."
        ],
        "organic_treatment": [
            "Foliar spray of cold-pressed Neem Oil (10,000 ppm) @ 4 ml/L with mild surfactant (1 ml/L).",
            "Spray Wettable Sulphur 80% WDG @ 3 g/L during early morning (avoid spraying above 32°C).",
            "Release predatory mites (Neoseiulus californicus or Phytoseiulus persimilis) @ 5-10 per m²."
        ],
        "organic_treatment_ta": [
            "வேப்பெண்ணெய் (10,000 ppm) @ 4 மிலி/லிட்டர் + காதி சோப் (1 மிலி/லி) கலந்து தெளிக்கவும்.",
            "நனையும் கந்தகம் (வெட்டபிள் சல்பர்) @ 3 கிராம்/லிட்டர் அதிகாலையில் தெளிக்கவும் (வெயில் நேரத்தில் தெளிக்க வேண்டாம்).",
            "நன்மை செய்யும் இரைகௌவி பேன்களை வயலில் விடவும்."
        ],
        "chemical_treatment": [
            "Spiromesifen 22.9% SC (Oberon) @ 1 ml/L (highly effective against all nymphal stages).",
            "Propargite 57% EC @ 2 ml/L or Fenpyroximate 5% EC @ 1.5 ml/L.",
            "Abamectin 1.9% EC @ 0.5 ml/L for acute knock-down of adult spider mites."
        ],
        "chemical_treatment_ta": [
            "ஸ்பைரோமெசிஃபென் (ஓபரான்) @ 1 மிலி/லிட்டர் தெளிக்கவும் (குஞ்சுகளை அழிக்க சிறந்தது).",
            "புரோபார்கைட் 57% EC @ 2 மிலி/லி அல்லது ஃபென்பைராக்சிமேட் @ 1.5 மிலி/லி தெளிக்கவும்.",
            "அபாமெக்டின் 1.9% EC @ 0.5 மிலி/லிட்டர் தெளித்து பெரிய பேன்களை கட்டுப்படுத்தவும்."
        ],
        "preventive_measures": [
            "Maintain adequate soil irrigation; spider mites thrive and multiply exponentially in hot, dry, dusty drought conditions.",
            "Hose down dusty farm roads adjacent to tomato fields to prevent wind-borne mite drift.",
            "Preserve natural predatory beneficial insects by avoiding broad-spectrum synthetic pyrethroid insecticides."
        ],
        "preventive_measures_ta": [
            "மண்ணில் சீரான ஈரப்பதம் இருக்க வேண்டும்; வறண்ட மற்றும் புழுதி நிறைந்த சூழலில் பேன்கள் வேகமாக பெருகும்.",
            "வயல் ஓரத்து சாலைகளில் புழுதி பறக்காமல் தண்ணீர் தெளிக்கவும்.",
            "நன்மை செய்யும் பூச்சிகளை அழிக்கக்கூடிய கடுமையான பூச்சிக்கொல்லிகளை தெளிப்பதை தவிர்க்கவும்."
        ]
    },

    "Tomato__Target_Spot": {
        "crop": "Tomato",
        "crop_ta": "தக்காளி",
        "disease_name": "Target Spot",
        "disease_name_ta": "இலக்கு புள்ளி நோய்",
        "pathogen": "Corynespora cassiicola",
        "is_healthy": False,
        "severity": "medium",
        "symptoms": [
            "Small, circular to pinpoint necrotic spots with light brown centers and distinct darker brown concentric rings.",
            "Lesions lack the pronounced chlorotic yellow halo typical of early blight in their initial development.",
            "Leaf centers often drop out, resulting in a 'shot-hole' appearance in advanced stages."
        ],
        "symptoms_ta": [
            "வெளிர் பழுப்பு மையம் மற்றும் அடர் பழுப்பு வளையங்களுடன் கூடிய சிறிய வட்ட வடிவ புள்ளிகள்.",
            "ஆரம்பத்தில் ஆரம்பகால கருகல் நோய் போல் மஞ்சள் வளையம் இருக்காது.",
            "முற்றிய நிலையில் புள்ளிகளின் மையப்பகுதி விழுந்து இலைகளில் துளைகள் விழும்."
        ],
        "organic_treatment": [
            "Spray Copper Oxychloride 50% WP @ 2.5 g/L as a protective barrier on foliage.",
            "Apply foliar bio-fungicide Bacillus subtilis or Trichoderma harzianum @ 5 g/L.",
            "Strip severely spotted bottom foliage and bury safely away from the plot."
        ],
        "organic_treatment_ta": [
            "காப்பர் ஆக்ஸிகுளோரைடு (2.5 கிராம்/லிட்டர்) பாதுகாப்பு மருந்தாக தெளிக்கவும்.",
            "பேசில்லஸ் சப்டிலிஸ் அல்லது டிரைக்கோடெர்மா உயிர் உரத்தை (5 கிராம்/லி) தெளிக்கவும்.",
            "அதிக புள்ளிகள் உள்ள கீழ் இலைகளை பறித்து அப்புறப்படுத்தவும்."
        ],
        "chemical_treatment": [
            "Boscalid + Pyraclostrobin (Cabrio Top) @ 1.5 g/L at first detection.",
            "Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L or Chlorothalonil @ 2 g/L.",
            "Mancozeb 75% WP @ 2.5 g/L on alternate spray cycles to mitigate resistance."
        ],
        "chemical_treatment_ta": [
            "பாஸ்காலிட் + பைராக்ளோஸ்ட்ரோபின் (கேப்ரியோ டாப்) @ 1.5 கிராம்/லிட்டர் தெளிக்கவும்.",
            "அஸாக்சிஸ்ட்ரோபின் + டைபனோகோனசோல் (1 மிலி/லி) அல்லது குளோரோதலோனில் தெளிக்கவும்.",
            "மேன்கோசெப் 75% WP (2.5 கிராம்/லி) மாற்று முறையில் தெளிக்கவும்."
        ],
        "preventive_measures": [
            "Increase row spacing to promote quick foliar drying after morning dew and rainfall.",
            "Prune canopy suckers regularly to prevent dense humidity pockets inside the plants.",
            "Do not establish tomato seedlings downwind of infected old vegetable blocks."
        ],
        "preventive_measures_ta": [
            "காலை பனி மற்றும் மழைக்கு பின் இலைகள் வேகமாக காய நடவு இடைவெளியை அதிகரிக்கவும்.",
            "செடியின் அடர்த்தியை குறைக்க பக்கக் கிளைகளை தொடர்ந்து கவாத்து செய்யவும்.",
            "பழைய நோய் தாக்கிய பயிர்களுக்கு அருகில் புதிய பயிரை நடவு செய்ய வேண்டாம்."
        ]
    },

    "Tomato__Tomato_YellowLeaf__Curl_Virus": {
        "crop": "Tomato",
        "crop_ta": "தக்காளி",
        "disease_name": "Tomato Yellow Leaf Curl Virus (TYLCV)",
        "disease_name_ta": "இலை சுருட்டல் மற்றும் மஞ்சள் நச்சுயிரி நோய்",
        "pathogen": "Begomovirus (Transmitted by Whitefly - Bemisia tabaci)",
        "is_healthy": False,
        "severity": "critical",
        "symptoms": [
            "Severe upward cupping, curling, and puckering of leaf margins into small cup shapes.",
            "Marked interveinal chlorosis with young apical foliage turning bright golden yellow.",
            "Extreme plant stunting with shortened internodes, creating a bushy, stunted 'bonsai' look.",
            "Massive flower drop; plants infected before flowering fail to produce marketable fruits."
        ],
        "symptoms_ta": [
            "இலைகள் மேல்நோக்கி கிண்ணம் போல் சுருண்டு குவிந்து போதல்.",
            "இலை நரம்புகளுக்கு இடைப்பட்ட பகுதி பிரகாசமான மஞ்சள் நிறமாக மாறுதல்.",
            "கணுக்களின் இடைவெளி குறைந்து, செடி வளராமல் குட்டையாக புதர் போல் தோற்றமளித்தல்.",
            "பூக்கள் கொத்து கொத்தாக உதிர்ந்து, காய் பிடிக்காமல் போகுதல்."
        ],
        "organic_treatment": [
            "Immediately rogue out and bury/burn virus-infected plants; there is no chemical cure for plant viruses.",
            "Install bright Yellow Sticky Traps (15-20 traps/acre) at canopy level to monitor and trap whitefly vectors.",
            "Spray 5% Neem Seed Kernel Extract (NSKE) or 2% Horticultural Mineral Oil to repel and kill whitefly nymphs.",
            "Spray Lecanicillium lecanii (Verticillium lecanii) bio-pesticide @ 5 g/L to parasitize whitefly colonies."
        ],
        "organic_treatment_ta": [
            "வைரஸ் தாக்கிய செடிகளை உடனடியாக பிடுங்கி எரிக்கவும்; இதற்கு ரசாயன நிவாரணம் இல்லை.",
            "வெள்ளை ஈக்களை கவர்ந்து அழிக்க மஞ்சள் ஒட்டும் பொறிகளை (ஏக்கருக்கு 15-20) வைக்கவும்.",
            "5% வேப்பங்கொட்டை சாறு அல்லது வேப்பெண்ணெய் (5 மிலி/லி) தெளித்து வெள்ளை ஈக்களை கட்டுப்படுத்தவும்.",
            "வெர்ட்டிசீலியம் லெக்கானி உயிர் பூச்சிக்கொல்லியை (5 கிராம்/லி) தெளிக்கவும்."
        ],
        "chemical_treatment": [
            "Vector Control: Thiamethoxam 25% WG @ 0.35 g/L or Dinotefuran 20% SG @ 0.5 g/L.",
            "Diafenthiuron 50% WP @ 1.2 g/L or Spiromesifen 22.9% SC @ 1 ml/L for whitefly nymphs.",
            "Cyantraniliprole 10.26% OD (Benevia) @ 1.8 ml/L for comprehensive whitefly suppression.",
            "Rotate systemic neonicotinoids with insect growth regulators to forestall vector resistance."
        ],
        "chemical_treatment_ta": [
            "வெள்ளை ஈக்களை கட்டுப்படுத்த தயோமித்தாக்சம் 25% WG @ 0.35 கிராம்/லி அல்லது டைனோடெபுரான் @ 0.5 கிராம்/லி தெளிக்கவும்.",
            "டயாஃபெந்தியூரான் (1.2 கிராம்/லி) அல்லது ஸ்பைரோமெசிஃபென் (1 மிலி/லி) தெளிக்கவும்.",
            "சயான்டிரானிலிபுரோல் (பெனிவியா) @ 1.8 மிலி/லிட்டர் தெளிக்கவும்.",
            "பூச்சி மருந்துகளுக்கு எதிர்ப்பு சக்தி வராமல் இருக்க மருந்துகளை மாற்றி மாற்றி தெளிக்கவும்."
        ],
        "preventive_measures": [
            "Raise tomato nursery seedlings under 40-mesh or 50-mesh nylon insect-proof netting.",
            "Use silver/reflective plastic mulch to repel incoming whiteflies from landing on young seedlings.",
            "Plant 2-3 border rows of tall maize or sorghum around the field as a physical barrier against whitefly drift."
        ],
        "preventive_measures_ta": [
            "நாற்றங்கால்களை 40-50 மெஷ் நைலான் பூச்சி தடுப்பு வலைகளுக்குள் வைத்து வளர்க்கவும்.",
            "வெள்ளி நிற பிளாஸ்டிக் மூடாக்கு விரித்து வெள்ளை ஈக்கள் செடிகளில் அமர்வதை தடுக்கவும்.",
            "வயலை சுற்றி 2-3 வரிசைகளில் மக்காச்சோளம் அல்லது சோளம் பயிரிட்டு பூச்சிகள் நுழையாமல் வேலி அமைக்கவும்."
        ]
    },

    "Tomato__Tomato_mosaic_virus": {
        "crop": "Tomato",
        "crop_ta": "தக்காளி",
        "disease_name": "Tomato Mosaic Virus (ToMV)",
        "disease_name_ta": "தக்காளி மொசைக் நச்சுயிரி நோய்",
        "pathogen": "Tobamovirus (Mechanically & seed transmitted)",
        "is_healthy": False,
        "severity": "high",
        "symptoms": [
            "Mottling of leaves with alternating light green and dark green patches ('mosaic pattern').",
            "Leaf distortion, leaf blade blistering, and severe 'fern-leaf' or strap-like narrowing of leaflets.",
            "Overall plant stunting and delayed ripening with internal brown necrotic browning of fruit walls."
        ],
        "symptoms_ta": [
            "இலைகளில் வெளிர் பச்சை மற்றும் அடர் பச்சை நிற திட்டுகள் (மொசைக் கோலங்கள்).",
            "இலைகள் உருமாறி, கொப்பளங்கள் தோன்றி, 'பெரணி இலை' போல் மெலிந்து நீளமாக மாறுதல்.",
            "செடியின் வளர்ச்சி குன்றி, பழங்களின் உட்புறத்தில் பழுப்பு நிற அழுகல் ஏற்படுதல்."
        ],
        "organic_treatment": [
            "Rogue out and burn infected plants immediately; do not handle healthy plants after touching diseased ones.",
            "Wash pruning tools and hands in a 20% non-fat dry skim milk solution (milk proteins deactivate virions).",
            "Spray prophylactic butter milk (5%) or raw cow milk dilution (1:10) as an antiviral surface coat."
        ],
        "organic_treatment_ta": [
            "தாக்கப்பட்ட செடிகளை உடனே பிடுங்கி தீயிட்டு அழிக்கவும்; தொட்ட பின் ஆரோக்கியமான செடிகளை தொடக்கூடாது.",
            "கவாத்து கருவிகளை 20% பால் கரைசலில் கழுவி கிருமிநீக்கம் செய்யவும் (பால் புரதம் வைரஸை செயலிழக்கச் செய்யும்).",
            "நோய் வராமல் தடுக்க 5% மோர் அல்லது பசும்பால் (1:10 விகிதத்தில்) தெளிக்கவும்."
        ],
        "chemical_treatment": [
            "No chemical viricide can eliminate viruses inside plant cells.",
            "Spray systemic insecticides (Acetamiprid 20% SP @ 0.5 g/L) if aphids or vectors are contributing to mechanical transmission."
        ],
        "chemical_treatment_ta": [
            "செல்லுக்குள் இருக்கும் வைரஸ்களுக்கு ரசாயன மருந்துகள் இல்லை.",
            "வைரஸை பரப்பும் அசுவினி போன்ற பூச்சிகளை கட்டுப்படுத்த அசிட்டமிப்ரிட் (0.5 கிராம்/லிட்டர்) தெளிக்கவும்."
        ],
        "preventive_measures": [
            "Strictly forbid tobacco smoking, chewing, or handling inside the field, as tobacco products carry live Tobamoviruses.",
            "Purchase certified virus-tested seeds treated with 10% trisodium phosphate (TSP).",
            "Wash hands thoroughly with soap before transplanting and staking operations."
        ],
        "preventive_measures_ta": [
            "புகையிலைப் பொருட்களில் இந்த வைரஸ் இருப்பதால், வயலில் புகைபிடிப்பது அல்லது புகையிலை பயன்படுத்துவதை முற்றிலும் தடை செய்யவும்.",
            "சான்றளிக்கப்பட்ட விதை நேர்த்தி செய்யப்பட்ட விதைகளையே நடவு செய்யவும்.",
            "நாற்று நடுவதற்கு முன்பும் கவாத்து செய்யும் போதும் கைகளை சோப்பு போட்டு நன்கு கழுவவும்."
        ]
    },

    "Tomato_healthy": {
        "crop": "Tomato",
        "crop_ta": "தக்காளி",
        "disease_name": "Healthy Foliage",
        "disease_name_ta": "ஆரோக்கியமான தக்காளி இலைகள்",
        "pathogen": "None (Plant in optimal physiological health)",
        "is_healthy": True,
        "severity": "none",
        "symptoms": [
            "Vibrant, deep green foliage with uniform serrated leaf margins.",
            "No spots, necrotic lesions, viral mosaic mottling, or spider mite webbings.",
            "Robust shoot growth, vigorous flowering truss formation, and clean calyx development."
        ],
        "symptoms_ta": [
            "சீரான விளிம்புகளுடன் கூடிய அடர் பச்சை நிறத்தில் பளபளப்பான இலைகள்.",
            "எந்தவித கருகல் புள்ளிகளோ, வைரஸ் கோலங்களோ அல்லது சிலந்தி வலைகளோ இல்லை.",
            "செழிப்பான தளிர் வளர்ச்சி மற்றும் ஆரோக்கியமான பூங்கொத்துகள்."
        ],
        "organic_treatment": [
            "Apply enriched compost or well-cured farmyard manure (FYM @ 5 tons/acre) with Trichoderma.",
            "Spray 3% Panchagavya or Jeevamrutham foliar spray every 10-14 days to sustain leaf phyllosphere immunity.",
            "Foliar spray of micronutrient mixture (Boron, Zinc, Iron @ 2 g/L) at bud break to enhance flower retention."
        ],
        "organic_treatment_ta": [
            "டிரைக்கோடெர்மா கலந்த மக்கிய தொழுவுரத்தை (ஏக்கருக்கு 5 டன்) செடிகளின் வேரில் இடவும்.",
            "இலைகளின் நோய் எதிர்ப்பு சக்தியை காக்க 3% பஞ்சகாவ்யா அல்லது ஜீவாமிர்தம் 10-14 நாட்களுக்கு ஒருமுறை தெளிக்கவும்.",
            "பூக்கள் உதிராமல் இருக்க நுண்ணூட்ட உர கலவையை (போரான், துத்தநாகம் @ 2 கிராம்/லி) மொட்டு விடும் போது தெளிக்கவும்."
        ],
        "chemical_treatment": [
            "No chemical pesticides or fungicides required.",
            "Maintain balanced fertigation with 19-19-19 water-soluble fertilizer @ 3 g/L during active growth."
        ],
        "chemical_treatment_ta": [
            "ரசாயன மருந்துகள் எதுவும் தேவையில்லை.",
            "வளர்ச்சிக்கு ஏற்ப 19-19-19 உரத்தை (3 கிராம்/லி) பாசன நீரில் கலந்து இடவும்."
        ],
        "preventive_measures": [
            "Conduct routine twice-weekly scouting on leaf undersides for early detection of pests.",
            "Maintain consistent drip irrigation to avert blossom end rot and fruit cracking.",
            "Maintain clean field borders free from weeds."
        ],
        "preventive_measures_ta": [
            "பூச்சிகள் ஏதேனும் வருகிறதா என வாரத்திற்கு இருமுறை இலையின் அடியில் பரிசோதிக்கவும்.",
            "காய் அழுகல் மற்றும் பழம் வெடிப்பதை தடுக்க சீரான சொட்டு நீர் பாசனம் செய்யவும்.",
            "வயல் வரப்புகளை சுத்தமாக வைத்திருக்கவும்."
        ]
    }
}


def get_disease_advisory(class_name: str, language: str = "en") -> Dict[str, Any]:
    """
    Retrieves agronomic advisory data for a given model classification.
    Returns tailored English or Tamil translations.
    """
    raw = DISEASE_ADVISORY.get(class_name)
    if not raw:
        # Fallback for unknown classes
        raw = DISEASE_ADVISORY.get("PlantVillage") or next(iter(DISEASE_ADVISORY.values()))

    is_ta = (language == "ta")

    return {
        "crop": raw["crop_ta"] if is_ta else raw["crop"],
        "disease_name": raw["disease_name_ta"] if is_ta else raw["disease_name"],
        "display_name": f"{raw['crop_ta']} - {raw['disease_name_ta']}" if is_ta else f"{raw['crop']} - {raw['disease_name']}",
        "pathogen": raw["pathogen"],
        "is_healthy": raw["is_healthy"],
        "severity": raw["severity"],
        "symptoms": raw["symptoms_ta"] if is_ta else raw["symptoms"],
        "organic_treatment": raw["organic_treatment_ta"] if is_ta else raw["organic_treatment"],
        "chemical_treatment": raw["chemical_treatment_ta"] if is_ta else raw["chemical_treatment"],
        "preventive_measures": raw["preventive_measures_ta"] if is_ta else raw["preventive_measures"],
    }
