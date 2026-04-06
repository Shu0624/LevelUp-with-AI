import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, ExternalLink, Calendar, Award, Tag, Search,
  Sparkles, Users, Briefcase, GraduationCap, Filter
} from 'lucide-react';

// =====================================================================
// CURATED MNC PROGRAMS DATA
// =====================================================================
const PROGRAMS = [
  {
    id: 1,
    title: 'Google Student Developer Club Lead',
    company: 'Google',
    logo: '🟢',
    color: '#4285f4',
    description: 'Lead a university-based community of developers. Get training, mentorship, and swag from Google. Organize workshops, study jams, and hackathons for your campus.',
    deadline: 'Applications open annually (Aug–Sep)',
    duration: '1 Academic Year',
    link: 'https://developers.google.com/community/gdsc',
    tags: ['Free', 'Certificate', 'Networking', 'Leadership'],
    eligibility: 'Enrolled university students passionate about technology',
    benefits: ['Google swag & resources', 'Direct mentorship from Google', 'Global community access', 'Conference invites'],
  },
  {
    id: 2,
    title: 'Microsoft Learn Student Ambassador',
    company: 'Microsoft',
    logo: '🔵',
    color: '#00a4ef',
    description: 'Amplify your impact and bring your peers along by volunteering as a Microsoft Learn Student Ambassador. Learn new skills, build community, and unlock exclusive resources.',
    deadline: 'Rolling applications',
    duration: 'Ongoing (milestone-based tiers)',
    link: 'https://mvp.microsoft.com/studentambassadors',
    tags: ['Free', 'Certificate', 'Stipend', 'Swag'],
    eligibility: 'Enrolled in accredited higher education institution, 16+ years',
    benefits: ['Free Azure credits ($150/mo)', 'LinkedIn Premium', 'Visual Studio Enterprise', 'Conference tickets & exclusive events'],
  },
  {
    id: 3,
    title: 'Amazon Student Partner',
    company: 'Amazon',
    logo: '🟠',
    color: '#ff9900',
    description: 'Join Amazon\'s campus ambassador program to promote AWS, organize tech events, and earn rewards while building cloud computing skills.',
    deadline: 'Semester-based recruitment',
    duration: '6 months per cohort',
    link: 'https://aws.amazon.com/education/',
    tags: ['Free', 'Certificate', 'Stipend'],
    eligibility: 'University students with interest in cloud and technology',
    benefits: ['AWS credits', 'Amazon swag', 'Priority internship consideration', 'AWS certification vouchers'],
  },
  {
    id: 4,
    title: 'GeeksforGeeks Campus Ambassador',
    company: 'GeeksforGeeks',
    logo: '🟩',
    color: '#2f8d46',
    description: 'Represent GeeksforGeeks at your campus. Organize coding contests, workshops, and build a community of competitive programmers.',
    deadline: 'Rolling applications',
    duration: '6 months',
    link: 'https://www.geeksforgeeks.org/campus-ambassador-program/',
    tags: ['Free', 'Certificate', 'Stipend', 'Networking'],
    eligibility: 'Students in any year of engineering or equivalent',
    benefits: ['Monthly stipend', 'GFG Premium access', 'Exclusive merchandise', 'Letter of recommendation'],
  },
  {
    id: 5,
    title: 'Google Cloud Arcade',
    company: 'Google Cloud',
    logo: '☁️',
    color: '#4285f4',
    description: 'Complete hands-on labs and challenges in Google Cloud Platform to earn badges, points, and prizes. Learn cloud computing skills through gamified challenges.',
    deadline: 'Multiple cohorts per year',
    duration: '1–3 months per arcade',
    link: 'https://cloud.google.com/arcade',
    tags: ['Free', 'Certificate', 'Swag'],
    eligibility: 'Anyone with a Google account',
    benefits: ['Google Cloud badges', 'Free cloud credits', 'Exclusive swag & prizes', 'Cloud certification readiness'],
  },
  {
    id: 6,
    title: 'GitHub Campus Expert',
    company: 'GitHub',
    logo: '🐙',
    color: '#333',
    description: 'Get trained by GitHub to become a campus expert. Build and lead developer communities, host events, and inspire the next generation of developers.',
    deadline: 'Biannual cohorts (Jan & Jul)',
    duration: 'Ongoing after acceptance',
    link: 'https://education.github.com/experts',
    tags: ['Free', 'Certificate', 'Networking', 'Leadership'],
    eligibility: '18+ university/college student, active in tech community',
    benefits: ['GitHub Pro', 'Travel grants for conferences', 'Expert training program', 'GitHub merchandise'],
  },
  {
    id: 7,
    title: 'AWS Educate',
    company: 'Amazon Web Services',
    logo: '☁️',
    color: '#ff9900',
    description: 'Access free cloud computing learning resources, hands-on labs, and AWS credits through an academic gateway designed for students and educators.',
    deadline: 'Always open',
    duration: 'Self-paced',
    link: 'https://aws.amazon.com/education/awseducate/',
    tags: ['Free', 'Certificate'],
    eligibility: 'Students 14+ with a valid institution email',
    benefits: ['Free AWS credits', 'Cloud career pathways', 'Hands-on labs', 'Job board access'],
  },
  {
    id: 8,
    title: 'Meta Developer Circles',
    company: 'Meta',
    logo: '🔷',
    color: '#0668E1',
    description: 'Join a global community of developers who explore the latest in AI, VR, and web technologies. Participate in hackathons, build with Meta APIs, and grow your network.',
    deadline: 'Always open',
    duration: 'Ongoing community',
    link: 'https://developers.facebook.com/developercircles/',
    tags: ['Free', 'Networking'],
    eligibility: 'Any developer or aspiring developer',
    benefits: ['Meta API access', 'Community events', 'Hackathon opportunities', 'Developer resources'],
  },
  {
    id: 9,
    title: 'Google Summer of Code (GSoC)',
    company: 'Google',
    logo: '☀️',
    color: '#4285f4',
    description: 'Get paid to contribute to open source projects during summer. Work with mentors from top open source organizations worldwide. The premier open source internship program.',
    deadline: 'Applications open in March annually',
    duration: '10–22 weeks (summer)',
    link: 'https://summerofcode.withgoogle.com/',
    tags: ['Stipend', 'Certificate', 'Open Source'],
    eligibility: 'Open to anyone 18+, students and non-students',
    benefits: ['$1500–$6600 stipend', 'Mentorship from industry experts', 'Google certificate', 'Global recognition'],
  },
  {
    id: 10,
    title: 'MLH Fellowship',
    company: 'Major League Hacking',
    logo: '🏆',
    color: '#e73427',
    description: 'A 12-week internship alternative where you contribute to open source projects, build portfolio-worthy projects, and learn from experienced mentors in a cohort-based program.',
    deadline: 'Multiple cohorts (Spring, Summer, Fall)',
    duration: '12 weeks',
    link: 'https://fellowship.mlh.io/',
    tags: ['Stipend', 'Certificate', 'Open Source', 'Networking'],
    eligibility: '18+ currently enrolled or recently graduated',
    benefits: ['$5,000 stipend', 'Portfolio projects', 'Career coaching', 'Alumni network'],
  },
];

