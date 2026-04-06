import { useAuth } from '../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import FacultyDashboard from './FacultyDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (user?.role === 'student') {
    return <StudentDashboard />;
  } else if (['faculty', 'hod', 'principal', 'placement'].includes(user?.role)) {
    return <FacultyDashboard />;
  }

  return <div>Unknown Role</div>;
};

export default DashboardRouter;
