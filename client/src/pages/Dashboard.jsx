import { useEffect, useState } from 'react';
import Loading from '../components/Loading';
import EmployeeDashboard from '../components/EmployeeDashboard';
import AdminDashboard from '../components/AdminDashboard';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setData(res.data);
      } catch (err) {
        const errorMsg = err.response?.data?.error || "Connection error";
        toast.error(errorMsg);
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <Loading />;
  
  if (!data) return (
    <div className="text-center py-12">
      <p className="text-slate-500">Failed to load dashboard data.</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 text-indigo-600 font-medium underline"
      >
        Try Again
      </button>
    </div>
  );

  return data.role === 'ADMIN' ? (
    <AdminDashboard data={data} />
  ) : (
    <EmployeeDashboard data={data} />
  );
}

export default Dashboard;