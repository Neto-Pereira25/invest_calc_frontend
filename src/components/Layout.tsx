import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    FaBars,
    FaChartLine,
    FaChartPie,
    FaInfoCircle,
    FaSignOutAlt,
    FaTimes,
    FaUser,
    FaWallet,
} from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import s from './Layout.module.css';

type DecodedToken = {
    name?: string;
    username?: string;
    email?: string;
    sub?: string;
};

function decodeToken(token: string | null): DecodedToken | null {
    if (!token) {
        return null;
    }

    try {
        const payload = token.split('.')[1];
        if (!payload) {
            return null;
        }

        const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(json) as DecodedToken;
    } catch {
        return null;
    }
}

export default function Layout() {
    const token = useAuthStore((state) => state.token);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const userProfile = useMemo(() => decodeToken(token), [token]);
    const displayName = userProfile?.name || userProfile?.username || 'Usuario';
    const displayEmail = userProfile?.email || userProfile?.sub || 'email@email.com';
    const avatarLetter = displayName.charAt(0).toUpperCase();

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    function handleLogout() {
        logout();
        navigate('/');
    }

    return (
        <div className={s.shell}>
            {isSidebarOpen && <button className={s.backdrop} onClick={() => setIsSidebarOpen(false)} />}

            <aside className={`${s.sidebar} ${isSidebarOpen ? s.sidebarOpen : ''}`}>
                <div className={s.brand}>
                    <div className={s.logo}>IC</div>
                    <div className={s.brandText}>InvestCalc</div>
                </div>

                <nav className={s.nav}>
                    <NavLink to="/dashboard" className={({ isActive }) => `${s.navItem} ${isActive ? s.active : ''}`}>
                        <FaChartPie />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink to="/transactions" className={({ isActive }) => `${s.navItem} ${isActive ? s.active : ''}`}>
                        <FaWallet />
                        <span>Lancamentos</span>
                    </NavLink>

                    <NavLink
                        to="/compound-interest-simulator"
                        className={({ isActive }) => `${s.navItem} ${isActive ? s.active : ''}`}
                    >
                        <FaChartLine />
                        <span>Simulador</span>
                    </NavLink>

                    <div className={`${s.navItem} ${s.disabled}`}>
                        <FaUser />
                        <span>Perfil</span>
                    </div>

                    <div className={`${s.navItem} ${s.disabled}`}>
                        <FaInfoCircle />
                        <span>Sobre</span>
                    </div>
                </nav>

                <div className={s.sidebarFooter}>
                    <div className={s.userBlock}>
                        <div className={s.avatar}>{avatarLetter}</div>
                        <div className={s.userInfo}>
                            <div className={s.userName}>{displayName}</div>
                            <div className={s.userEmail}>{displayEmail}</div>
                        </div>
                    </div>

                    <button className={s.logoutButton} onClick={handleLogout}>
                        <FaSignOutAlt />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            <main className={s.main}>
                <header className={s.mobileHeader}>
                    <button className={s.menuButton} onClick={() => setIsSidebarOpen((prev) => !prev)}>
                        {isSidebarOpen ? <FaTimes /> : <FaBars />}
                    </button>
                    <div className={s.mobileTitle}>InvestCalc</div>
                </header>

                <div className={s.content}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}