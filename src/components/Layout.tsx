import { Container, Navbar, Nav } from 'react-bootstrap';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Layout() {
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/');
    }

    return (
        <div
            style={{
                backgroundColor: 'var(--bg)',
                minHeight: '100vh',
                color: 'var(--text)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* 🔝 NAVBAR */}
            <Navbar
                expand="lg"
                style={{
                    backgroundColor: 'var(--bg-elev)',
                    borderBottom: '1px solid var(--border)',
                }}
            >
                <Container>
                    <Navbar.Brand
                        as={Link}
                        to="/dashboard"
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            color: 'var(--text)',
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            fontWeight: 700
                        }}
                    >
                        InvestCalc
                    </Navbar.Brand>

                    <Navbar.Toggle />

                    <Navbar.Collapse>
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/dashboard" style={{ color: 'var(--text-dim)' }}>
                                Dashboard
                            </Nav.Link>

                            <Nav.Link as={Link} to="/transactions" style={{ color: 'var(--text-dim)' }}>
                                Transações
                            </Nav.Link>
                        </Nav>

                        <Nav>
                            <Nav.Link onClick={handleLogout} style={{ color: 'var(--danger)' }}>
                                Sair
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* 📦 CONTEÚDO (AGORA FLEXÍVEL) */}
            <Container
                style={{
                    flex: 1, // 🔥 ISSO EMPURRA O FOOTER PRA BAIXO
                    paddingTop: '32px',
                    paddingBottom: '32px',
                }}
            >
                <Outlet />
            </Container>

            {/* 🔻 FOOTER FIXO NO FINAL */}
            <footer
                style={{
                    textAlign: 'center',
                    padding: '24px',
                    borderTop: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    fontSize: '14px', // 🔥 aumentamos aqui
                }}
            >
                © {new Date().getFullYear()} InvestCalc — Todos os direitos reservados
            </footer>
        </div>
    );
}