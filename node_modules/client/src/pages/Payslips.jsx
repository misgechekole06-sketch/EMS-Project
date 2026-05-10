import { useCallback, useEffect, useState } from "react"
import Loading from "../components/Loading";
import PayslipList from "../components/payslip/PayslipList";
import GeneratePayslipForm from "../components/payslip/GeneratePayslipForm";
import { useAuth } from "../context/AuthContext";
import api from '../api/axios';
import toast from 'react-hot-toast';

const Payslips = () => {
  const [payslips, setPayslips] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true);
  const { user } = useAuth()
  
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const fetchPayslips = useCallback(async () => {
    try {
      const res = await api.get('/payslips')
      setPayslips(res.data.payslips || res.data.data || res.data || [])
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to load payslips");
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchEmployees = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await api.get("/employees");
      const employeeData = res.data.employees || [];
      
      if (Array.isArray(employeeData)) {
        const activeEmployees = employeeData.filter((e) => !e.isDeleted);
        setEmployees(activeEmployees);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error("Employee fetch error:", error);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchPayslips();
    if (isAdmin) fetchEmployees();
  }, [fetchPayslips, fetchEmployees, isAdmin]);

  if (loading) return <Loading />

  return (
    <div className="animate-fade-in p-4 sm:p-6">
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payslips</h1> 
          <p className="text-slate-500">
            {isAdmin ? "Generate and manage employee payslips" : "Your payslip history"}
          </p>         
        </div>
         {isAdmin && (
           <GeneratePayslipForm 
             employees={employees} 
             onSuccess={fetchPayslips}
           />
         )}
      </div> 
      <PayslipList payslips={payslips} isAdmin={isAdmin}/>   
    </div>
  )
}

export default Payslips