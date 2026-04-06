import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingUp, GitCompare, MessageSquare, Download,
  RefreshCw, Loader2, Users, Clock, Trophy, Star, Flame, Activity,
  Brain, ChevronRight, Search, Sparkles, ArrowLeft
} from 'lucide-react';
import {
  MetricCard, TrendLineChart, ComparisonBarChart, CategoryPieChart,
  PerformanceRadarChart, DataTable, QueryResultRenderer
} from '../components/analytics/AnalyticsCharts';
import AnalyticsExport from '../components/analytics/AnalyticsExport';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'classrooms', label: 'Classrooms', icon: Users },
  { id: 'compare', label: 'Compare', icon: GitCompare },
  { id: 'ask', label: 'Ask AI', icon: Brain },
  { id: 'export', label: 'Export', icon: Download },
];

const AnalyticsDashboard = () => {
  const { api, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data state
  const [overview, setOverview] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [classroomDetail, setClassroomDetail] = useState(null);
  const [compareData, setCompareData] = useState(null);
  const [compareCodes, setCompareCodes] = useState([]);
  const [queryInput, setQueryInput] = useState('');
  const [queryResults, setQueryResults] = useState([]);
  const [queryLoading, setQueryLoading] = useState(false);

  // Load overview data on mount
  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const [overviewRes, classroomsRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/classrooms'),
      ]);
      setOverview(overviewRes.data);
      setClassrooms(classroomsRes.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassroomDetail = async (code) => {
    try {
      const res = await api.get(`/analytics/classroom/${code}`);
      setClassroomDetail(res.data);
      setSelectedClassroom(code);
    } catch (err) {
      console.error('Failed to load classroom detail:', err);
    }
  };

  const fetchCompare = async () => {
    if (compareCodes.length < 2) return;
    try {
      const res = await api.get(`/analytics/compare?codes=${compareCodes.join(',')}`);
      setCompareData(res.data);
    } catch (err) {
      console.error('Failed to compare:', err);
    }
  };

  const sendQuery = async (queryText) => {
    const q = queryText || queryInput;
    if (!q.trim()) return;
    setQueryLoading(true);
    try {
      const res = await api.post('/analytics/query', { query: q });
      setQueryResults(prev => [...prev, { query: q, result: res.data }]);
      setQueryInput('');
    } catch (err) {
      console.error('Query failed:', err);
    } finally {
      setQueryLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.post('/analytics/refresh');
      await fetchOverview();
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleCompareCode = (code) => {
    setCompareCodes(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  // Role title
  const getRoleTitle = () => {
    switch (user?.role) {
      case 'principal': return 'College-Wide Analytics';
      case 'placement': return 'Placement Analytics';
      case 'hod': return 'Department Analytics';
      case 'faculty': return 'Class Analytics';
      default: return 'Analytics';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <BarChart3 className="animate-pulse mb-4 text-primary" size={48} />
        <p className="animate-pulse font-medium">Loading analytics engine...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <header className="mb-8 pb-6 border-b border-border/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3 border border-primary/20">
            <Sparkles size={14} /> {getRoleTitle()}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            AI Data Analyst
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {user?.department && `${user.department} · `}{user?.college || 'All Colleges'}
          </p>
        </div>

        {['hod', 'principal', 'placement'].includes(user?.role) && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-secondary/50 hover:bg-secondary text-foreground rounded-2xl font-bold text-sm transition-all flex items-center gap-2 border border-border/50"
          >
            {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Refresh Data
          </button>
        )}
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-8 bg-secondary/30 rounded-2xl p-1 overflow-x-auto border border-border/50">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* ============ OVERVIEW TAB ============ */}
        {activeTab === 'overview' && overview && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard label="Total Students" value={overview.stats.totalStudents} icon="users" color="#6366f1" delay={0} />
              <MetricCard label="Active This Week" value={overview.stats.activeThisWeek} icon="activity" color="#22c55e" delay={1} />
              <MetricCard label="Study Hours (30d)" value={`${overview.stats.totalStudyHours}h`} icon="clock" color="#f59e0b" delay={2} />
              <MetricCard label="Avg Quiz Score" value={`${overview.stats.avgQuizScore}%`} icon="trophy" color="#8b5cf6" delay={3} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MetricCard label="Quiz Attempts" value={overview.stats.totalQuizAttempts} icon="chart" color="#06b6d4" delay={4} />
              <MetricCard label="Avg Resume Score" value={overview.stats.avgResumeScore} icon="file" color="#ec4899" delay={5} />
              <MetricCard label="Avg Streak" value={`${overview.stats.avgStreak} days`} icon="flame" color="#f43f5e" delay={6} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendLineChart
                data={overview.dailyTrend}
                dataKeys={['hours']}
                xAxisKey="date"
                title="📈 Study Hours Trend (14 days)"
                colors={['#6366f1']}
              />
              <CategoryPieChart
                data={overview.categoryBreakdown}
                dataKey="hours"
                nameKey="name"
                title="📊 Study Category Distribution"
              />
            </div>
          </motion.div>
        )}

        {/* ============ CLASSROOMS TAB ============ */}
        {activeTab === 'classrooms' && (
          <motion.div
            key="classrooms"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {selectedClassroom && classroomDetail ? (
              // Classroom Detail View
              <div className="space-y-6">
                <button
                  onClick={() => { setSelectedClassroom(null); setClassroomDetail(null); }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  <ArrowLeft size={16} /> Back to all classrooms
                </button>

                <div className="glass-morphism p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    Classroom {classroomDetail.classroomCode}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {classroomDetail.students?.length || 0} students
                  </p>
                </div>

                {/* Time series chart if available */}
                {classroomDetail.timeSeries?.length > 0 && (
                  <TrendLineChart
                    data={classroomDetail.timeSeries.map(ts => ({
                      date: new Date(ts.date).toISOString().split('T')[0],
                      studyHours: ts.totalStudyHours || 0,
                      quizAvg: ts.averageQuizScore || 0,
                    }))}
                    dataKeys={['studyHours', 'quizAvg']}
                    xAxisKey="date"
                    title="📈 Performance Over Time"
                    colors={['#6366f1', '#22c55e']}
                  />
                )}

                {/* Student Table */}
                {classroomDetail.students?.length > 0 && (
                  <DataTable
                    columns={['name', 'studyHours', 'quizAvg', 'quizAttempts', 'streak']}
                    data={classroomDetail.students}
                    title="👩‍🎓 Student Breakdown"
                  />
                )}
              </div>
            ) : (
              // Classroom List View
              <div className="glass-morphism p-6">
                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <Users className="text-primary" size={20} /> All Classrooms
                </h3>

                {classrooms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classrooms.map((cls, i) => (
                      <motion.div
                        key={cls.classroomCode}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => fetchClassroomDetail(cls.classroomCode)}
                        className="p-5 rounded-2xl bg-secondary/30 hover:bg-secondary/60 border border-border/50 cursor-pointer transition-all hover:scale-[1.01] group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-black text-foreground">{cls.classroomCode}</span>
                          <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mb-3">{cls.department || ''}</p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-lg font-black text-primary">{cls.metrics?.totalStudents || 0}</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Students</p>
                          </div>
                          <div>
                            <p className="text-lg font-black text-amber-500">{cls.metrics?.totalStudyHours || 0}h</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Study</p>
                          </div>
                          <div>
                            <p className="text-lg font-black text-green-500">{cls.metrics?.averageQuizScore || 0}%</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Quiz</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No classroom data available yet.</p>
                    <p className="text-sm mt-1">Analytics will appear once students start using the platform.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ============ COMPARE TAB ============ */}
        {activeTab === 'compare' && (
          <motion.div
            key="compare"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="glass-morphism p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <GitCompare className="text-primary" size={20} /> Select Classrooms to Compare
              </h3>

              <div className="flex flex-wrap gap-2 mb-6">
                {classrooms.map(cls => (
                  <button
                    key={cls.classroomCode}
                    onClick={() => toggleCompareCode(cls.classroomCode)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      compareCodes.includes(cls.classroomCode)
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : 'bg-secondary/40 text-foreground hover:bg-secondary/60 border border-border/50'
                    }`}
                  >
                    {cls.classroomCode}
                  </button>
                ))}
              </div>

              {compareCodes.length >= 2 && (
                <button
                  onClick={fetchCompare}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                >
                  Compare {compareCodes.length} Classrooms
                </button>
              )}
              {compareCodes.length === 1 && (
                <p className="text-sm text-muted-foreground">Select at least one more classroom to compare.</p>
              )}
            </div>

            {compareData && (
              <>
                <ComparisonBarChart
                  data={compareData}
                  dataKeys={['studyHours', 'avgQuizScore', 'students']}
                  xAxisKey="classroomCode"
                  title="📊 Classroom Comparison"
                  colors={['#6366f1', '#22c55e', '#f59e0b']}
                />

                {/* Radar overlay */}
                {compareData.length <= 5 && (() => {
                  const metrics = ['studyHours', 'avgQuizScore', 'quizAttempts', 'avgResumeScore', 'avgStreak'];
                  const radarData = metrics.map(m => {
                    const point = { metric: m.replace(/([A-Z])/g, ' $1').trim() };
                    const maxVal = Math.max(...compareData.map(d => d[m] || 0), 1);
                    compareData.forEach(d => {
                      point[d.classroomCode] = Math.round(((d[m] || 0) / maxVal) * 100);
                    });
                    return point;
                  });
                  const radarKeys = compareData.map(d => d.classroomCode);
                  return (
                    <PerformanceRadarChart
                      data={radarData}
                      dataKeys={radarKeys}
                      title="🕸️ Normalized Comparison"
                      colors={['#6366f1', '#f43f5e', '#22c55e', '#f59e0b', '#8b5cf6']}
                    />
                  );
                })()}

                <DataTable
                  columns={['classroomCode', 'students', 'studyHours', 'avgQuizScore', 'quizAttempts', 'avgResumeScore', 'avgStreak']}
                  data={compareData}
                  title="📋 Detailed Comparison"
                />
              </>
            )}
          </motion.div>
        )}

        {/* ============ ASK AI TAB ============ */}
        {activeTab === 'ask' && (
          <motion.div
            key="ask"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Query Input */}
            <div className="glass-morphism p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Brain className="text-primary" size={20} /> Ask About Your Students
              </h3>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={queryInput}
                  onChange={e => setQueryInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendQuery()}
                  placeholder="e.g., Who are the top performers in CSE-3A?"
                  className="flex-1 px-5 py-3 bg-secondary/30 border border-border/50 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 text-sm"
                />
                <button
                  onClick={() => sendQuery()}
                  disabled={queryLoading || !queryInput.trim()}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {queryLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  Ask
                </button>
              </div>

              {/* Suggestions */}
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  'Show me study time trends',
                  'Who are the top performers?',
                  'Which students are at risk?',
                  'Show average quiz scores',
                  'Category breakdown',
                  'Give me an overview',
                  'Show attendance overview',
                  'Compare departments',
                ].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => { setQueryInput(suggestion); sendQuery(suggestion); }}
                    className="px-3 py-1.5 bg-secondary/40 hover:bg-secondary/60 text-muted-foreground hover:text-foreground rounded-xl text-xs font-medium transition-all border border-border/30"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Query Results */}
            <div className="space-y-6">
              {queryResults.map((qr, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageSquare size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{qr.query}</p>
                      <p className="text-xs text-muted-foreground mt-1">{qr.result?.summary}</p>
                    </div>
                  </div>
                  <QueryResultRenderer result={qr.result} />
                </div>
              ))}
            </div>

            {queryResults.length === 0 && (
              <div className="text-center py-12 text-muted-foreground glass-morphism rounded-3xl">
                <Brain size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-medium">Ask me anything about your students.</p>
                <p className="text-sm mt-1">Try clicking one of the suggestions above.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ============ EXPORT TAB ============ */}
        {activeTab === 'export' && (
          <motion.div
            key="export"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AnalyticsExport />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalyticsDashboard;
