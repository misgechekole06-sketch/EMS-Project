import { Loader2, Plus, X } from 'lucide-react'
import React, { useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const GeneratePayslipForm = ({ employees = [], onSuccess }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    if (!isOpen) return (
        <button 
            onClick={() => setIsOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md"
        >
            <Plus className="w-4 h-4"/>Generate Payslip
        </button>
    )

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())
        
        try {
            const res = await api.post('/payslips', data)
            if (res.data.success) {
                toast.success("Payslip generated successfully!")
                setIsOpen(false)
                onSuccess()
            }
        } catch (err) {
            toast.error(err.response?.data?.error || err?.message || "Failed to generate payslip");
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className='bg-white max-w-lg w-full p-6 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200'>
                <div className='flex justify-between items-center mb-6'>
                    <h3 className='text-xl font-bold text-slate-800'>Generate Monthly Payslip</h3>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className='text-slate-400 hover:text-slate-600 transition-colors'
                    >
                        <X size={24}/>
                    </button>
                </div> 

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-1'>Employee</label>
                        <select 
                            name="employeeId" 
                            required 
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            <option value="">Select an employee</option>
                            {employees.length > 0 ? (
                                employees.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.firstName} {e.lastName} ({e.position})
                                    </option>
                                ))
                            ) : (
                                <option disabled>No active employees found</option>
                            )}
                        </select>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className='block text-sm font-semibold text-slate-700 mb-1'>Month</label>  
                            <select name="month" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white">
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                    <option key={m} value={m}>
                                        {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))}
                            </select> 
                        </div>
                        <div>
                            <label className='block text-sm font-semibold text-slate-700 mb-1'>Year</label> 
                            <input 
                                type="number" 
                                name="year" 
                                defaultValue={new Date().getFullYear()}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl"
                            />                     
                        </div>
                    </div>

                    <div>
                        <label className='block text-sm font-semibold text-slate-700 mb-1'>Basic Salary</label> 
                        <input 
                            type="number" 
                            name="basicSalary" 
                            placeholder="e.g. 5000" 
                            required 
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl"
                        />                     
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className='block text-sm font-semibold text-slate-700 mb-1'>Allowances</label> 
                            <input type="number" name="allowances" defaultValue="0" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl"/>                     
                        </div>
                        <div>
                            <label className='block text-sm font-semibold text-slate-700 mb-1'>Deductions</label> 
                            <input type="number" name="deductions" defaultValue="0" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl"/>                     
                        </div>
                    </div>

                    <div className='flex justify-end gap-3 pt-6 border-t border-slate-100 mt-4'>
                        <button 
                            onClick={() => setIsOpen(false)}
                            type='button' 
                            className='px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors'
                        >
                            Cancel
                        </button>
                        <button 
                            disabled={loading || employees.length === 0}
                            type='submit' 
                            className='px-6 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center transition-all shadow-sm'
                        >
                            {loading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
                            Generate
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default GeneratePayslipForm