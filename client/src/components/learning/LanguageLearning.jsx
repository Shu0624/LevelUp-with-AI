import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Volume2, ChevronDown, ChevronUp, Languages } from 'lucide-react';

// =====================================================================
// LANGUAGE DATA — Alphabets & Phrases
// =====================================================================
const LANGUAGES = {
  french: { name: 'French', flag: '🇫🇷', code: 'fr-FR' },
  german: { name: 'German', flag: '🇩🇪', code: 'de-DE' },
  japanese: { name: 'Japanese', flag: '🇯🇵', code: 'ja-JP' },
  chinese: { name: 'Chinese', flag: '🇨🇳', code: 'zh-CN' },
};

// English alphabet mapped to other scripts
const ALPHABET_MAP = [
  { en: 'A', french: 'A (ah)', german: 'A (ah)', japanese: 'あ (a)', chinese: '啊 (ā)' },
  { en: 'B', french: 'B (bé)', german: 'B (beh)', japanese: 'ば (ba)', chinese: '八 (bā)' },
  { en: 'C', french: 'C (cé)', german: 'C (tseh)', japanese: 'か (ka)', chinese: '吃 (chī)' },
  { en: 'D', french: 'D (dé)', german: 'D (deh)', japanese: 'だ (da)', chinese: '大 (dà)' },
  { en: 'E', french: 'E (euh)', german: 'E (eh)', japanese: 'え (e)', chinese: '饿 (è)' },
  { en: 'F', french: 'F (effe)', german: 'F (eff)', japanese: 'ふ (fu)', chinese: '发 (fā)' },
  { en: 'G', french: 'G (gé)', german: 'G (geh)', japanese: 'が (ga)', chinese: '个 (gè)' },
  { en: 'H', french: 'H (ache)', german: 'H (ha)', japanese: 'は (ha)', chinese: '好 (hǎo)' },
  { en: 'I', french: 'I (ee)', german: 'I (ih)', japanese: 'い (i)', chinese: '一 (yī)' },
  { en: 'J', french: 'J (ji)', german: 'J (yot)', japanese: 'じ (ji)', chinese: '几 (jǐ)' },
  { en: 'K', french: 'K (ka)', german: 'K (ka)', japanese: 'き (ki)', chinese: '可 (kě)' },
  { en: 'L', french: 'L (elle)', german: 'L (ell)', japanese: 'ら (ra)', chinese: '了 (le)' },
  { en: 'M', french: 'M (emme)', german: 'M (emm)', japanese: 'ま (ma)', chinese: '吗 (ma)' },
  { en: 'N', french: 'N (enne)', german: 'N (enn)', japanese: 'な (na)', chinese: '你 (nǐ)' },
  { en: 'O', french: 'O (oh)', german: 'O (oh)', japanese: 'お (o)', chinese: '哦 (ó)' },
  { en: 'P', french: 'P (pé)', german: 'P (peh)', japanese: 'ぱ (pa)', chinese: '皮 (pí)' },
  { en: 'Q', french: 'Q (ku)', german: 'Q (ku)', japanese: 'きゅ (kyu)', chinese: '七 (qī)' },
  { en: 'R', french: 'R (erre)', german: 'R (err)', japanese: 'り (ri)', chinese: '人 (rén)' },
  { en: 'S', french: 'S (esse)', german: 'S (ess)', japanese: 'さ (sa)', chinese: '三 (sān)' },
  { en: 'T', french: 'T (té)', german: 'T (teh)', japanese: 'た (ta)', chinese: '他 (tā)' },
  { en: 'U', french: 'U (u)', german: 'U (uh)', japanese: 'う (u)', chinese: '优 (yōu)' },
  { en: 'V', french: 'V (vé)', german: 'V (fau)', japanese: 'ぶ (bu)', chinese: '威 (wēi)' },
  { en: 'W', french: 'W (double vé)', german: 'W (veh)', japanese: 'わ (wa)', chinese: '我 (wǒ)' },
  { en: 'X', french: 'X (iks)', german: 'X (iks)', japanese: 'くす (kusu)', chinese: '小 (xiǎo)' },
  { en: 'Y', french: 'Y (i grec)', german: 'Y (üpsilon)', japanese: 'や (ya)', chinese: '也 (yě)' },
  { en: 'Z', french: 'Z (zède)', german: 'Z (tsett)', japanese: 'ざ (za)', chinese: '在 (zài)' },
];

