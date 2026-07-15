import { useEffect, useState } from 'react';
import {
  Outlet,
  NavLink,
  useLocation,
} from 'react-router-dom';

import {
  LayoutDashboard,
  FilePlus2,
  FileText,
  Flame,
  Menu,
  X,
} from 'lucide-react';

function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle(
      'menu-open',
      mobileMenuOpen
    );

    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [mobileMenuOpen]);

  return (
    <div className="app-shell">
      <header className="mobile-header no-print">
        <div className="mobile-brand">
          <div className="mobile-brand-icon">
            <Flame size={22} />
          </div>

          <div className="mobile-brand-text">
            <strong>AL FALAH</strong>
            <span>COAL TRADER</span>
          </div>
        </div>

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() =>
            setMobileMenuOpen((previous) => !previous)
          }
          aria-label={
            mobileMenuOpen
              ? 'Close navigation menu'
              : 'Open navigation menu'
          }
        >
          {mobileMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
      </header>

      {mobileMenuOpen && (
        <button
          type="button"
          className="sidebar-overlay no-print"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close navigation menu"
        />
      )}

      <aside
        className={`sidebar no-print ${
          mobileMenuOpen ? 'mobile-open' : ''
        }`}
      >
        <div className="brand">
          <div className="brand-icon">
            <Flame size={27} />
          </div>

          <div>
            <h2>AL FALAH</h2>
            <p>COAL TRADER</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive
                ? 'nav-link active'
                : 'nav-link'
            }
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/quotations/new"
            className={({ isActive }) =>
              isActive
                ? 'nav-link active'
                : 'nav-link'
            }
          >
            <FilePlus2 size={20} />
            <span>New Quotation</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <FileText size={18} />

          <div>
            <strong>Quotation System</strong>
            <span>Version 1.0</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;