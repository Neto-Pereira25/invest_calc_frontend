import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, Outlet } from 'react-router-dom';

export default function PublicLayout() {
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
                        to="/"
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            color: 'var(--text)',
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            fontWeight: 700,
                        }}
                    >
                        InvestCalc
                    </Navbar.Brand>

                    <Navbar.Toggle />

                    <Navbar.Collapse>
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/" style={{ color: 'var(--text-dim)' }}>
                                Entrar
                            </Nav.Link>

                            <Nav.Link as={Link} to="/register" style={{ color: 'var(--text-dim)' }}>
                                Cadastrar
                            </Nav.Link>

                            <Nav.Link
                                as={Link}
                                to="/compound-interest-simulator"
                                style={{ color: 'var(--text-dim)' }}
                            >
                                Simulador de Juros Compostos
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container
                style={{
                    flex: 1,
                    paddingTop: '32px',
                    paddingBottom: '32px',
                }}
            >
                <Outlet />
            </Container>

            <footer
                style={{
                    textAlign: 'center',
                    padding: '24px',
                    borderTop: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                }}
            >
                © {new Date().getFullYear()} InvestCalc - Todos os direitos reservados
            </footer>
        </div>
    );
}