const PHRASES = [
  {
    english: 'Hello',
    french: 'Bonjour',
    german: 'Hallo',
    japanese: 'こんにちは (Konnichiwa)',
    chinese: '你好 (Nǐ hǎo)',
  },
  {
    english: 'Thank you',
    french: 'Merci',
    german: 'Danke',
    japanese: 'ありがとう (Arigatou)',
    chinese: '谢谢 (Xièxie)',
  },
  {
    english: 'Good morning',
    french: 'Bonjour',
    german: 'Guten Morgen',
    japanese: 'おはよう (Ohayou)',
    chinese: '早上好 (Zǎoshang hǎo)',
  },
  {
    english: 'How are you?',
    french: 'Comment allez-vous?',
    german: 'Wie geht es Ihnen?',
    japanese: 'お元気ですか (Ogenki desu ka)',
    chinese: '你好吗 (Nǐ hǎo ma)',
  },
  {
    english: 'My name is...',
    french: 'Je m\'appelle...',
    german: 'Ich heiße...',
    japanese: '私の名前は... (Watashi no namae wa...)',
    chinese: '我叫... (Wǒ jiào...)',
  },
  {
    english: 'Please',
    french: 'S\'il vous plaît',
    german: 'Bitte',
    japanese: 'お願いします (Onegaishimasu)',
    chinese: '请 (Qǐng)',
  },
  {
    english: 'Excuse me',
    french: 'Excusez-moi',
    german: 'Entschuldigung',
    japanese: 'すみません (Sumimasen)',
    chinese: '对不起 (Duìbùqǐ)',
  },
  {
    english: 'Goodbye',
    french: 'Au revoir',
    german: 'Auf Wiedersehen',
    japanese: 'さようなら (Sayounara)',
    chinese: '再见 (Zàijiàn)',
  },
];

const LanguageLearning = () => {
  const [selectedLang, setSelectedLang] = useState('french');
  const [activeSection, setActiveSection] = useState('phrases');
  const [isOpen, setIsOpen] = useState(false);

  const speak = (text, langCode) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // Extract the part before parentheses for pronunciation
    const cleanText = text.replace(/\(.*\)/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langCode;
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="mt-12">
      {/* Toggle Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass-morphism p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <Languages size={22} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-foreground">Foreign Language Corner</h3>
            <p className="text-xs text-muted-foreground">Learn basic alphabets & phrases in 4 languages</p>
          </div>
        </div>
        {isOpen ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-morphism rounded-t-none p-6 space-y-6 border-t-0">
              {/* Language Selector */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(LANGUAGES).map(([key, lang]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedLang(key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      selectedLang === key
                        ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                        : 'bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-border/50'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span> {lang.name}
                  </button>
                ))}
              </div>

              {/* Section Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveSection('phrases')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeSection === 'phrases' ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  📝 Basic Phrases
                </button>
                <button
                  onClick={() => setActiveSection('alphabet')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeSection === 'alphabet' ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  🔤 Alphabet Map
                </button>
              </div>

              {/* Phrases Section */}
              {activeSection === 'phrases' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PHRASES.map((phrase, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="p-4 rounded-2xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {phrase.english}
                        </p>
                        <button
                          onClick={() => speak(phrase[selectedLang], LANGUAGES[selectedLang].code)}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                          title="Listen"
                        >
                          <Volume2 size={14} />
                        </button>
                      </div>
                      <p className="text-lg font-bold text-foreground">
                        {phrase[selectedLang]}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Alphabet Section */}
              {activeSection === 'alphabet' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-3 px-3 text-left text-xs font-bold text-muted-foreground uppercase">English</th>
                        <th className="py-3 px-3 text-left text-xs font-bold text-muted-foreground uppercase">
                          {LANGUAGES[selectedLang].flag} {LANGUAGES[selectedLang].name}
                        </th>
                        <th className="py-3 px-3 text-center text-xs font-bold text-muted-foreground uppercase">🔊</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ALPHABET_MAP.map((row, i) => (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-border/20 hover:bg-secondary/30 transition-colors"
                        >
                          <td className="py-2.5 px-3 font-black text-lg text-primary">{row.en}</td>
                          <td className="py-2.5 px-3 font-bold text-foreground">{row[selectedLang]}</td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => speak(row[selectedLang], LANGUAGES[selectedLang].code)}
                              className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Volume2 size={14} />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageLearning;
