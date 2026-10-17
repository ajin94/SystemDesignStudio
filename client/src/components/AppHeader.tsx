import { NavLink } from 'react-router-dom';
import styles from './AppHeader.module.css';

// Sessions and Settings screens are not built yet; they render as inert "coming soon" items.
const PENDING_NAV = ['Sessions', 'Settings'];

export function AppHeader() {
  return (
    <header className={styles.header}>
      <NavLink to="/" className={styles.logo}>
        SysDesign Studio
      </NavLink>
      <nav className={styles.nav} aria-label="Main">
        <NavLink to="/" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          Problems
        </NavLink>
        {PENDING_NAV.map((label) => (
          <span key={label} className={styles.navItem} aria-disabled="true" title="Coming soon">
            {label}
          </span>
        ))}
      </nav>
      {/* Settings API is not built yet, so the AI status is always "not configured" for now. */}
      <div className={styles.aiStatus} title="AI provider settings are coming soon">
        <span className={styles.dot} aria-hidden="true" />
        AI: not configured
      </div>
    </header>
  );
}
