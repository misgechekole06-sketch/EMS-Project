import { useState, useCallback, useEffect } from "react";
import Loading from '../components/Loading';
import CheckInButton from "../components/attendance/CheckInButton";
import AttendanceStats from "../components/attendance/AttendanceStats";
import AttendanceHistory from "../components/attendance/AttendanceHistory";
import api from "../api/axios";
import { toast } from 'react-hot-toast';

const Attendance = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get("/attendance");
      
      if (res.data.success) {
        setHistory(res.data.data || []);
        if (res.data.employee?.isDeleted) {
          setIsDeleted(true);
        }
      }
    } catch (error) {
      console.error("Attendance Fetch Error:", error);
      toast.error(error?.response?.data?.error || "Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <Loading />;

  const today = new Date().toDateString();
  const todayRecord = history.find((r) => {
    return new Date(r.date).toDateString() === today;
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Attendance</h1>
        <p className="page-subtitle">Track your work hours and daily attendance.</p>
      </div>

      {isDeleted ? (
        <div className="mb-8 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
          <p className="text-rose-600 font-medium">
            You can no longer access your attendance records because your employee record has been deactivated.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <CheckInButton 
              todayRecord={todayRecord} 
              onAction={fetchData} 
            />
          </div>

          <AttendanceStats history={history} />
          
          <div className="mt-8">
             <AttendanceHistory history={history} />
          </div>
        </>
      )}
    </div>
  );
};

export default Attendance;