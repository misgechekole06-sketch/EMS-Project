import { Check, Loader2, X } from 'lucide-react'
import React, { useState } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../api/axios'

const LeaveHistory = ({ leaves = [], isAdmin, onUpdate }) => {
  const [processing, setProcessing] = useState(null)

  const handleStatusUpdate = async (id, status) => {
    setProcessing(id)
    try {
      
      const res = await api.patch(`/leave/${id}`, { status })
      
      if (res.data.success) {
        toast.success(`Leave ${status.toLowerCase()} successfully`)
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error("Status update error:", error)
      toast.error(error?.response?.data?.error || "Failed to update status")
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-modern">
          <thead>
            <tr>
              {isAdmin && <th>Employee</th>}
              <th>Type</th>
              <th>Date Range</th>
              <th>Reason</th>
              <th>Status</th>
              {isAdmin && <th className="text-center">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 4} className="text-center py-12 text-slate-400">
                  No leave applications found
                </td>
              </tr>
            ) : (
              leaves.map((leave) => {
                const leaveId = leave.id || leave._id;
                const isProcessing = processing === leaveId;

                return (
                  <tr key={leaveId}>
                    {isAdmin && (
                      <td className="font-medium text-slate-900">
                        {leave.employee?.firstName} {leave.employee?.lastName}
                      </td>
                    )}

                    <td>
                      <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                        {leave.type}
                      </span>
                    </td>

                    <td className="text-xs text-slate-500">
                      {format(new Date(leave.startDate), "MMM dd")} - {format(new Date(leave.endDate), "MMM dd yyyy")}
                    </td>

                    <td className="max-w-[200px] truncate text-slate-500" title={leave.reason}>
                      {leave.reason}
                    </td>

                    <td>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        leave.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : 
                        leave.status === "REJECTED" ? "bg-rose-100 text-rose-700" : 
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {leave.status}
                      </span>
                    </td>

                    {isAdmin && (
                      <td>
                        <div className="flex justify-center gap-2">
                          {leave.status === "PENDING" ? (
                            <>
                              <button
                                disabled={!!processing}
                                onClick={() => handleStatusUpdate(leaveId, "APPROVED")}
                                className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              </button>

                              <button
                                disabled={!!processing}
                                onClick={() => handleStatusUpdate(leaveId, "REJECTED")}
                                className="p-1.5 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Processed</span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LeaveHistory