import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import GerantDashboard from './pages/GerantDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/gerant" element={<GerantDashboard />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}