import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <div className="page-shell">
      <Navbar />
      <main className="container-shell">
        <Outlet />
      </main>
    </div>
  );
}
