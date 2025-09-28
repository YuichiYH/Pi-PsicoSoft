import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '70px' }}>
        <Outlet />
      </div>
    </>
  )
}