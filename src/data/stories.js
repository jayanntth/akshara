/**
 * Micro-story library (change #3).
 *
 * Three stories per script, graded 1 to 3. Each story carries:
 *   text      the story, in the script being learned
 *   roman     a transliteration line per sentence, for early readers
 *   gist      a one-line summary in every interface language, so a Kannada
 *             speaker learning Hindi always has a bridge back to their own
 *   words     three words worth keeping, with transliteration
 *   questions three comprehension questions, written in the story's own
 *             language on purpose: answering questions about a Hindi story
 *             in Hindi is the reading practice, not an obstacle to it
 *   theme     matched against the learner's stated reason for learning
 */

export const STORIES = [
  // ------------------------------------------------------------------ हिंदी
  {
    id: "hi-s1", lang: "hi", level: 1, theme: "family", minutes: 3,
    title: "चाय की दुकान",
    text: [
      "रमा रोज़ सुबह चाय बनाती है।",
      "उसकी छोटी दुकान स्टेशन के पास है।",
      "सुबह छह बजे पहला ग्राहक आता है।",
      "वह मुस्कुराकर कहती है, नमस्ते!",
    ],
    roman: [
      "Rama roz subah chai banati hai.",
      "Uski chhoti dukan station ke paas hai.",
      "Subah chhah baje pehla grahak aata hai.",
      "Vah muskurakar kehti hai, namaste!",
    ],
    gist: {
      en: "Rama runs a small tea stall by the station and greets her first customer at six.",
      hi: "रमा स्टेशन के पास चाय की छोटी दुकान चलाती है और छह बजे पहले ग्राहक का स्वागत करती है।",
      kn: "ರಮಾ ನಿಲ್ದಾಣದ ಬಳಿ ಸಣ್ಣ ಚಹಾ ಅಂಗಡಿ ನಡೆಸುತ್ತಾಳೆ, ಆರು ಗಂಟೆಗೆ ಮೊದಲ ಗ್ರಾಹಕನನ್ನು ಸ್ವಾಗತಿಸುತ್ತಾಳೆ.",
      ta: "ரமா நிலையம் அருகே சிறிய தேநீர்க் கடை நடத்துகிறாள், ஆறு மணிக்கு முதல் வாடிக்கையாளரை வரவேற்கிறாள்.",
      te: "రమ స్టేషన్ దగ్గర చిన్న టీ దుకాణం నడుపుతుంది, ఆరు గంటలకు మొదటి కస్టమర్‌ను పలకరిస్తుంది.",
      bn: "রমা স্টেশনের পাশে ছোট চায়ের দোকান চালায়, ছটায় প্রথম খদ্দেরকে স্বাগত জানায়।",
    },
    words: [{ w: "चाय", r: "chai" }, { w: "दुकान", r: "dukan" }, { w: "ग्राहक", r: "grahak" }],
    questions: [
      { q: "रमा क्या बनाती है?", options: ["चाय", "रोटी", "दूध"], answer: 0 },
      { q: "उसकी दुकान कहाँ है?", options: ["स्टेशन के पास", "गाँव में", "स्कूल में"], answer: 0 },
      { q: "पहला ग्राहक कब आता है?", options: ["छह बजे", "आठ बजे", "दस बजे"], answer: 0 },
    ],
  },
  {
    id: "hi-s2", lang: "hi", level: 2, theme: "work", minutes: 4,
    title: "नई नौकरी",
    text: [
      "अजय को शहर में नई नौकरी मिली।",
      "पहले दिन वह बस से दफ़्तर गया।",
      "रास्ते में उसने हर बोर्ड पढ़ने की कोशिश की।",
      "अब वह हर दिन एक नया शब्द सीखता है।",
    ],
    roman: [
      "Ajay ko shahar mein nayi naukri mili.",
      "Pehle din vah bus se daftar gaya.",
      "Raaste mein usne har board padhne ki koshish ki.",
      "Ab vah har din ek naya shabd seekhta hai.",
    ],
    gist: {
      en: "Ajay reads street signs on his bus ride to work and learns a word a day.",
      hi: "अजय दफ़्तर जाते समय बस से बोर्ड पढ़ता है और रोज़ एक शब्द सीखता है।",
      kn: "ಅಜಯ್ ಕೆಲಸಕ್ಕೆ ಹೋಗುವಾಗ ಬಸ್ಸಿನಿಂದ ಫಲಕ ಓದುತ್ತಾನೆ, ದಿನಕ್ಕೊಂದು ಪದ ಕಲಿಯುತ್ತಾನೆ.",
      ta: "அஜய் வேலைக்குச் செல்லும் பேருந்தில் பலகைகளைப் படித்து தினம் ஒரு சொல் கற்கிறான்.",
      te: "అజయ్ ఆఫీసుకు వెళ్లే బస్సులో బోర్డులు చదివి రోజుకు ఒక పదం నేర్చుకుంటాడు.",
      bn: "অজয় অফিসে যাওয়ার বাসে বোর্ড পড়ে আর রোজ একটি শব্দ শেখে।",
    },
    words: [{ w: "नौकरी", r: "naukri" }, { w: "दफ़्तर", r: "daftar" }, { w: "शब्द", r: "shabd" }],
    questions: [
      { q: "अजय को नौकरी कहाँ मिली?", options: ["शहर में", "गाँव में", "विदेश में"], answer: 0 },
      { q: "वह दफ़्तर कैसे गया?", options: ["बस से", "कार से", "पैदल"], answer: 0 },
      { q: "वह हर दिन क्या सीखता है?", options: ["एक नया शब्द", "एक नया गीत", "एक नई भाषा"], answer: 0 },
    ],
  },
  {
    id: "hi-s3", lang: "hi", level: 3, theme: "travel", minutes: 5,
    title: "रेल का सफ़र",
    text: [
      "मीना पहली बार अकेले रेल में बैठी।",
      "खिड़की के बाहर खेत पीछे भागते रहे।",
      "उसने टिकट पर लिखा नाम ध्यान से पढ़ा।",
      "शाम तक वह अपने गाँव पहुँच गई।",
    ],
    roman: [
      "Meena pehli baar akele rail mein baithi.",
      "Khidki ke baahar khet peechhe bhagte rahe.",
      "Usne ticket par likha naam dhyan se padha.",
      "Shaam tak vah apne gaon pahunch gayi.",
    ],
    gist: {
      en: "Meena travels alone by train for the first time and reads her own ticket.",
      hi: "मीना पहली बार अकेले रेल से जाती है और अपना टिकट खुद पढ़ती है।",
      kn: "ಮೀನಾ ಮೊದಲ ಬಾರಿ ಒಬ್ಬಳೇ ರೈಲಿನಲ್ಲಿ ಪ್ರಯಾಣಿಸಿ ತನ್ನ ಟಿಕೆಟ್ ತಾನೇ ಓದುತ್ತಾಳೆ.",
      ta: "மீனா முதல் முறையாகத் தனியே ரயிலில் பயணித்து தன் டிக்கெட்டைத் தானே படிக்கிறாள்.",
      te: "మీనా మొదటిసారి ఒంటరిగా రైలులో ప్రయాణించి తన టికెట్ తానే చదువుతుంది.",
      bn: "মীনা প্রথমবার একা ট্রেনে যায় আর নিজের টিকিট নিজেই পড়ে।",
    },
    words: [{ w: "खिड़की", r: "khidki" }, { w: "टिकट", r: "ticket" }, { w: "गाँव", r: "gaon" }],
    questions: [
      { q: "मीना किसमें बैठी?", options: ["रेल में", "बस में", "नाव में"], answer: 0 },
      { q: "खिड़की के बाहर क्या दिखा?", options: ["खेत", "समुद्र", "पहाड़"], answer: 0 },
      { q: "वह गाँव कब पहुँची?", options: ["शाम तक", "सुबह", "रात में"], answer: 0 },
    ],
  },

  // ------------------------------------------------------------------ ಕನ್ನಡ
  {
    id: "kn-s1", lang: "kn", level: 1, theme: "family", minutes: 3,
    title: "ಹೂವಿನ ಅಂಗಡಿ",
    text: [
      "ಸೀತಾ ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಹೂ ಮಾರುತ್ತಾಳೆ.",
      "ಅವಳ ಅಂಗಡಿ ದೇವಸ್ಥಾನದ ಪಕ್ಕ ಇದೆ.",
      "ಶಾಲೆಗೆ ಹೋಗುವ ಮಕ್ಕಳು ಅವಳನ್ನು ನೋಡುತ್ತಾರೆ.",
      "ಅವಳು ನಗುತ್ತಾ ನಮಸ್ಕಾರ ಹೇಳುತ್ತಾಳೆ.",
    ],
    roman: [
      "Sita pratidina beligge hoo maaruttale.",
      "Avala angadi devasthanada pakka ide.",
      "Shalege hoguva makkalu avalannu noduttare.",
      "Avalu nagutta namaskara heluttale.",
    ],
    gist: {
      en: "Sita sells flowers beside the temple and greets the children on their way to school.",
      hi: "सीता मंदिर के पास फूल बेचती है और स्कूल जाते बच्चों का अभिवादन करती है।",
      kn: "ಸೀತಾ ದೇವಸ್ಥಾನದ ಪಕ್ಕ ಹೂ ಮಾರುತ್ತಾಳೆ, ಶಾಲೆಗೆ ಹೋಗುವ ಮಕ್ಕಳನ್ನು ಮಾತನಾಡಿಸುತ್ತಾಳೆ.",
      ta: "சீதா கோயிலருகே பூ விற்று, பள்ளிக்குச் செல்லும் குழந்தைகளை வரவேற்கிறாள்.",
      te: "సీత గుడి పక్కన పూలు అమ్ముతూ, బడికి వెళ్లే పిల్లలను పలకరిస్తుంది.",
      bn: "সীতা মন্দিরের পাশে ফুল বেচে আর স্কুলে যাওয়া শিশুদের অভিবাদন জানায়।",
    },
    words: [{ w: "ಹೂ", r: "hoo" }, { w: "ಅಂಗಡಿ", r: "angadi" }, { w: "ಮಕ್ಕಳು", r: "makkalu" }],
    questions: [
      { q: "ಸೀತಾ ಏನು ಮಾರುತ್ತಾಳೆ?", options: ["ಹೂ", "ಹಣ್ಣು", "ಹಾಲು"], answer: 0 },
      { q: "ಅವಳ ಅಂಗಡಿ ಎಲ್ಲಿದೆ?", options: ["ದೇವಸ್ಥಾನದ ಪಕ್ಕ", "ಶಾಲೆಯ ಪಕ್ಕ", "ನಿಲ್ದಾಣದ ಪಕ್ಕ"], answer: 0 },
      { q: "ಅವಳು ಏನು ಹೇಳುತ್ತಾಳೆ?", options: ["ನಮಸ್ಕಾರ", "ಧನ್ಯವಾದ", "ಕ್ಷಮಿಸಿ"], answer: 0 },
    ],
  },
  {
    id: "kn-s2", lang: "kn", level: 2, theme: "school", minutes: 4,
    title: "ಮೊದಲ ಪತ್ರ",
    text: [
      "ರವಿ ತನ್ನ ಅಕ್ಕನಿಗೆ ಪತ್ರ ಬರೆದ.",
      "ಪ್ರತಿ ಅಕ್ಷರವನ್ನು ಅವನು ನಿಧಾನವಾಗಿ ಬರೆದ.",
      "ಶಿಕ್ಷಕಿ ಅದನ್ನು ನೋಡಿ ಖುಷಿಪಟ್ಟರು.",
      "ಈಗ ರವಿ ವಾರಕ್ಕೊಂದು ಪತ್ರ ಬರೆಯುತ್ತಾನೆ.",
    ],
    roman: [
      "Ravi tanna akkanige patra bareda.",
      "Prati aksharavannu avanu nidhanavagi bareda.",
      "Shikshaki adannu nodi khushipattaru.",
      "Eega Ravi varakkondu patra bareyuttane.",
    ],
    gist: {
      en: "Ravi writes his sister a letter, one careful letter at a time, and now writes weekly.",
      hi: "रवि अपनी बहन को धीरे-धीरे पत्र लिखता है और अब हर सप्ताह लिखता है।",
      kn: "ರವಿ ಅಕ್ಕನಿಗೆ ನಿಧಾನವಾಗಿ ಪತ್ರ ಬರೆದು, ಈಗ ವಾರಕ್ಕೊಮ್ಮೆ ಬರೆಯುತ್ತಾನೆ.",
      ta: "ரவி தன் அக்காவுக்கு மெதுவாகக் கடிதம் எழுதி, இப்போது வாரந்தோறும் எழுதுகிறான்.",
      te: "రవి తన అక్కకు నెమ్మదిగా ఉత్తరం రాసి, ఇప్పుడు వారానికొకటి రాస్తాడు.",
      bn: "রবি দিদিকে ধীরে ধীরে চিঠি লেখে, এখন সপ্তাহে একটি করে লেখে।",
    },
    words: [{ w: "ಪತ್ರ", r: "patra" }, { w: "ಅಕ್ಷರ", r: "akshara" }, { w: "ಶಿಕ್ಷಕಿ", r: "shikshaki" }],
    questions: [
      { q: "ರವಿ ಯಾರಿಗೆ ಪತ್ರ ಬರೆದ?", options: ["ಅಕ್ಕನಿಗೆ", "ಅಮ್ಮನಿಗೆ", "ಗೆಳೆಯನಿಗೆ"], answer: 0 },
      { q: "ಅವನು ಹೇಗೆ ಬರೆದ?", options: ["ನಿಧಾನವಾಗಿ", "ಅವಸರದಲ್ಲಿ", "ಬೇಜಾರಿನಿಂದ"], answer: 0 },
      { q: "ಈಗ ಎಷ್ಟು ಬಾರಿ ಬರೆಯುತ್ತಾನೆ?", options: ["ವಾರಕ್ಕೊಮ್ಮೆ", "ದಿನಕ್ಕೊಮ್ಮೆ", "ವರ್ಷಕ್ಕೊಮ್ಮೆ"], answer: 0 },
    ],
  },
  {
    id: "kn-s3", lang: "kn", level: 3, theme: "work", minutes: 5,
    title: "ಬಸ್ ನಿಲ್ದಾಣ",
    text: [
      "ಲಕ್ಷ್ಮಿ ಬಸ್ ನಿಲ್ದಾಣದಲ್ಲಿ ಫಲಕ ಓದಲು ಕಲಿತಳು.",
      "ಮೊದಲು ಅವಳು ಪ್ರತಿ ಬಾರಿ ಜನರನ್ನು ಕೇಳುತ್ತಿದ್ದಳು.",
      "ಈಗ ಅವಳೇ ಇತರರಿಗೆ ದಾರಿ ತೋರಿಸುತ್ತಾಳೆ.",
      "ಓದುವುದು ಅವಳ ದಿನವನ್ನು ಸುಲಭ ಮಾಡಿತು.",
    ],
    roman: [
      "Lakshmi bus nildanadalli phalaka odalu kalitalu.",
      "Modalu avalu prati bari janarannu keluttiddalu.",
      "Eega avale itararige daari torisuttale.",
      "Oduvudu avala dinavannu sulabha maditu.",
    ],
    gist: {
      en: "Lakshmi learns to read the bus signs and now gives directions to others.",
      hi: "लक्ष्मी बस के बोर्ड पढ़ना सीखती है और अब दूसरों को रास्ता बताती है।",
      kn: "ಲಕ್ಷ್ಮಿ ಬಸ್ ಫಲಕ ಓದಲು ಕಲಿತು, ಈಗ ಇತರರಿಗೆ ದಾರಿ ತೋರಿಸುತ್ತಾಳೆ.",
      ta: "லட்சுமி பேருந்துப் பலகைகளைப் படிக்கக் கற்று, இப்போது மற்றவர்களுக்கு வழி சொல்கிறாள்.",
      te: "లక్ష్మి బస్సు బోర్డులు చదవడం నేర్చుకుని, ఇప్పుడు ఇతరులకు దారి చూపుతుంది.",
      bn: "লক্ষ্মী বাসের বোর্ড পড়তে শিখে এখন অন্যদের পথ দেখায়।",
    },
    words: [{ w: "ಫಲಕ", r: "phalaka" }, { w: "ದಾರಿ", r: "daari" }, { w: "ಸುಲಭ", r: "sulabha" }],
    questions: [
      { q: "ಲಕ್ಷ್ಮಿ ಏನು ಓದಲು ಕಲಿತಳು?", options: ["ಫಲಕ", "ಪುಸ್ತಕ", "ಪತ್ರಿಕೆ"], answer: 0 },
      { q: "ಮೊದಲು ಅವಳು ಏನು ಮಾಡುತ್ತಿದ್ದಳು?", options: ["ಜನರನ್ನು ಕೇಳುತ್ತಿದ್ದಳು", "ಮನೆಯಲ್ಲಿ ಇರುತ್ತಿದ್ದಳು", "ನಡೆದು ಹೋಗುತ್ತಿದ್ದಳು"], answer: 0 },
      { q: "ಈಗ ಅವಳು ಏನು ಮಾಡುತ್ತಾಳೆ?", options: ["ದಾರಿ ತೋರಿಸುತ್ತಾಳೆ", "ಫಲಕ ಬರೆಯುತ್ತಾಳೆ", "ಬಸ್ ಓಡಿಸುತ್ತಾಳೆ"], answer: 0 },
    ],
  },

  // ------------------------------------------------------------------ தமிழ்
  {
    id: "ta-s1", lang: "ta", level: 1, theme: "family", minutes: 3,
    title: "பூக் கடை",
    text: [
      "மாலா தினமும் காலையில் பூ விற்கிறாள்.",
      "அவள் கடை கோயிலுக்கு அருகில் உள்ளது.",
      "பள்ளிக்குச் செல்லும் குழந்தைகள் அவளைப் பார்க்கிறார்கள்.",
      "அவள் சிரித்துக்கொண்டே வணக்கம் சொல்கிறாள்.",
    ],
    roman: [
      "Mala thinamum kaalaiyil poo virkiraal.",
      "Aval kadai koyilukku arugil ulladhu.",
      "Pallikku sellum kuzhandhaigal avalai paarkiraargal.",
      "Aval sirithukkonde vanakkam solgiraal.",
    ],
    gist: {
      en: "Mala sells flowers near the temple and greets the schoolchildren each morning.",
      hi: "माला मंदिर के पास फूल बेचती है और रोज़ बच्चों का अभिवादन करती है।",
      kn: "ಮಾಲಾ ದೇವಸ್ಥಾನದ ಬಳಿ ಹೂ ಮಾರುತ್ತಾಳೆ, ದಿನವೂ ಮಕ್ಕಳನ್ನು ಮಾತನಾಡಿಸುತ್ತಾಳೆ.",
      ta: "மாலா கோயிலருகே பூ விற்று, தினமும் பள்ளிக் குழந்தைகளை வரவேற்கிறாள்.",
      te: "మాల గుడి దగ్గర పూలు అమ్ముతూ, రోజూ పిల్లలను పలకరిస్తుంది.",
      bn: "মালা মন্দিরের কাছে ফুল বেচে আর রোজ স্কুলের শিশুদের অভিবাদন জানায়।",
    },
    words: [{ w: "பூ", r: "poo" }, { w: "கடை", r: "kadai" }, { w: "வணக்கம்", r: "vanakkam" }],
    questions: [
      { q: "மாலா என்ன விற்கிறாள்?", options: ["பூ", "பழம்", "பால்"], answer: 0 },
      { q: "அவள் கடை எங்கே உள்ளது?", options: ["கோயிலுக்கு அருகில்", "பள்ளிக்கு அருகில்", "நிலையத்தில்"], answer: 0 },
      { q: "அவள் என்ன சொல்கிறாள்?", options: ["வணக்கம்", "நன்றி", "மன்னிக்கவும்"], answer: 0 },
    ],
  },
  {
    id: "ta-s2", lang: "ta", level: 2, theme: "school", minutes: 4,
    title: "முதல் கடிதம்",
    text: [
      "ராஜு தன் அக்காவுக்குக் கடிதம் எழுதினான்.",
      "ஒவ்வொரு எழுத்தையும் மெதுவாக எழுதினான்.",
      "ஆசிரியை அதைப் பார்த்து மகிழ்ந்தார்.",
      "இப்போது வாரம் ஒரு கடிதம் எழுதுகிறான்.",
    ],
    roman: [
      "Raju than akkaavukku kadidham ezhudhinaan.",
      "Ovvoru ezhuthaiyum medhuvaaga ezhudhinaan.",
      "Aasiriyai adhai paarthu magizhndhaar.",
      "Ippodhu vaaram oru kadidham ezhudhugiraan.",
    ],
    gist: {
      en: "Raju writes his sister a letter slowly, and now writes one every week.",
      hi: "राजू अपनी बहन को धीरे-धीरे पत्र लिखता है और अब हर सप्ताह लिखता है।",
      kn: "ರಾಜು ಅಕ್ಕನಿಗೆ ನಿಧಾನವಾಗಿ ಪತ್ರ ಬರೆದು, ಈಗ ವಾರಕ್ಕೊಮ್ಮೆ ಬರೆಯುತ್ತಾನೆ.",
      ta: "ராஜு அக்காவுக்கு மெதுவாகக் கடிதம் எழுதி, இப்போது வாரம் ஒன்று எழுதுகிறான்.",
      te: "రాజు అక్కకు నెమ్మదిగా ఉత్తరం రాసి, ఇప్పుడు వారానికొకటి రాస్తాడు.",
      bn: "রাজু দিদিকে ধীরে ধীরে চিঠি লেখে, এখন সপ্তাহে একটি লেখে।",
    },
    words: [{ w: "கடிதம்", r: "kadidham" }, { w: "எழுத்து", r: "ezhuthu" }, { w: "ஆசிரியை", r: "aasiriyai" }],
    questions: [
      { q: "ராஜு யாருக்கு எழுதினான்?", options: ["அக்காவுக்கு", "அம்மாவுக்கு", "நண்பனுக்கு"], answer: 0 },
      { q: "அவன் எப்படி எழுதினான்?", options: ["மெதுவாக", "அவசரமாக", "கவனமின்றி"], answer: 0 },
      { q: "இப்போது எத்தனை முறை எழுதுகிறான்?", options: ["வாரம் ஒருமுறை", "நாளொன்றுக்கு", "வருடம் ஒருமுறை"], answer: 0 },
    ],
  },
  {
    id: "ta-s3", lang: "ta", level: 3, theme: "travel", minutes: 5,
    title: "ரயில் பயணம்",
    text: [
      "கீதா முதல் முறையாகத் தனியே ரயிலில் ஏறினாள்.",
      "ஜன்னலுக்கு வெளியே வயல்கள் பின்னோக்கி ஓடின.",
      "டிக்கெட்டில் இருந்த பெயரைக் கவனமாகப் படித்தாள்.",
      "மாலைக்குள் தன் ஊரை அடைந்தாள்.",
    ],
    roman: [
      "Geetha mudhal muraiyaaga thaniye rayilil erinaal.",
      "Jannalukku veliye vayalgal pinnokki odina.",
      "Ticketil irundha peyarai kavanamaaga padiththaal.",
      "Maalaikkul than oorai adaindhaal.",
    ],
    gist: {
      en: "Geetha rides the train alone for the first time and reads her own ticket.",
      hi: "गीता पहली बार अकेले रेल से जाती है और अपना टिकट खुद पढ़ती है।",
      kn: "ಗೀತಾ ಮೊದಲ ಬಾರಿ ಒಬ್ಬಳೇ ರೈಲಿನಲ್ಲಿ ಹೋಗಿ ತನ್ನ ಟಿಕೆಟ್ ತಾನೇ ಓದುತ್ತಾಳೆ.",
      ta: "கீதா முதல் முறையாகத் தனியே ரயிலில் சென்று தன் டிக்கெட்டைத் தானே படிக்கிறாள்.",
      te: "గీత మొదటిసారి ఒంటరిగా రైలులో వెళ్లి తన టికెట్ తానే చదువుతుంది.",
      bn: "গীতা প্রথমবার একা ট্রেনে যায় আর নিজের টিকিট নিজেই পড়ে।",
    },
    words: [{ w: "ஜன்னல்", r: "jannal" }, { w: "வயல்", r: "vayal" }, { w: "ஊர்", r: "oor" }],
    questions: [
      { q: "கீதா எதில் ஏறினாள்?", options: ["ரயிலில்", "பேருந்தில்", "படகில்"], answer: 0 },
      { q: "ஜன்னலுக்கு வெளியே என்ன தெரிந்தது?", options: ["வயல்கள்", "கடல்", "மலை"], answer: 0 },
      { q: "அவள் எப்போது ஊரை அடைந்தாள்?", options: ["மாலைக்குள்", "காலையில்", "இரவில்"], answer: 0 },
    ],
  },

  // ---------------------------------------------------------------- తెలుగు
  {
    id: "te-s1", lang: "te", level: 1, theme: "family", minutes: 3,
    title: "పూల దుకాణం",
    text: [
      "సీత ప్రతిరోజు ఉదయం పూలు అమ్ముతుంది.",
      "ఆమె దుకాణం గుడి పక్కన ఉంది.",
      "బడికి వెళ్లే పిల్లలు ఆమెను చూస్తారు.",
      "ఆమె నవ్వుతూ నమస్కారం చెబుతుంది.",
    ],
    roman: [
      "Sita pratiroju udayam poolu ammutundi.",
      "Aame dukanam gudi pakkana undi.",
      "Badiki velle pillalu aamenu choostaru.",
      "Aame navvutoo namaskaram chebutundi.",
    ],
    gist: {
      en: "Sita sells flowers beside the temple and greets the schoolchildren.",
      hi: "सीता मंदिर के पास फूल बेचती है और स्कूल जाते बच्चों का अभिवादन करती है।",
      kn: "ಸೀತಾ ಗುಡಿಯ ಪಕ್ಕ ಹೂ ಮಾರುತ್ತಾಳೆ, ಶಾಲೆಯ ಮಕ್ಕಳನ್ನು ಮಾತನಾಡಿಸುತ್ತಾಳೆ.",
      ta: "சீதா கோயிலருகே பூ விற்று, பள்ளிக் குழந்தைகளை வரவேற்கிறாள்.",
      te: "సీత గుడి పక్కన పూలు అమ్ముతూ, బడి పిల్లలను పలకరిస్తుంది.",
      bn: "সীতা মন্দিরের পাশে ফুল বেচে আর স্কুলের শিশুদের অভিবাদন জানায়।",
    },
    words: [{ w: "పూలు", r: "poolu" }, { w: "దుకాణం", r: "dukanam" }, { w: "పిల్లలు", r: "pillalu" }],
    questions: [
      { q: "సీత ఏమి అమ్ముతుంది?", options: ["పూలు", "పండ్లు", "పాలు"], answer: 0 },
      { q: "ఆమె దుకాణం ఎక్కడ ఉంది?", options: ["గుడి పక్కన", "బడి పక్కన", "స్టేషన్ పక్కన"], answer: 0 },
      { q: "ఆమె ఏమి చెబుతుంది?", options: ["నమస్కారం", "ధన్యవాదాలు", "క్షమించండి"], answer: 0 },
    ],
  },
  {
    id: "te-s2", lang: "te", level: 2, theme: "work", minutes: 4,
    title: "కొత్త ఉద్యోగం",
    text: [
      "అజయ్‌కు నగరంలో కొత్త ఉద్యోగం వచ్చింది.",
      "మొదటి రోజు అతను బస్సులో ఆఫీసుకు వెళ్లాడు.",
      "దారిలో ప్రతి బోర్డు చదవడానికి ప్రయత్నించాడు.",
      "ఇప్పుడు రోజుకు ఒక కొత్త పదం నేర్చుకుంటాడు.",
    ],
    roman: [
      "Ajay ku nagaramlo kotta udyogam vachchindi.",
      "Modati roju atanu bassulo officeku vellaadu.",
      "Daarilo prati bordu chadavadaniki prayatninchaadu.",
      "Ippudu rojuku oka kotta padam nerchukuntaadu.",
    ],
    gist: {
      en: "Ajay reads signs on his bus ride to a new city job and learns a word a day.",
      hi: "अजय नई नौकरी जाते समय बस से बोर्ड पढ़ता है और रोज़ एक शब्द सीखता है।",
      kn: "ಅಜಯ್ ಹೊಸ ಕೆಲಸಕ್ಕೆ ಹೋಗುವಾಗ ಫಲಕ ಓದಿ ದಿನಕ್ಕೊಂದು ಪದ ಕಲಿಯುತ್ತಾನೆ.",
      ta: "அஜய் புதிய வேலைக்குச் செல்லும் வழியில் பலகைகளைப் படித்து தினம் ஒரு சொல் கற்கிறான்.",
      te: "అజయ్ కొత్త ఉద్యోగానికి వెళ్లే దారిలో బోర్డులు చదివి రోజుకు ఒక పదం నేర్చుకుంటాడు.",
      bn: "অজয় নতুন চাকরিতে যাওয়ার পথে বোর্ড পড়ে আর রোজ একটি শব্দ শেখে।",
    },
    words: [{ w: "ఉద్యోగం", r: "udyogam" }, { w: "ఆఫీసు", r: "office" }, { w: "పదం", r: "padam" }],
    questions: [
      { q: "అజయ్‌కు ఉద్యోగం ఎక్కడ వచ్చింది?", options: ["నగరంలో", "పల్లెలో", "విదేశంలో"], answer: 0 },
      { q: "అతను ఆఫీసుకు ఎలా వెళ్లాడు?", options: ["బస్సులో", "కారులో", "నడిచి"], answer: 0 },
      { q: "ఇప్పుడు రోజుకు ఏమి నేర్చుకుంటాడు?", options: ["ఒక కొత్త పదం", "ఒక కొత్త పాట", "ఒక కొత్త భాష"], answer: 0 },
    ],
  },
  {
    id: "te-s3", lang: "te", level: 3, theme: "travel", minutes: 5,
    title: "రైలు ప్రయాణం",
    text: [
      "మీనా మొదటిసారి ఒంటరిగా రైలు ఎక్కింది.",
      "కిటికీ బయట పొలాలు వెనక్కి పరిగెత్తాయి.",
      "టికెట్‌పై ఉన్న పేరును జాగ్రత్తగా చదివింది.",
      "సాయంత్రానికి తన ఊరు చేరుకుంది.",
    ],
    roman: [
      "Meena modatisaari ontarigaa railu ekkindi.",
      "Kitiki bayata polaalu venakki parigettaayi.",
      "Ticket pai unna perunu jaagrattagaa chadivindi.",
      "Saayantraaniki tana ooru cherukundi.",
    ],
    gist: {
      en: "Meena travels alone by train for the first time and reads her ticket herself.",
      hi: "मीना पहली बार अकेले रेल से जाती है और अपना टिकट खुद पढ़ती है।",
      kn: "ಮೀನಾ ಮೊದಲ ಬಾರಿ ಒಬ್ಬಳೇ ರೈಲಿನಲ್ಲಿ ಪ್ರಯಾಣಿಸಿ ಟಿಕೆಟ್ ತಾನೇ ಓದುತ್ತಾಳೆ.",
      ta: "மீனா முதல் முறையாகத் தனியே ரயிலில் பயணித்து டிக்கெட்டைத் தானே படிக்கிறாள்.",
      te: "మీనా మొదటిసారి ఒంటరిగా రైలులో ప్రయాణించి టికెట్ తానే చదువుతుంది.",
      bn: "মীনা প্রথমবার একা ট্রেনে যায় আর নিজের টিকিট নিজেই পড়ে।",
    },
    words: [{ w: "కిటికీ", r: "kitiki" }, { w: "పొలం", r: "polam" }, { w: "ఊరు", r: "ooru" }],
    questions: [
      { q: "మీనా దేనిలో ప్రయాణించింది?", options: ["రైలులో", "బస్సులో", "పడవలో"], answer: 0 },
      { q: "కిటికీ బయట ఏమి కనిపించాయి?", options: ["పొలాలు", "సముద్రం", "కొండలు"], answer: 0 },
      { q: "ఆమె ఎప్పుడు ఊరు చేరింది?", options: ["సాయంత్రానికి", "ఉదయం", "రాత్రి"], answer: 0 },
    ],
  },

  // ----------------------------------------------------------------- বাংলা
  {
    id: "bn-s1", lang: "bn", level: 1, theme: "family", minutes: 3,
    title: "চায়ের দোকান",
    text: [
      "রমা রোজ সকালে চা বানায়।",
      "তার ছোট দোকান স্টেশনের পাশে।",
      "সকাল ছটায় প্রথম খদ্দের আসে।",
      "সে হেসে বলে, নমস্কার!",
    ],
    roman: [
      "Roma roj sokale cha banay.",
      "Taar chhoto dokan stationer pashe.",
      "Sokal chhotay prothom khoddher ashe.",
      "Se hese bole, nomoshkar!",
    ],
    gist: {
      en: "Roma runs a small tea stall by the station and greets her first customer at six.",
      hi: "रमा स्टेशन के पास चाय की छोटी दुकान चलाती है और छह बजे पहले ग्राहक का स्वागत करती है।",
      kn: "ರಮಾ ನಿಲ್ದಾಣದ ಬಳಿ ಚಹಾ ಅಂಗಡಿ ನಡೆಸುತ್ತಾಳೆ, ಆರು ಗಂಟೆಗೆ ಮೊದಲ ಗ್ರಾಹಕನನ್ನು ಸ್ವಾಗತಿಸುತ್ತಾಳೆ.",
      ta: "ரமா நிலையம் அருகே தேநீர்க் கடை நடத்துகிறாள், ஆறு மணிக்கு முதல் வாடிக்கையாளரை வரவேற்கிறாள்.",
      te: "రమ స్టేషన్ దగ్గర టీ దుకాణం నడుపుతూ, ఆరు గంటలకు మొదటి కస్టమర్‌ను పలకరిస్తుంది.",
      bn: "রমা স্টেশনের পাশে চায়ের দোকান চালায়, ছটায় প্রথম খদ্দেরকে স্বাগত জানায়।",
    },
    words: [{ w: "চা", r: "cha" }, { w: "দোকান", r: "dokan" }, { w: "খদ্দের", r: "khoddher" }],
    questions: [
      { q: "রমা কী বানায়?", options: ["চা", "রুটি", "দুধ"], answer: 0 },
      { q: "তার দোকান কোথায়?", options: ["স্টেশনের পাশে", "গ্রামে", "স্কুলে"], answer: 0 },
      { q: "প্রথম খদ্দের কখন আসে?", options: ["ছটায়", "আটটায়", "দশটায়"], answer: 0 },
    ],
  },
  {
    id: "bn-s2", lang: "bn", level: 2, theme: "school", minutes: 4,
    title: "প্রথম চিঠি",
    text: [
      "রবি তার দিদিকে চিঠি লিখল।",
      "প্রতিটি অক্ষর সে ধীরে ধীরে লিখল।",
      "শিক্ষিকা সেটা দেখে খুশি হলেন।",
      "এখন রবি সপ্তাহে একটি চিঠি লেখে।",
    ],
    roman: [
      "Robi taar didike chithi likhlo.",
      "Protiti okkhor she dhire dhire likhlo.",
      "Shikkhika sheta dekhe khushi holen.",
      "Ekhon Robi shoptahe ekti chithi lekhe.",
    ],
    gist: {
      en: "Robi writes his sister a careful letter, and now writes one every week.",
      hi: "रवि अपनी दीदी को ध्यान से पत्र लिखता है और अब हर सप्ताह लिखता है।",
      kn: "ರಬಿ ಅಕ್ಕನಿಗೆ ಜಾಗರೂಕತೆಯಿಂದ ಪತ್ರ ಬರೆದು, ಈಗ ವಾರಕ್ಕೊಮ್ಮೆ ಬರೆಯುತ್ತಾನೆ.",
      ta: "ரபி அக்காவுக்குக் கவனமாகக் கடிதம் எழுதி, இப்போது வாரம் ஒன்று எழுதுகிறான்.",
      te: "రబి అక్కకు జాగ్రత్తగా ఉత్తరం రాసి, ఇప్పుడు వారానికొకటి రాస్తాడు.",
      bn: "রবি দিদিকে যত্ন করে চিঠি লেখে, এখন সপ্তাহে একটি লেখে।",
    },
    words: [{ w: "চিঠি", r: "chithi" }, { w: "অক্ষর", r: "okkhor" }, { w: "শিক্ষিকা", r: "shikkhika" }],
    questions: [
      { q: "রবি কাকে চিঠি লিখল?", options: ["দিদিকে", "মাকে", "বন্ধুকে"], answer: 0 },
      { q: "সে কীভাবে লিখল?", options: ["ধীরে ধীরে", "তাড়াহুড়ো করে", "অযত্নে"], answer: 0 },
      { q: "এখন কত ঘন ঘন লেখে?", options: ["সপ্তাহে একবার", "দিনে একবার", "বছরে একবার"], answer: 0 },
    ],
  },
  {
    id: "bn-s3", lang: "bn", level: 3, theme: "work", minutes: 5,
    title: "বাস স্ট্যান্ড",
    text: [
      "লক্ষ্মী বাস স্ট্যান্ডে বোর্ড পড়তে শিখল।",
      "আগে সে প্রতিবার লোকজনকে জিজ্ঞেস করত।",
      "এখন সে নিজেই অন্যদের পথ দেখায়।",
      "পড়তে পারা তার দিনটা সহজ করে দিল।",
    ],
    roman: [
      "Lokkhi bus standee board porte shikhlo.",
      "Aage she protibar lokjonke jiggesh korto.",
      "Ekhon she nijei onnoder poth dekhay.",
      "Porte para taar dinta shohoj kore dilo.",
    ],
    gist: {
      en: "Lokkhi learns to read the bus signs and now gives directions to others.",
      hi: "लक्ष्मी बस के बोर्ड पढ़ना सीखती है और अब दूसरों को रास्ता बताती है।",
      kn: "ಲಕ್ಷ್ಮಿ ಬಸ್ ಫಲಕ ಓದಲು ಕಲಿತು, ಈಗ ಇತರರಿಗೆ ದಾರಿ ತೋರಿಸುತ್ತಾಳೆ.",
      ta: "லட்சுமி பேருந்துப் பலகைகளைப் படிக்கக் கற்று, இப்போது மற்றவர்களுக்கு வழி சொல்கிறாள்.",
      te: "లక్ష్మి బస్సు బోర్డులు చదవడం నేర్చుకుని, ఇప్పుడు ఇతరులకు దారి చూపుతుంది.",
      bn: "লক্ষ্মী বাসের বোর্ড পড়তে শিখে এখন অন্যদের পথ দেখায়।",
    },
    words: [{ w: "বোর্ড", r: "board" }, { w: "পথ", r: "poth" }, { w: "সহজ", r: "shohoj" }],
    questions: [
      { q: "লক্ষ্মী কী পড়তে শিখল?", options: ["বোর্ড", "বই", "খবরের কাগজ"], answer: 0 },
      { q: "আগে সে কী করত?", options: ["লোকজনকে জিজ্ঞেস করত", "বাড়িতে থাকত", "হেঁটে যেত"], answer: 0 },
      { q: "এখন সে কী করে?", options: ["অন্যদের পথ দেখায়", "বোর্ড লেখে", "বাস চালায়"], answer: 0 },
    ],
  },

  // --------------------------------------------------------------- English
  {
    id: "en-s1", lang: "en", level: 1, theme: "family", minutes: 3,
    title: "The tea stall",
    text: [
      "Rama makes tea every morning.",
      "Her small stall is near the station.",
      "The first customer comes at six.",
      "She smiles and says hello.",
    ],
    roman: ["", "", "", ""],
    gist: {
      en: "Rama runs a small tea stall by the station and greets her first customer at six.",
      hi: "रमा स्टेशन के पास चाय की छोटी दुकान चलाती है और छह बजे पहले ग्राहक का स्वागत करती है।",
      kn: "ರಮಾ ನಿಲ್ದಾಣದ ಬಳಿ ಚಹಾ ಅಂಗಡಿ ನಡೆಸುತ್ತಾಳೆ, ಆರು ಗಂಟೆಗೆ ಮೊದಲ ಗ್ರಾಹಕನನ್ನು ಸ್ವಾಗತಿಸುತ್ತಾಳೆ.",
      ta: "ரமா நிலையம் அருகே தேநீர்க் கடை நடத்துகிறாள், ஆறு மணிக்கு முதல் வாடிக்கையாளரை வரவேற்கிறாள்.",
      te: "రమ స్టేషన్ దగ్గర టీ దుకాణం నడుపుతూ, ఆరు గంటలకు మొదటి కస్టమర్‌ను పలకరిస్తుంది.",
      bn: "রমা স্টেশনের পাশে চায়ের দোকান চালায়, ছটায় প্রথম খদ্দেরকে স্বাগত জানায়।",
    },
    words: [{ w: "stall", r: "" }, { w: "customer", r: "" }, { w: "morning", r: "" }],
    questions: [
      { q: "What does Rama make?", options: ["Tea", "Bread", "Milk"], answer: 0 },
      { q: "Where is her stall?", options: ["Near the station", "In a village", "At a school"], answer: 0 },
      { q: "When does the first customer come?", options: ["At six", "At eight", "At ten"], answer: 0 },
    ],
  },
  {
    id: "en-s2", lang: "en", level: 2, theme: "work", minutes: 4,
    title: "A new job",
    text: [
      "Ajay found a new job in the city.",
      "On the first day he took the bus.",
      "On the way he tried to read every sign.",
      "Now he learns one new word a day.",
    ],
    roman: ["", "", "", ""],
    gist: {
      en: "Ajay reads street signs on his bus ride to work and learns a word a day.",
      hi: "अजय दफ़्तर जाते समय बस से बोर्ड पढ़ता है और रोज़ एक शब्द सीखता है।",
      kn: "ಅಜಯ್ ಕೆಲಸಕ್ಕೆ ಹೋಗುವಾಗ ಫಲಕ ಓದಿ ದಿನಕ್ಕೊಂದು ಪದ ಕಲಿಯುತ್ತಾನೆ.",
      ta: "அஜய் வேலைக்குச் செல்லும் பேருந்தில் பலகைகளைப் படித்து தினம் ஒரு சொல் கற்கிறான்.",
      te: "అజయ్ ఆఫీసుకు వెళ్లే బస్సులో బోర్డులు చదివి రోజుకు ఒక పదం నేర్చుకుంటాడు.",
      bn: "অজয় অফিসে যাওয়ার বাসে বোর্ড পড়ে আর রোজ একটি শব্দ শেখে।",
    },
    words: [{ w: "job", r: "" }, { w: "sign", r: "" }, { w: "word", r: "" }],
    questions: [
      { q: "Where did Ajay find work?", options: ["In the city", "In a village", "Abroad"], answer: 0 },
      { q: "How did he get to the office?", options: ["By bus", "By car", "On foot"], answer: 0 },
      { q: "What does he learn each day?", options: ["One new word", "One new song", "One new language"], answer: 0 },
    ],
  },
  {
    id: "en-s3", lang: "en", level: 3, theme: "travel", minutes: 5,
    title: "The train",
    text: [
      "Meena took the train alone for the first time.",
      "Outside the window the fields ran backwards.",
      "She read the name on her ticket carefully.",
      "By evening she reached her village.",
    ],
    roman: ["", "", "", ""],
    gist: {
      en: "Meena travels alone by train for the first time and reads her own ticket.",
      hi: "मीना पहली बार अकेले रेल से जाती है और अपना टिकट खुद पढ़ती है।",
      kn: "ಮೀನಾ ಮೊದಲ ಬಾರಿ ಒಬ್ಬಳೇ ರೈಲಿನಲ್ಲಿ ಪ್ರಯಾಣಿಸಿ ಟಿಕೆಟ್ ತಾನೇ ಓದುತ್ತಾಳೆ.",
      ta: "மீனா முதல் முறையாகத் தனியே ரயிலில் பயணித்து டிக்கெட்டைத் தானே படிக்கிறாள்.",
      te: "మీనా మొదటిసారి ఒంటరిగా రైలులో ప్రయాణించి టికెట్ తానే చదువుతుంది.",
      bn: "মীনা প্রথমবার একা ট্রেনে যায় আর নিজের টিকিট নিজেই পড়ে।",
    },
    words: [{ w: "window", r: "" }, { w: "ticket", r: "" }, { w: "village", r: "" }],
    questions: [
      { q: "How did Meena travel?", options: ["By train", "By bus", "By boat"], answer: 0 },
      { q: "What did she see outside?", options: ["Fields", "The sea", "Mountains"], answer: 0 },
      { q: "When did she arrive?", options: ["By evening", "In the morning", "At night"], answer: 0 },
    ],
  },
];

/** Stories for one script, easiest first. */
export function storiesFor(langId) {
  return STORIES.filter((s) => s.lang === langId).sort((a, b) => a.level - b.level);
}

export function storyById(id) {
  return STORIES.find((s) => s.id === id) || null;
}
