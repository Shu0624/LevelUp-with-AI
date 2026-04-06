import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift, ExternalLink, ChevronDown, ChevronUp,
  GraduationCap, Code2, Laptop, Wallet, Mail,
  Sparkles, Tag, Star, CheckCircle2
} from 'lucide-react';

// =====================================================================
// CURATED BENEFITS DATA
// =====================================================================
const SECTIONS = [
  {
    id: 'discounts',
    title: 'Student Discounts & Free Tools',
    icon: Gift,
    color: '#6366f1',
    description: 'Access premium tools completely free with your student email.',
    items: [
      {
        name: 'GitHub Student Developer Pack',
        provider: 'GitHub',
        emoji: '🐙',
        description: 'Get 100+ free developer tools including domains, cloud credits, CI/CD, design tools, and more.',
        value: 'Worth $200K+ in tools',
        link: 'https://education.github.com/pack',
        highlights: ['Free .me domain', 'Azure $100 credits', 'JetBrains IDEs', 'Canva Pro', 'Namecheap domains'],
      },
      {
        name: 'JetBrains All Products Pack',
        provider: 'JetBrains',
        emoji: '🧠',
        description: 'Full access to IntelliJ IDEA, PyCharm, WebStorm, and all JetBrains professional IDEs.',
        value: 'Free (normally ₹50K+/year)',
        link: 'https://www.jetbrains.com/community/education/',
        highlights: ['IntelliJ IDEA Ultimate', 'PyCharm Professional', 'WebStorm', 'DataGrip'],
      },
      {
        name: 'Figma Education',
        provider: 'Figma',
        emoji: '🎨',
        description: 'Full Figma Professional plan free for students and educators. Design, prototype, and collaborate.',
        value: 'Free (normally $12/mo)',
        link: 'https://www.figma.com/education/',
        highlights: ['Unlimited files', 'Professional features', 'Team collaboration', 'Dev mode'],
      },
      {
        name: 'Azure for Students',
        provider: 'Microsoft',
        emoji: '☁️',
        description: 'Get $100 in Azure credits, free services for 12 months, and 25+ always-free services.',
        value: '$100 Azure credits',
        link: 'https://azure.microsoft.com/en-us/free/students/',
        highlights: ['$100 credits', 'No credit card needed', '25+ free services', 'AI & ML services'],
      },
      {
        name: 'Google Cloud for Students',
        provider: 'Google',
        emoji: '🌐',
        description: 'Access Google Cloud credits, free labs via Qwiklabs, and cloud certifications at discounted rates.',
        value: '$300 in credits',
        link: 'https://cloud.google.com/edu/',
        highlights: ['Cloud credits', 'Free labs', 'Cert discounts', 'BigQuery free tier'],
      },
      {
        name: 'Notion for Education',
        provider: 'Notion',
        emoji: '📓',
        description: 'Free Notion Plus plan for students — unlimited blocks, file uploads, and collaboration features.',
        value: 'Free (normally $8/mo)',
        link: 'https://www.notion.so/students',
        highlights: ['Unlimited blocks', 'Collaboration', 'AI assistant', 'Templates'],
      },
      {
        name: 'Canva Pro for Students',
        provider: 'Canva',
        emoji: '🖌️',
        description: 'Premium design tool with 100M+ graphics, brand kits, Magic Resize, background remover, and more.',
        value: 'Free (normally ₹4K/year)',
        link: 'https://www.canva.com/education/',
        highlights: ['100M+ graphics', 'Brand kit', 'Background remover', 'AI tools'],
      },
      {
        name: 'Spotify Student',
        provider: 'Spotify',
        emoji: '🎵',
        description: 'Spotify Premium at half price. Includes ad-free music, offline downloads, and podcast access.',
        value: '₹59/mo (50% off)',
        link: 'https://www.spotify.com/student/',
        highlights: ['Ad-free music', 'Offline downloads', 'High quality audio', '50% discount'],
      },
      {
        name: 'Amazon Prime Student',
        provider: 'Amazon',
        emoji: '📦',
        description: 'Half-price Amazon Prime membership with free delivery, Prime Video, and exclusive student deals.',
        value: '₹749/year (50% off)',
        link: 'https://www.amazon.in/primestudent',
        highlights: ['Free delivery', 'Prime Video', 'Student deals', '50% off'],
      },
    ],
  },
  {
    id: 'email',
    title: 'How to Get a Student Email (.edu)',
    icon: Mail,
    color: '#22c55e',
    description: 'Your gateway to all student discounts and benefits.',
    items: [
      {
        name: 'Check with Your College IT Department',
        emoji: '🏫',
        description: 'Most Indian engineering colleges provide institutional email addresses (e.g., name@college.edu.in). Visit your IT department, academic office, or check your student portal.',
        highlights: ['Most colleges issue emails during admission', 'Check your student ERP/portal', 'Contact IT helpdesk if not issued', 'Usually format: rollno@college.edu.in'],
      },
      {
        name: 'Verify Student Status on Platforms',
        emoji: '✅',
        description: 'Each platform has its own verification process. Most accept college email, student ID upload, or integration with SheerID.',
        highlights: ['GitHub: Upload student ID + college email', 'JetBrains: College email or ISIC card', 'Microsoft: Auto-verified .edu email', 'Spotify: SheerID verification'],
      },
      {
        name: 'Benefits of a .edu Email',
        emoji: '🎁',
        description: 'A student email unlocks thousands of dollars worth of free software, cloud credits, and exclusive deals.',
        highlights: ['Free developer tools worth $200K+', 'Cloud credits from AWS, Azure, GCP', 'Discounts on software & subscriptions', 'Access to academic research papers'],
      },
    ],
  },
  {
    id: 'coding',
    title: 'Coding Platform Deals',
    icon: Code2,
    color: '#f59e0b',
    description: 'Maximize your learning while minimizing costs.',
    items: [
      {
        name: 'LeetCode Premium',
        emoji: '💻',
        description: 'Premium access to 3000+ problems with solutions, company-wise questions, and mock interviews.',
        value: 'Student pricing available',
        link: 'https://leetcode.com/subscribe/',
        highlights: ['Company-wise problems', 'Video solutions', 'Mock interviews', 'Contest rankings'],
      },
      {
        name: 'Coursera Financial Aid',
        emoji: '📚',
        description: '100% financial aid available for all courses and specializations. Apply with a short essay explaining your financial situation.',
        value: 'Free (with financial aid)',
        link: 'https://www.coursera.org/financial-aid',
        highlights: ['100% fee waiver', 'Verified certificates', 'All courses eligible', 'Takes 15 days to approve'],
      },
      {
        name: 'Udemy Strategies',
        emoji: '🎓',
        description: 'Never pay full price on Udemy. Courses regularly go on sale at ₹299–₹499. Use incognito mode for new user deals.',
        highlights: ['Wait for sales (monthly)', 'Use incognito for ₹299 deals', 'Check coupon sites', 'Free courses available too'],
      },
      {
        name: 'freeCodeCamp',
        emoji: '🏕️',
        description: 'Completely free, full-stack web development curriculum with certifications. No strings attached.',
        value: 'Completely Free',
        link: 'https://www.freecodecamp.org/',
        highlights: ['10+ certifications free', 'Full-stack curriculum', 'Active community', 'Real-world projects'],
      },
    ],
  },
  {
    id: 'laptops',
    title: 'Best Laptops for Students (2025)',
    icon: Laptop,
    color: '#8b5cf6',
    description: 'Curated recommendations by budget and use case.',
    items: [
      {
        name: 'Budget (₹30K–50K)',
        emoji: '💰',
        description: 'Best value picks for coding, web browsing, and basic development.',
        highlights: [
          'Acer Aspire 15 — i5-1235U, 8GB, 512GB SSD (~₹38K)',
          'HP 15s — Ryzen 5 5500U, 8GB, 512GB SSD (~₹40K)',
          'Lenovo IdeaPad Slim 3 — i5-1335U, 8GB (~₹42K)',
          '✅ Great for: Web Dev, Python, Java, DSA practice',
        ],
      },
      {
        name: 'Mid-Range (₹50K–80K)',
        emoji: '⚡',
        description: 'Balanced performance for multi-tasking, Docker, and moderate development.',
        highlights: [
          'ASUS Vivobook 15 OLED — i7-13700H, 16GB (~₹62K)',
          'Lenovo IdeaPad 5 Pro — Ryzen 7 7730U, 16GB OLED (~₹65K)',
          'Acer Aspire 5 — i7-12650H, 16GB, 512GB (~₹58K)',
          '✅ Best for: Full-stack dev, Docker, Android Studio',
        ],
      },
      {
        name: 'Professional (₹80K–1.2L)',
        emoji: '🚀',
        description: 'For serious development, ML workloads, and professional use.',
        highlights: [
          'MacBook Air M3 — 16GB, 256GB (~₹95K education)',
          'ASUS Zenbook 14 OLED — Intel Ultra 7, 16GB (~₹85K)',
          'Lenovo ThinkPad E14 Gen 5 — i7, 16GB (~₹82K)',
          '✅ Best for: ML/AI, iOS dev, heavy IDEs, VMs',
        ],
      },
      {
        name: 'Earning Setup (₹1.2L+)',
        emoji: '💎',
        description: 'For freelancing, ML training, video editing, and professional work.',
        highlights: [
          'MacBook Pro M3 Pro — 18GB, 512GB (~₹1.6L)',
          'ASUS ROG Zephyrus G14 — Ryzen 9, RTX 4060 (~₹1.4L)',
          'Dell XPS 15 — i9, 32GB, RTX 4060 (~₹1.5L)',
          '✅ Best for: Freelancing, ML training, video editing',
        ],
      },
    ],
  },
  {
    id: 'earning',
    title: 'Student Earning Opportunities',
    icon: Wallet,
    color: '#f43f5e',
    description: 'Start earning while in college. No degree required.',
    items: [
      {
        name: 'Freelancing Platforms',
        emoji: '💼',
        description: 'Build websites, apps, and scripts for clients worldwide. Start small and build your portfolio.',
        link: 'https://www.fiverr.com/',
        highlights: [
          'Fiverr — Start from ₹500/gig, scale to ₹50K+',
          'Upwork — Hourly or fixed-price contracts',
          'Toptal — Premium ($60-200/hr) after screening',
          '💡 Start: WordPress sites, API integrations, React apps',
        ],
      },
      {
        name: 'Open Source Contributions',
        emoji: '🌟',
        description: 'Get paid to contribute to open source. Programs like GSoC, MLH Fellowship, and Outreachy offer stipends.',
        highlights: [
          'Google Summer of Code — $1500–$6600',
          'MLH Fellowship — $5000 for 12 weeks',
          'Outreachy — $7000 for 3 months',
          'LFX Mentorship — $3000–$6600',
        ],
      },
      {
        name: 'Technical Writing',
        emoji: '✍️',
        description: 'Write technical articles and tutorials for money. Many platforms pay per article.',
        highlights: [
          'Dev.to — Build audience, get sponsorships',
          'Medium Partner Program — Earn per read',
          'freeCodeCamp — Exposure to 1M+ readers',
          'DigitalOcean — $300-400 per tutorial',
        ],
      },
      {
        name: 'Campus Ambassador Stipends',
        emoji: '🏫',
        description: 'Represent tech companies at your college and earn monthly stipends, merchandise, and certificates.',
        highlights: [
          'GeeksforGeeks — Monthly stipend + premium access',
          'Coding Ninjas — ₹2K-5K/month + courses',
          'Internshala — Per-referral rewards',
          'Various startups — ₹3K-10K/month',
        ],
      },
    ],
  },
];

