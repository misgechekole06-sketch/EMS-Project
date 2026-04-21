import {Toaster} from 'react-hot-toast';
import { Route, Routes, Navigate } from 'react-router-dom';
import LoginLanding from './pages/LoginLanding';
import LoginForm from './components/LoginForm';

// import { Settings } from 'lucide-react';

import Settings from './pages/Settings';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Leave from './pages/Leave';
import Payslips from './pages/Payslips';
import PrintPayslip from './pages/PrintPayslip';
// import Layout from './pages/Layout';
// import { LayoutDashboard, Settings } from 'lucide-react';
const App = () => {
  return (
    <>
      <Toaster/>
       <Routes>
        <Route path='/login' element={ <LoginLanding/>  }/>       

        <Route path='/login/admin' element={ <LoginForm role='admin' title='Admin Portal' subtitle='sign in to manage the organization'/>  }/>

        <Route path='/login/employee' element={ <LoginForm role='employee' title='Employee Portal' subtitle='sign in to access your account'/>  }/>

        <Route element={<Layout />}>
            <Route path='/dashboard' element={<Dashboard />}/> 
            <Route path='/employees' element={<Employees />}/> 
            <Route path='/attendance' element={<Attendance />}/>
            <Route path='/leave' element={<Leave />}/>
            <Route path='/payslips' element={<Payslips />}/>
            <Route path='/settings' element={<Settings />}/>
        </Route>
        <Route path='/print/payslips/:id' element={ <PrintPayslip/> }/>
         
        <Route path='*' element={<Navigate to='/dashboard' replace/>} />

      </Routes>
    </>
  )
}
export default App
