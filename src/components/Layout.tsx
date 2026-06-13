import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    FaBars,
    FaChartLine,
    FaChartPie,
    FaClipboardList,
    FaInfoCircle,
    FaMoneyCheckAlt,
    FaSignOutAlt,
    FaTimes,
    FaUser,
    FaWallet,
    FaChevronDown,
} from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import s from './Layout.module.css';
import { infoToast } from './ui/toast';

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
    const [isSimulacoesOpen, setIsSimulacoesOpen] = useState(
        location.pathname === '/retirement-simulator' ||
        location.pathname === '/reverse-simulation' ||
        location.pathname === '/scenario-comparison' ||
        location.pathname === '/compound-interest-simulator'
    );
    const simulacoesActive =
        location.pathname === '/retirement-simulator' ||
        location.pathname === '/reverse-simulation' ||
        location.pathname === '/scenario-comparison' ||
        location.pathname === '/compound-interest-simulator';

    const userProfile = useMemo(() => decodeToken(token), [token]);
    const displayName = userProfile?.name || userProfile?.username || 'Usuario';
    const displayEmail = userProfile?.email || userProfile?.sub || 'email@email.com';
    const avatarLetter = displayName.charAt(0).toUpperCase();

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    function handleLogout() {
        logout();
        infoToast('Logout realizado com sucesso');
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

                    {/* GRUPO SIMULAÇÕES */}
                    <div className={s.navGroup}>
                        <button
                            type="button"
                            className={`${s.navItem} ${s.navGroupToggle} ${simulacoesActive ? s.active : ''}`}
                            onClick={() => setIsSimulacoesOpen((v) => !v)}
                        >
                            <FaChartLine />
                            <span style={{ flex: 1 }}>Simulações</span>
                            <FaChevronDown
                                className={`${s.chevron} ${isSimulacoesOpen ? s.chevronOpen : ''}`}
                            />
                        </button>
                        {isSimulacoesOpen && (
                            <div className={s.navSubItems}>
                                <NavLink
                                    to="/compound-interest-simulator"
                                    className={({ isActive }) => `${s.navSubItem} ${isActive ? s.active : ''}`}
                                >
                                    <span>Juros Compostos</span>
                                </NavLink>
                                <NavLink
                                    to="/retirement-simulator"
                                    className={({ isActive }) => `${s.navSubItem} ${isActive ? s.active : ''}`}
                                >
                                    <span>Aposentadoria</span>
                                </NavLink>
                                <NavLink
                                    to="/reverse-simulation"
                                    className={({ isActive }) => `${s.navSubItem} ${isActive ? s.active : ''}`}
                                >
                                    <span>Reversa</span>
                                </NavLink>
                                <NavLink
                                    to="/scenario-comparison"
                                    className={({ isActive }) => `${s.navSubItem} ${isActive ? s.active : ''}`}
                                >
                                    <span>Comparação</span>
                                </NavLink>
                            </div>
                        )}
                    </div>
                    <NavLink to="/transactions" className={({ isActive }) => `${s.navItem} ${isActive ? s.active : ''}`}>
                        <FaWallet />
                        <span>Lancamentos</span>
                    </NavLink>

                    <NavLink to="/repeated-expenses" className={({ isActive }) => `${s.navItem} ${isActive ? s.active : ''}`}>
                        <FaWallet />
                        <span>Gastos Recorrentes</span>
                    </NavLink>

                    <NavLink to="/goals" className={({ isActive }) => `${s.navItem} ${isActive ? s.active : ''}`}>
                        <FaChartLine />
                        <span>Metas</span>
                    </NavLink>

                    <NavLink
                        to="/financial-profile"
                        className={({ isActive }) => `${s.navItem} ${isActive ? s.active : ''}`}
                    >
                        <FaClipboardList />
                        <span>Perfil Financeiro</span>
                    </NavLink>

                    <NavLink to="/spending-limit" className={({ isActive }) => `${s.navItem} ${isActive ? s.active : ''}`}>
                        <FaMoneyCheckAlt />
                        <span>Limite de Gastos</span>
                    </NavLink>

                    <NavLink to="/profile" className={({ isActive }) => `${s.navItem} ${isActive ? s.active : ''}`}>
                        <FaUser />
                        <span>Perfil</span>
                    </NavLink>

                    <NavLink to="/about" className={({ isActive }) => `${s.navItem} ${isActive ? s.active : ''}`}>
                        <FaInfoCircle />
                        <span>Sobre</span>
                    </NavLink>
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