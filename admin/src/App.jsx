import React, { useContext } from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminContext } from './context/AdminContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import { DoctorContext } from './context/DoctorContext';
import DoctorDashBoard from './pages/Doctor/DoctorDashBoard';
import DoctorAppoitmnet from './pages/Doctor/DoctorAppoitmnet';
import DoctorProfile from './pages/Doctor/DoctorProfile';
import Patients from './pages/Doctor/Patients';

const App = () => {

  const { aToken } = useContext(AdminContext)
  const {dToken} = useContext(DoctorContext)

  return aToken || dToken ?(
    <div className='bg-[#F8F9FD]'>
      <ToastContainer />
      <Navbar/>
      <div className='flex items-start'>
        <Sidebar/>
        <Routes>
          {/* Admin Routes */}
          <Route path='/' element={<></>} />
          <Route path='/admin-dashboard' element={<Dashboard/>} />
          <Route path='/all-appointments' element={<AllAppointments/>} />
          <Route path='/add-doctor' element={<AddDoctor/>} />
          <Route path='/doctor-list' element={<DoctorsList/>} />
          {/* Doctor Routes */}
          <Route path='/doctor-dashboard' element={<DoctorDashBoard />} />
          <Route path='/doctor-appointments' element={<DoctorAppoitmnet />} />
          <Route path='/doctor-profile' element={<DoctorProfile />} />
          <Route path='/doctor-Patients' element={<Patients />} />
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  )
}

export default App