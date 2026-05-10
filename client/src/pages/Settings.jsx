import { useEffect, useState } from "react"
import Loading from "../components/Loading"
import { Lock } from "lucide-react"
import ProfileForm from "../components/ProfileForm"
import ChangePasswordModal from "../components/ChangePasswordModal"
import { useAuth } from "../context/AuthContext";
import api from '../api/axios'; 
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  
  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await api.get("/profile")
    
      console.log("Settings Profile Data:", res.data);
      const profileData = res.data.user || res.data.employee || res.data.data || res.data;
      
      if (profileData) {
        setProfile(profileData);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user])

  if (loading) return <Loading />

  return (
    <div className="animate-fade-in p-4 sm:p-6">
      <div className='page-header mb-8'>
        <h1 className='page-title text-2xl font-bold text-slate-900'>Settings</h1>
        <p className='page-subtitle text-slate-500'>Manage your account and preferences</p>
      </div>
      
      <div className="mb-8">
        {profile ? (
          <ProfileForm 
            initialData={profile} 
            onSuccess={fetchProfile}
          /> 
        ) : (
          <div className="card p-6 text-center text-slate-500">
            Unable to load profile information.
          </div>
        )}
      </div>

      <div className='card max-w-md p-6 flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-100'>
        <div className='flex items-center gap-3'>
          <div className='p-2.5 bg-slate-100 rounded-lg'>
            <Lock className='w-5 h-5 text-slate-600'/>
          </div>
          <div>
            <p className='font-medium text-slate-900'>Password</p>
            <p className='text-sm text-slate-500'>Update your security credentials</p>
          </div>
        </div>
        <button 
          onClick={() => setShowPasswordModal(true)}
          className='px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors'
        >
          Change
        </button>
      </div>

      <ChangePasswordModal 
        open={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  )
}

export default Settings