const TAG_COLORS = {
  'Free': 'bg-green-500/10 text-green-600 border-green-500/20',
  'Certificate': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'Stipend': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'Networking': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Leadership': 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  'Swag': 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  'Open Source': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
};

const Activities = () => {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const allTags = ['All', ...new Set(PROGRAMS.flatMap(p => p.tags))];

  const filtered = PROGRAMS.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.company.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchTag = activeTag === 'All' || p.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative">
      {/* BG blur accent */}
      <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Header */}
      <header className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
          <Globe size={14} /> Curriculum Activities
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3">
          MNC Programs & Opportunities
        </h1>
        <p className="text-muted-foreground text-base">
          Discover ambassador programs, fellowships, and open source opportunities from top tech companies. Boost your resume, earn stipends, and build your network.
        </p>
      </header>

      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search programs, companies..."
            className="w-full pl-12 pr-5 py-3.5 bg-secondary/30 border border-border/50 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeTag === tag
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                  : 'bg-secondary/40 text-muted-foreground hover:text-foreground border-border/50 hover:bg-secondary/60'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filtered.map((program, i) => (
            <motion.div
              key={program.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="glass-morphism group hover:scale-[1.01] transition-transform cursor-pointer"
              onClick={() => setExpandedId(expandedId === program.id ? null : program.id)}
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                      style={{ backgroundColor: `${program.color}15` }}
                    >
                      {program.logo}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{program.company}</p>
                      <h3 className="text-base font-bold text-foreground leading-snug">{program.title}</h3>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                  {program.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {program.tags.map(tag => (
                    <span
                      key={tag}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${TAG_COLORS[tag] || 'bg-secondary text-muted-foreground border-border/50'}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {program.deadline}</span>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedId === program.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 border-t border-border/30 space-y-4">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Duration</p>
                        <p className="text-sm text-foreground">{program.duration}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Eligibility</p>
                        <p className="text-sm text-foreground">{program.eligibility}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Key Benefits</p>
                        <div className="grid grid-cols-2 gap-2">
                          {program.benefits.map((b, j) => (
                            <div key={j} className="flex items-start gap-2 text-sm text-foreground">
                              <Sparkles size={12} className="text-primary mt-0.5 flex-shrink-0" />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <a
                        href={program.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-2"
                      >
                        <ExternalLink size={16} /> Apply / Learn More
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Globe size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-medium">No programs match your search.</p>
          <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {/* Stats Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center text-sm text-muted-foreground"
      >
        <p>Showing {filtered.length} of {PROGRAMS.length} programs · Updated regularly</p>
      </motion.div>
    </div>
  );
};

export default Activities;
