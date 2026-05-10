import { useCallback, useEffect, useState } from 'react';
import { DEPARTMENTS } from '../assets/assets';
import { X, Plus, Search } from 'lucide-react';
import EmployeeCard from '../components/EmployeeCard';
import EmployeeForm from '../components/EmployeeForm';
import api from '../api/axios';

const Employees = () => {
  const [employees, setEmployees] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [editEmployee, setEditEmployee] = useState(null);
  const [showCreateModel, setShowCreateModel] = useState(false);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedDepartment 
        ? `/employees?department=${selectedDepartment}` 
        : "/employees";
      
      const res = await api.get(url);
      
      if (res.data && res.data.success) {
        setEmployees(res.data.employees || []);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setEmployees([]); 
    } finally {
      setLoading(false);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filtered = (employees || []).filter((emp) => {
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''} ${emp.position || ''}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  return (
    <div className="animate-fade-in p-4 sm:p-6">
     
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="text-slate-500">Manage your team members and their information.</p>
        </div>
        <button
          onClick={() => setShowCreateModel(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white flex flex-row items-center gap-2 w-full sm:w-auto justify-center px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            placeholder="Search employee..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        </div>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="p-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((deptName) => (
            <option key={deptName} value={deptName}>{deptName}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-16 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              No employees found
            </div>
          ) : (
            filtered.map((emp) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onDelete={fetchEmployees}
                onEdit={(e) => setEditEmployee(e)}
              />
            ))
          )}
        </div>
      )}

      {showCreateModel && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModel(false)}>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold">Add New Employee</h2>
               <button onClick={() => setShowCreateModel(false)}><X className="text-slate-400 hover:text-slate-600"/></button>
            </div>
            <EmployeeForm 
              onSuccess={() => { setShowCreateModel(false); fetchEmployees(); }} 
              onCancel={() => setShowCreateModel(false)} 
            />
          </div>
        </div>
      )}

      {editEmployee && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-black/40 backdrop-blur-sm" onClick={() => setEditEmployee(null)}>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold">Edit Employee</h2>
               <button onClick={() => setEditEmployee(null)}><X className="text-slate-400 hover:text-slate-600"/></button>
            </div>
            <EmployeeForm 
              initialData={editEmployee} 
              onSuccess={() => { setEditEmployee(null); fetchEmployees(); }} 
              onCancel={() => setEditEmployee(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;