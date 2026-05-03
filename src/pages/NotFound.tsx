import { Link } from 'react-router-dom';
import s from './NotFound.module.css';

export default function NotFound() {
    return (
        <div className={s.wrap}>
            <div className={s.card}>
                <h1 className={s.code}>404</h1>
                <h2 className={s.title}>Pagina nao encontrada</h2>
                <p className={s.text}>A rota que voce tentou acessar nao existe.</p>
                <Link className={s.link} to='/'>
                    Voltar ao inicio
                </Link>
            </div>
        </div>
    );
}