const Benefits = () => {
  const [openSection, setOpenSection] = useState('discounts');
  const [expandedItem, setExpandedItem] = useState(null);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative">
      {/* BG */}
      <div className="absolute top-40 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] -z-10 pointer-events-none" />

      {/* Header */}
      <header className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
          <GraduationCap size={14} /> Student Benefits
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3">
          Discounts, Free Tools & Earning Guides
        </h1>
        <p className="text-muted-foreground text-base">
          Unlock thousands of rupees worth of free software, platform discounts, and earning opportunities — all available to you as a student.
        </p>
      </header>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {SECTIONS.map(section => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => { setOpenSection(section.id); setExpandedItem(null); }}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
                openSection === section.id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-border/50'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{section.title.split('(')[0].split('&')[0].trim()}</span>
              <span className="sm:hidden">{section.title.split(' ').slice(0, 2).join(' ')}</span>
            </button>
          );
        })}
      </div>

      {/* Active Section Content */}
      {SECTIONS.filter(s => s.id === openSection).map(section => {
        const Icon = section.icon;
        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Section Header */}
            <div className="glass-morphism p-6 flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${section.color}15`, color: section.color }}
              >
                <Icon size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>
            </div>

            {/* Items */}
            <div className="grid grid-cols-1 gap-3">
              {section.items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-morphism overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedItem(expandedItem === `${section.id}-${i}` ? null : `${section.id}-${i}`)}
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{item.emoji}</span>
                      <div>
                        <h3 className="font-bold text-foreground text-sm">{item.name}</h3>
                        {item.provider && (
                          <p className="text-xs text-muted-foreground">{item.provider}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.value && (
                        <span className="hidden sm:block px-3 py-1 rounded-full text-xs font-bold bg-success/10 text-success border border-success/20">
                          {item.value}
                        </span>
                      )}
                      {expandedItem === `${section.id}-${i}` ? (
                        <ChevronUp size={18} className="text-muted-foreground" />
                      ) : (
                        <ChevronDown size={18} className="text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedItem === `${section.id}-${i}` && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 border-t border-border/30 space-y-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>

                          {item.highlights && (
                            <div className="space-y-2">
                              {item.highlights.map((h, j) => (
                                <div key={j} className="flex items-start gap-2 text-sm text-foreground">
                                  <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
                                  <span>{h}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                            >
                              <ExternalLink size={14} /> Visit Website
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Benefits;
