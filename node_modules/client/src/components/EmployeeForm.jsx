import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { DEPARTMENTS } from '../assets/assets';
import { Loader2Icon } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const EmployeeForm = ({ initialData, onSuccess, onCancel }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const isEditMode = !!initialData;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formDataObj = new FormData(e.currentTarget);
        const data = Object.fromEntries(formDataObj.entries());

        if (isEditMode && !data.password) {
            delete data.password;
        }

        data.basicSalary = Number(data.basicSalary) || 0;
        data.allowance = Number(data.allowance) || 0;
        data.deductions = Number(data.deductions) || 0;

        try {
            const url = isEditMode 
                ? `/employees/${initialData._id || initialData.id}` 
                : "/employees";
            
            const method = isEditMode ? "put" : "post";

            const response = await api[method](url, data);
            
            if (response.data.success) {
                toast.success(isEditMode ? "Employee updated!" : "Employee created!");
                onSuccess ? onSuccess() : navigate("/employees");
            }
        } catch (error) {
            console.error("Submission Error Details:", error.response || error);
            
            const errorMessage = error.response?.data?.error || error.message || "Submission failed";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-6 max-w-3xl animate-fade-in" key={initialData?._id || 'new'} onSubmit={handleSubmit}>

            <div className="card p-5 sm:p-6 bg-white shadow-sm border border-slate-200 rounded-xl">
                <h3 className="font-medium mb-6 pb-4 border-b border-slate-100 text-slate-900">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700">
                    <div>
                        <label className="block mb-2 font-medium">First Name</label>
                        <input name="firstName" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required defaultValue={initialData?.firstName} />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Last Name</label>
                        <input name="lastName" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required defaultValue={initialData?.lastName} />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Phone Number</label>
                        <input name="phone" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required defaultValue={initialData?.phone} />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Join Date</label>
                        <input name="joinDate" type="date" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required defaultValue={initialData?.joinDate ? new Date(initialData.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block mb-2 font-medium">Bio (Optional)</label>
                        <textarea name="bio" defaultValue={initialData?.bio} rows={3} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Brief professional description..." />
                    </div>
                </div>
            </div>

            <div className="card p-5 sm:p-6 bg-white shadow-sm border border-slate-200 rounded-xl">
                <h3 className="text-base font-medium text-slate-900 mb-6 pb-4 border-b border-slate-100">Employment Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700">
                    <div>
                        <label className="block mb-2 font-medium">Department</label>
                        <select name="department" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={initialData?.department || ""}>
                            <option value="">Select Department</option>
                            {DEPARTMENTS.map((deptName) => (
                                <option key={deptName} value={deptName}>{deptName}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Position</label>
                        <input name="position" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required defaultValue={initialData?.position} />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Basic Salary</label>
                        <input name="basicSalary" type="number" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required min="0" step="0.01" defaultValue={initialData?.basicSalary || 0} />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Allowance</label>
                        <input name="allowance" type="number" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" min="0" step="0.01" required defaultValue={initialData?.allowance || 0} />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Deductions</label>
                        <input name="deductions" type="number" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" min="0" step="0.01" required defaultValue={initialData?.deductions || 0} />
                    </div>

                    {isEditMode && (
                        <div>
                            <label className="block mb-2 font-medium">Status</label>
                            <select name="employmentStatus" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={initialData?.employmentStatus}>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="ON_LEAVE">On Leave</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="card p-5 sm:p-6 bg-white shadow-sm border border-slate-200 rounded-xl">
                <h3 className="text-base font-medium text-slate-900 mb-6 pb-4 border-b border-slate-100">Account Setup</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700">
                    <div className="sm:col-span-2">
                        <label className="block mb-2 font-medium">Work Email</label>
                        <input name="email" type="email" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required defaultValue={initialData?.email} />
                    </div>

                    {!isEditMode && (
                        <div>
                            <label className="block mb-2 font-medium">Temporary Password</label>
                            <input name="password" type="password" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                        </div>
                    )}

                    {isEditMode && (
                        <div>
                            <label className="block mb-2 font-medium">Change Password (Optional)</label>
                            <input name="password" type="password" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Leave blank to keep current" />
                        </div>
                    )}

                    <div>
                        <label className="block mb-2 font-medium">System Role</label>
                        <select name="role" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={initialData?.user?.role || "EMPLOYEE"}>
                            <option value="EMPLOYEE">Employee</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                <button type="button" className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => (onCancel ? onCancel() : navigate(-1))}>
                    Cancel
                </button>
                <button type="submit" disabled={loading} className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center transition-all">
                    {loading && <Loader2Icon className="w-4 mr-2 animate-spin" />}
                    {isEditMode ? "Update Employee" : "Create Employee"}
                </button>
            </div>
        </form>
    );
};

export default EmployeeForm;