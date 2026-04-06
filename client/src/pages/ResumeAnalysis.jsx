import { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, BarChart3, ChevronRight, Activity, ArrowRight, History, Clock, TrendingUp, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ProgressRing from '../components/dashboard/ProgressRing';
import { motion, AnimatePresence } from 'framer-motion';
import Summary from '../components/resume/components/Summary';
import ATS from '../components/resume/components/ATS';
import Details from '../components/resume/components/Details';

const ResumeAnalysis = () => {
  const { api } = useAuth();
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [fileUrl, setFileUrl] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myTopResumes, setMyTopResumes] = useState([]);

  // Fetch resume history on mount
  useEffect(() => {
    return () => {
      // Clean up object URL when component unmounts
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    }
  }, [fileUrl]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/resume/history');
        setVersionHistory(res.data.versions || []);
      } catch (e) {
        // No history yet — that's fine
      }
    };
    fetchHistory();
  }, [api, results]);

  // Fetch global top 15 and personal top 5 resumes
  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const [globalRes, personalRes] = await Promise.all([
          api.get('/resume/top'),
          api.get('/resume/my-top')
        ]);
        setLeaderboard(globalRes.data || []);
        setMyTopResumes(personalRes.data || []);
      } catch (e) {
        console.error('Failed to fetch leaderboards:', e);
      }
    };
    fetchLeaderboards();
  }, [api, results]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
        if (fileUrl) URL.revokeObjectURL(fileUrl);
        setFileUrl(URL.createObjectURL(e.target.files[0]));
        setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        if (fileUrl) URL.revokeObjectURL(fileUrl);
        setFileUrl(URL.createObjectURL(droppedFile));
        setError(null);
      } else {
        setError('Please upload a valid PDF file.');
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setAnalyzing(true);
    setError(null);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobTitle', jobTitle);
    formData.append('companyName', companyName);

    try {
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResults(res.data.analysis);
      // If JD was provided, compute a simple match overlay
      if (jobDescription.trim()) {
        const jdLower = jobDescription.toLowerCase();
        const jdKeywords = jdLower.match(/\b[a-z]{3,}\b/g) || [];
        const skillNames = (res.data.analysis.skillNames || []).map(s => s.toLowerCase());
        const suggestedKeywords = res.data.analysis.missingKeywords || [];
        
        const matched = jdKeywords.filter(k => skillNames.some(s => s.includes(k)));
        
        // Make Target Alignment Score reflect AI's suggested gaps more accurately
        const expectedTotal = matched.length + suggestedKeywords.length;
        const matchRate = expectedTotal > 0 ? Math.round((matched.length / expectedTotal) * 100) : 0;
        
        setResults(prev => ({
          ...prev,
          jdMatch: {
            matchRate: Math.min(matchRate, 100),
            matchedKeywords: [...new Set(matched)].slice(0, 5),
            totalJdKeywords: expectedTotal
          }
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'hsl(var(--success))';
    if (score >= 50) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Header */}
      <header className="mb-12 text-center max-w-3xl mx-auto mt-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-indigo-500 to-indigo-800 pb-1">
          Smart feedback for your dream job
        </h1>
        <p className="text-lg text-muted-foreground font-medium">Drop your resume for an ATS score and improvement tips.</p>
      </header>

      <AnimatePresence mode="wait">
        {!results ? (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto w-full flex flex-col gap-6"
          >
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-muted-foreground ml-1">Company Name</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="PixelForge Studio"
                className="w-full bg-background/50 glass-morphism border border-border/60 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-muted-foreground ml-1">Job Title</label>
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Full Stack Developer"
                className="w-full bg-background/50 glass-morphism border border-border/60 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-muted-foreground ml-1">Job Description <span className="text-destructive">*</span></label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here. Our team thrives on curiosity, clean code..."
                className="w-full h-32 bg-background/50 glass-morphism border border-border/60 rounded-2xl px-5 py-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
              />
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <label className="text-sm font-semibold text-muted-foreground ml-1">Upload Resume</label>
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative bg-gradient-to-br from-background/50 to-secondary/30 glass-morphism rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer overflow-hidden border-2 border-transparent
                  ${isDragging ? 'shadow-[0_0_0_2px_hsl(var(--primary))] bg-primary/5 scale-[1.02]' : 'hover:shadow-[0_0_0_2px_hsl(var(--border))]'}
                  ${file ? 'shadow-[0_0_0_2px_hsl(var(--success)/0.5)] bg-success/5' : ''}
                `}
              >
                {/* Background animate pulse if dragging */}
                {isDragging && <div className="absolute inset-0 bg-primary/5 animate-pulse -z-10" />}

                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange} 
                />
                
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-700 text-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                    <span className="font-serif italic font-bold text-2xl">i</span>
                  </div>
                  
                  {file ? (
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-bold px-4 py-2 rounded-full mt-2">
                       <FileText size={16} /> {file.name}
                    </div>
                  ) : (
                    <div className="text-center mt-2">
                      <h3 className="text-[15px] font-bold text-foreground mb-1">
                        Click to upload or drag and drop
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        PDF (max. 20 MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm flex items-center justify-center gap-2 font-medium">
                <AlertTriangle size={16} /> {error}
              </div>
            )}

            <button 
              onClick={handleUpload}
              disabled={!file || !jobDescription.trim() || analyzing}
              className="mt-6 w-full py-4 rounded-xl bg-slate-900 dark:bg-primary text-white font-bold text-lg shadow-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {analyzing ? (
                <><Activity className="animate-pulse" size={20} /> Analyzing Resume...</>
              ) : (
                <><BarChart3 size={20} /> Generate Smart Feedback</>
              )}
            </button>

          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex justify-end mb-4 pr-2"
          >
             <button 
                onClick={() => { setResults(null); setFile(null); setFileUrl(null); }}
                className="px-5 py-2.5 rounded-full bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
                <ArrowRight size={16} className="rotate-180" /> Compare Another Resume
             </button>
          </motion.div>
        )}
        
        {results && (
          <motion.div 
            key="results-split"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,1.2fr)] gap-8 w-full max-w-[1400px] mx-auto items-start h-[calc(100vh-200px)]"
          >
            {/* Left Column: PDF Viewer */}
            <div className="flex flex-col h-full bg-white dark:bg-card border border-border rounded-xl shadow-lg overflow-hidden">
               <div className="bg-muted px-4 py-3 border-b flex justify-between items-center z-10 shrink-0">
                  <h3 className="font-bold text-foreground font-serif tracking-wide flex items-center gap-2">
                     Resume Sample
                  </h3>
                  <div className="text-xs font-semibold text-muted-foreground truncate max-w-[200px]">{file?.name}</div>
               </div>
               <div className="flex-1 w-full bg-slate-100 dark:bg-slate-900 relative">
                  {fileUrl ? (
                    <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} className="absolute inset-0 w-full h-full border-0" title="Resume Preview" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground w-full">Preview not available</div>
                  )}
               </div>
            </div>

            {/* Right Column: AI Analysis Scrollable Stack */}
            <div className="flex flex-col gap-5 overflow-y-auto h-full pr-2 pb-6 custom-scrollbar">
              
              <div className="mb-2">
                 <h1 className="text-[28px] font-bold text-foreground">Resume Review</h1>
              </div>

              <Summary feedback={results} />
              
              {/* Intelligent Job Description Match (Primary Focus) */}
              {results.jdMatch && (
                <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                        <Target size={18} className="text-primary" /> Target Alignment
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Matched against: <span className="font-semibold">{jobTitle || 'Target Role'}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`text-2xl font-black ${results.jdMatch.matchRate >= 60 ? 'text-success' : results.jdMatch.matchRate >= 30 ? 'text-warning' : 'text-destructive'}`}>
                          {results.jdMatch.matchRate}%
                        </div>
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Match Score</div>
                      </div>
                      <ProgressRing progress={results.jdMatch.matchRate} color="hsl(var(--primary))" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <h3 className="text-sm font-semibold text-foreground">Matched Core Competencies:</h3>
                    {results.jdMatch.matchedKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {results.jdMatch.matchedKeywords.map((kw, i) => (
                          <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-xs font-semibold flex items-center gap-1">
                            <CheckCircle2 size={12} /> {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs font-medium text-destructive bg-destructive/10 p-2.5 rounded-md flex items-center gap-2 border border-destructive/20">
                        <AlertTriangle size={14} /> Zero targeted keywords found.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ATS Parse Results */}
              {results.ATS && (
                <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
                  <ATS score={results.ATS.score || 0} suggestions={results.ATS.tips || []} />
                </div>
              )}
              
              {/* Specific Resumed Components (Content, Structure, Skills, Style) */}
              <Details feedback={results} />

              {/* Next Step CTA */}
              <Link to="/roadmap" className="group mt-2">
                <div className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl p-4 flex items-center justify-between transition-all shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <BarChart3 size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold">Generate Study Roadmap</h3>
                      <p className="text-xs font-medium opacity-90">Convert feedback into an actionable curriculum</p>
                    </div>
                  </div>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboards Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Global Leaderboard (Left, 2/3 width) */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <TrendingUp size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Global Top 15 Resumes</h2>
              <p className="text-sm text-muted-foreground font-medium">Highest ATS scores across all candidates</p>
            </div>
          </div>

          <div className="bg-card glass-morphism border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-sm border-b border-border/50">
                  <tr className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-4 w-16">Rank</th>
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4">Target Role</th>
                    <th className="px-6 py-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {leaderboard.length > 0 ? (
                    leaderboard.map((item, index) => (
                      <tr key={item._id || index} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm
                            ${index === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                              index === 1 ? 'bg-slate-100 text-slate-700 border border-slate-200' : 
                              index === 2 ? 'bg-orange-50 text-orange-700 border border-orange-200' : 
                              'bg-muted text-muted-foreground'}
                          `}>
                            #{index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="font-bold text-foreground">{item.user?.name || 'Anonymous'}</div>
                          <div className="text-xs text-muted-foreground font-medium mt-0.5 truncate max-w-[150px]">
                            {item.user?.college || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-border bg-secondary/30 text-secondary-foreground text-xs font-semibold truncate max-w-[150px]">
                            <Target size={12} className="shrink-0" /> {item.jobTitle}
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-right">
                          <div className={`inline-flex items-center justify-center font-black text-lg
                            ${item.score >= 75 ? 'text-success' : item.score >= 50 ? 'text-warning' : 'text-destructive'}
                          `}>
                            {item.score}<span className="text-xs ml-0.5 opacity-70">%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-muted-foreground font-medium">
                        No global scores yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Personal Leaderboard (Right, 1/3 width) */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-secondary/20 rounded-xl text-secondary-foreground">
              <History size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">My Top 5</h2>
              <p className="text-sm text-muted-foreground font-medium">Your personal best analyses</p>
            </div>
          </div>

          <div className="bg-card glass-morphism border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[500px]">
             <div className="overflow-y-auto custom-scrollbar flex-1">
                {myTopResumes.length > 0 ? (
                  <div className="divide-y divide-border/30">
                    {myTopResumes.map((item, index) => (
                      <div key={item._id || index} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between gap-3">
                         <div className="flex items-center gap-4 min-w-0">
                           <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-offset-1 ring-offset-card
                            ${index === 0 ? 'bg-amber-100 text-amber-700 ring-amber-200' : 'bg-muted text-muted-foreground ring-border/50'}
                           `}>
                            {index + 1}
                           </div>
                           <div className="min-w-0">
                             <h4 className="font-bold text-sm text-foreground truncate">{item.jobTitle}</h4>
                             <p className="text-xs text-muted-foreground font-medium mt-0.5">
                               {new Date(item.date).toLocaleDateString()}
                             </p>
                           </div>
                         </div>
                         <div className={`font-black text-xl shrink-0
                          ${item.score >= 75 ? 'text-success' : item.score >= 50 ? 'text-warning' : 'text-destructive'}`}>
                           {item.score}<span className="text-xs ml-0.5 opacity-70">%</span>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full p-6 text-center text-muted-foreground text-sm font-medium">
                    You haven't uploaded a resume yet.
                  </div>
                )}
             </div>
          </div>
        </div>

      </motion.div>

    </div>
  );
};

export default ResumeAnalysis;
