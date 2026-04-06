import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, CalendarCheck, Megaphone, Plus, Send, Check,
  Clock, AlertTriangle, ChevronDown, ChevronUp, FileText,
  Users, Loader2, Pin, Star, CheckCircle2, XCircle, X
} from 'lucide-react';

const TABS = [
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
];

const Assessment = () => {
  const { api, user } = useAuth();
  const [activeTab, setActiveTab] = useState('assignments');
  const isFaculty = ['faculty', 'hod', 'principal'].includes(user?.role);
  const classroomCode = user?.classroomCode || '';

  // ---- ASSIGNMENTS STATE ----
  const [assignments, setAssignments] = useState([]);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({ classroomCode: '', subject: '', title: '', description: '', deadline: '', maxMarks: 100 });
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const [submitText, setSubmitText] = useState('');
  const [gradingData, setGradingData] = useState({ studentId: '', grade: '', feedback: '' });
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // ---- ATTENDANCE STATE ----
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [markingMode, setMarkingMode] = useState(false);
  const [attendanceMarks, setAttendanceMarks] = useState({});
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // ---- ANNOUNCEMENTS STATE ----
  const [announcements, setAnnouncements] = useState([]);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ classroomCodes: '', title: '', content: '', isPinned: false });
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  const targetCode = isFaculty ? (assignmentForm.classroomCode || (user?.assignedClassrooms?.[0] || '')) : classroomCode;

  // ---- DATA FETCHING ----
  useEffect(() => {
    if (targetCode || classroomCode) {
      fetchAssignments();
      fetchAttendance();
      fetchAnnouncements();
    }
  }, [targetCode, classroomCode]);

  const fetchAssignments = async () => {
    const code = isFaculty ? targetCode : classroomCode;
    if (!code) return;
    setLoadingAssignments(true);
    try {
      const res = await api.get(`/assessment/assignment/${code}`);
      setAssignments(res.data);
    } catch (e) { console.error(e); }
    finally { setLoadingAssignments(false); }
  };

  const fetchAttendance = async () => {
    const code = isFaculty ? targetCode : classroomCode;
    if (!code) return;
    setLoadingAttendance(true);
    try {
      const res = await api.get(`/assessment/attendance/${code}`);
      setAttendanceRecords(res.data);
    } catch (e) { console.error(e); }
    finally { setLoadingAttendance(false); }
  };

  const fetchAnnouncements = async () => {
    const code = isFaculty ? targetCode : classroomCode;
    if (!code) return;
    setLoadingAnnouncements(true);
    try {
      const res = await api.get(`/assessment/announcement/${code}`);
      setAnnouncements(res.data);
    } catch (e) { console.error(e); }
    finally { setLoadingAnnouncements(false); }
  };

  // ---- FETCH STUDENTS FOR ATTENDANCE ----
  const fetchStudents = async (code) => {
    try {
      const res = await api.get(`/analytics/students/${code}`);
      setStudents(res.data);
      const marks = {};
      res.data.forEach(s => { marks[s.id] = 'present'; });
      setAttendanceMarks(marks);
    } catch (e) {
      console.error(e);
    }
  };

  // ---- HANDLERS ----
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assessment/assignment', assignmentForm);
      setShowCreateAssignment(false);
      setAssignmentForm({ classroomCode: '', subject: '', title: '', description: '', deadline: '', maxMarks: 100 });
      fetchAssignments();
    } catch (e) { console.error(e); }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    try {
      await api.post(`/assessment/assignment/${assignmentId}/submit`, { text: submitText });
      setSubmitText('');
      setExpandedAssignment(null);
      fetchAssignments();
    } catch (e) { console.error(e); }
  };

  const handleGrade = async (assignmentId) => {
    try {
      await api.put(`/assessment/assignment/${assignmentId}/grade`, gradingData);
      setGradingData({ studentId: '', grade: '', feedback: '' });
      fetchAssignments();
    } catch (e) { console.error(e); }
  };

  const handleMarkAttendance = async () => {
    const code = isFaculty ? targetCode : classroomCode;
    const records = Object.entries(attendanceMarks).map(([studentId, status]) => ({ studentId, status }));
    try {
      await api.post('/assessment/attendance', { classroomCode: code, date: attendanceDate, records });
      setMarkingMode(false);
      fetchAttendance();
    } catch (e) { console.error(e); }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const codes = announcementForm.classroomCodes.split(',').map(c => c.trim()).filter(Boolean);
      await api.post('/assessment/announcement', { ...announcementForm, classroomCodes: codes });
      setShowCreateAnnouncement(false);
      setAnnouncementForm({ classroomCodes: '', title: '', content: '', isPinned: false });
      fetchAnnouncements();
    } catch (e) { console.error(e); }
  };

  const toggleAttendanceMark = (studentId) => {
    setAttendanceMarks(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : prev[studentId] === 'absent' ? 'late' : 'present',
    }));
  };

  const markAllPresent = () => {
    const marks = {};
    students.forEach(s => { marks[s.id] = 'present'; });
    setAttendanceMarks(marks);
  };

  // Calculate student's attendance percentage
  const getMyAttendance = () => {
    let present = 0, total = 0;
    attendanceRecords.forEach(rec => {
      const myRecord = rec.records?.find(r => r.studentId?.toString() === user?._id?.toString());
      if (myRecord) {
        total++;
        if (myRecord.status === 'present') present++;
      }
    });
    return total > 0 ? Math.round((present / total) * 100) : 0;
  };

  // ---- Faculty classroom selector ----
  const renderClassroomSelector = () => {
    if (!isFaculty || !user?.assignedClassrooms?.length) return null;
    return (
      <div className="mb-6 glass-morphism p-4 flex items-center gap-4 flex-wrap">
        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Class:</span>
        {user.assignedClassrooms.map(code => (
          <button
            key={code}
            onClick={() => {
              setAssignmentForm(prev => ({ ...prev, classroomCode: code }));
              fetchStudents(code);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              (assignmentForm.classroomCode || user.assignedClassrooms[0]) === code
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-secondary/40 text-muted-foreground hover:text-foreground border border-border/50'
            }`}
          >
            {code}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative">
      <div className="absolute top-20 right-1/3 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Header */}
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
          <ClipboardList size={14} /> {isFaculty ? 'Faculty Assessment Panel' : 'My Classroom'}
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">
          College Assessment
        </h1>
        <p className="text-muted-foreground text-sm">
          {isFaculty
            ? 'Create assignments, mark attendance, and post announcements for your classes.'
            : `Classroom: ${classroomCode || 'N/A'} · View your assignments, attendance, and notices.`}
        </p>
      </header>

      {/* Faculty classroom selector */}
      {renderClassroomSelector()}

      {/* Tabs */}
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
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">

        {/* =============== ASSIGNMENTS TAB =============== */}
        {activeTab === 'assignments' && (
          <motion.div key="assignments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

            {/* Create Assignment (Faculty) */}
            {isFaculty && (
              <div className="mb-6">
                <button
                  onClick={() => setShowCreateAssignment(!showCreateAssignment)}
                  className="px-5 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                  <Plus size={16} /> New Assignment
                </button>

                <AnimatePresence>
                  {showCreateAssignment && (
                    <motion.form
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      onSubmit={handleCreateAssignment}
                      className="mt-4 glass-morphism p-6 space-y-4 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={assignmentForm.classroomCode} onChange={e => setAssignmentForm(p => ({ ...p, classroomCode: e.target.value }))} placeholder="Classroom Code (e.g. CSE-3A)" required className="input-field" />
                        <input value={assignmentForm.subject} onChange={e => setAssignmentForm(p => ({ ...p, subject: e.target.value }))} placeholder="Subject" required className="input-field" />
                        <input value={assignmentForm.title} onChange={e => setAssignmentForm(p => ({ ...p, title: e.target.value }))} placeholder="Assignment Title" required className="input-field" />
                        <input type="datetime-local" value={assignmentForm.deadline} onChange={e => setAssignmentForm(p => ({ ...p, deadline: e.target.value }))} required className="input-field" />
                      </div>
                      <textarea value={assignmentForm.description} onChange={e => setAssignmentForm(p => ({ ...p, description: e.target.value }))} placeholder="Assignment description / instructions" rows={3} className="input-field w-full" />
                      <div className="flex gap-3">
                        <input type="number" value={assignmentForm.maxMarks} onChange={e => setAssignmentForm(p => ({ ...p, maxMarks: Number(e.target.value) }))} placeholder="Max Marks" className="input-field w-32" />
                        <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2">
                          <Send size={14} /> Create
                        </button>
                        <button type="button" onClick={() => setShowCreateAssignment(false)} className="px-4 py-3 bg-secondary/50 rounded-2xl font-bold text-sm text-muted-foreground">Cancel</button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Assignment List */}
            {loadingAssignments ? (
              <div className="text-center py-12 text-muted-foreground"><Loader2 className="animate-spin mx-auto mb-2" /> Loading...</div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground glass-morphism rounded-3xl">
                <ClipboardList size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-medium">No assignments yet.</p>
              </div>
            ) : (
              assignments.map((a, i) => {
                const isPastDue = new Date(a.deadline) < new Date();
                const mySubmission = a.submissions?.find(s => s.studentId?.toString() === user?._id?.toString());

                return (
                  <motion.div key={a._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-morphism overflow-hidden">
                    <button
                      onClick={() => setExpandedAssignment(expandedAssignment === a._id ? null : a._id)}
                      className="w-full p-5 flex items-center justify-between text-left hover:bg-secondary/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${isPastDue ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                          <FileText size={22} />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-sm">{a.title}</h3>
                          <p className="text-xs text-muted-foreground">{a.subject} · {a.classroomCode} · Max: {a.maxMarks} marks</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPastDue ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-success/10 text-success border border-success/20'}`}>
                          {isPastDue ? 'Past Due' : 'Active'}
                        </span>
                        {mySubmission && <CheckCircle2 size={18} className="text-success" />}
                        {expandedAssignment === a._id ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedAssignment === a._id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="px-5 pb-5 pt-2 border-t border-border/30 space-y-4">
                            <p className="text-sm text-muted-foreground">{a.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock size={12} /> Due: {new Date(a.deadline).toLocaleString()}</span>
                              <span className="flex items-center gap-1"><Users size={12} /> {a.submissions?.length || 0} submissions</span>
                            </div>

                            {/* Student: Submit */}
                            {!isFaculty && !mySubmission && (
                              <div className="space-y-3 pt-2">
                                <textarea value={submitText} onChange={e => setSubmitText(e.target.value)} placeholder="Your submission (paste answer or notes)..." rows={3} className="input-field w-full" />
                                <button onClick={() => handleSubmitAssignment(a._id)} disabled={!submitText.trim()} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2">
                                  <Send size={14} /> Submit
                                </button>
                              </div>
                            )}

                            {/* Student: View grade */}
                            {!isFaculty && mySubmission && (
                              <div className="p-4 rounded-2xl bg-success/5 border border-success/20">
                                <p className="text-sm font-bold text-success mb-1">✅ Submitted {mySubmission.isLate ? '(Late)' : ''}</p>
                                {mySubmission.grade != null && (
                                  <p className="text-sm text-foreground">Grade: <strong>{mySubmission.grade}/{a.maxMarks}</strong> · {mySubmission.feedback || ''}</p>
                                )}
                              </div>
                            )}

                            {/* Faculty: View submissions & grade */}
                            {isFaculty && a.submissions?.length > 0 && (
                              <div className="space-y-2 pt-2">
                                <p className="text-xs font-bold text-muted-foreground uppercase">Submissions</p>
                                {a.submissions.map((sub, j) => (
                                  <div key={j} className="p-3 rounded-xl bg-secondary/30 border border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-bold text-foreground">Student ID: {sub.studentId?.toString().slice(-6)}</p>
                                      <p className="text-xs text-muted-foreground">{sub.text?.slice(0, 100)}{sub.text?.length > 100 ? '...' : ''} {sub.isLate && <span className="text-warning">(Late)</span>}</p>
                                      {sub.grade != null && <p className="text-xs text-success font-bold mt-1">Graded: {sub.grade}/{a.maxMarks}</p>}
                                    </div>
                                    {sub.grade == null && (
                                      <div className="flex gap-2 items-center">
                                        <input type="number" placeholder="Grade" className="input-field w-20 text-sm" onChange={e => setGradingData(p => ({ ...p, studentId: sub.studentId, grade: Number(e.target.value) }))} />
                                        <button onClick={() => handleGrade(a._id)} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-xs">Grade</button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {/* =============== ATTENDANCE TAB =============== */}
        {activeTab === 'attendance' && (
          <motion.div key="attendance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

            {/* Student: My Attendance */}
            {!isFaculty && (
              <div className="glass-morphism p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><CalendarCheck className="text-primary" size={20} /> My Attendance</h3>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-black text-primary">{getMyAttendance()}%</p>
                    <p className="text-xs text-muted-foreground font-bold uppercase mt-1">Overall</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-black text-foreground">{attendanceRecords.length}</p>
                    <p className="text-xs text-muted-foreground font-bold uppercase mt-1">Total Days</p>
                  </div>
                  {getMyAttendance() < 75 && (
                    <div className="flex items-center gap-2 text-warning text-sm font-bold">
                      <AlertTriangle size={16} /> Below 75% threshold
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Faculty: Mark Attendance */}
            {isFaculty && (
              <div className="glass-morphism p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2"><CalendarCheck className="text-primary" size={20} /> Mark Attendance</h3>
                  <div className="flex items-center gap-3">
                    <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} className="input-field text-sm" />
                    {!markingMode ? (
                      <button
                        onClick={() => {
                          setMarkingMode(true);
                          const code = assignmentForm.classroomCode || user?.assignedClassrooms?.[0];
                          if (code) fetchStudents(code);
                        }}
                        className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2"
                      >
                        <Plus size={14} /> Mark Today
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={markAllPresent} className="px-3 py-2 bg-success/10 text-success rounded-lg text-xs font-bold border border-success/20">All Present</button>
                        <button onClick={handleMarkAttendance} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm flex items-center gap-1"><Check size={14} /> Save</button>
                        <button onClick={() => setMarkingMode(false)} className="px-3 py-2 bg-secondary/50 rounded-lg text-xs font-bold text-muted-foreground"><X size={14} /></button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Marking Grid */}
                {markingMode && students.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
                    {students.map(s => {
                      const status = attendanceMarks[s.id] || 'present';
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleAttendanceMark(s.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                            status === 'present' ? 'bg-success/10 border-success/30 text-success' :
                            status === 'late' ? 'bg-warning/10 border-warning/30 text-warning' :
                            'bg-destructive/10 border-destructive/30 text-destructive'
                          }`}
                        >
                          <span className="font-bold text-sm truncate">{s.name}</span>
                          <span className="text-xs font-bold uppercase">{status}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {markingMode && students.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-4">No students found. Select a classroom first.</p>
                )}
              </div>
            )}

            {/* Attendance History */}
            <div className="glass-morphism p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">📅 Attendance History</h3>
              {loadingAttendance ? (
                <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" /></div>
              ) : attendanceRecords.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No attendance records yet.</p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {attendanceRecords.slice(0, 30).map((rec, i) => {
                    const present = rec.records?.filter(r => r.status === 'present').length || 0;
                    const total = rec.records?.length || 0;
                    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
                    return (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/30">
                        <span className="text-sm font-bold text-foreground">{new Date(rec.date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{present}/{total} present</span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${pct >= 75 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* =============== ANNOUNCEMENTS TAB =============== */}
        {activeTab === 'announcements' && (
          <motion.div key="announcements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

            {/* Create Announcement (Faculty) */}
            {isFaculty && (
              <div className="mb-6">
                <button
                  onClick={() => setShowCreateAnnouncement(!showCreateAnnouncement)}
                  className="px-5 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                  <Plus size={16} /> New Announcement
                </button>

                <AnimatePresence>
                  {showCreateAnnouncement && (
                    <motion.form
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      onSubmit={handleCreateAnnouncement}
                      className="mt-4 glass-morphism p-6 space-y-4 overflow-hidden"
                    >
                      <input value={announcementForm.classroomCodes} onChange={e => setAnnouncementForm(p => ({ ...p, classroomCodes: e.target.value }))} placeholder="Classroom codes (comma separated, e.g. CSE-3A,CSE-3B)" required className="input-field w-full" />
                      <input value={announcementForm.title} onChange={e => setAnnouncementForm(p => ({ ...p, title: e.target.value }))} placeholder="Announcement Title" required className="input-field w-full" />
                      <textarea value={announcementForm.content} onChange={e => setAnnouncementForm(p => ({ ...p, content: e.target.value }))} placeholder="Announcement content..." rows={4} required className="input-field w-full" />
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                          <input type="checkbox" checked={announcementForm.isPinned} onChange={e => setAnnouncementForm(p => ({ ...p, isPinned: e.target.checked }))} className="w-4 h-4 rounded accent-primary" />
                          <Pin size={14} /> Pin this announcement
                        </label>
                        <div className="flex-1" />
                        <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2">
                          <Megaphone size={14} /> Post
                        </button>
                        <button type="button" onClick={() => setShowCreateAnnouncement(false)} className="px-4 py-3 bg-secondary/50 rounded-2xl font-bold text-sm text-muted-foreground">Cancel</button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Announcement List */}
            {loadingAnnouncements ? (
              <div className="text-center py-12 text-muted-foreground"><Loader2 className="animate-spin mx-auto mb-2" /> Loading...</div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground glass-morphism rounded-3xl">
                <Megaphone size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-medium">No announcements yet.</p>
              </div>
            ) : (
              announcements.map((ann, i) => (
                <motion.div key={ann._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-morphism p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ann.isPinned ? 'bg-warning/10 text-warning' : 'bg-accent/10 text-accent'}`}>
                      {ann.isPinned ? <Pin size={18} /> : <Megaphone size={18} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground text-sm">{ann.title}</h3>
                        {ann.isPinned && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning/10 text-warning border border-warning/20">PINNED</span>}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                        <span>To: {ann.classroomCodes?.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS for input fields */}
      <style>{`
        .input-field {
          padding: 0.75rem 1rem;
          background: hsl(var(--secondary) / 0.3);
          border: 1px solid hsl(var(--border) / 0.5);
          border-radius: 0.75rem;
          color: hsl(var(--foreground));
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }
        .input-field:focus {
          border-color: hsl(var(--primary) / 0.5);
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
        }
        .input-field::placeholder {
          color: hsl(var(--muted-foreground));
        }
      `}</style>
    </div>
  );
};

export default Assessment;
