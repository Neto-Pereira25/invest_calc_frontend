import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 20 }}>
            <div>
                <h1 style={{ fontSize: 64, marginBottom: 12, background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</h1>
                <p style={{ color: 'var(--text-dim)', marginBottom: 20 }}>Página não encontrada.</p>
                <Link to='/'>Voltar ao início</Link>
            </div>
        </div>
    );
}
