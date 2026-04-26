import s from './loading.module.css';

export default function Loading() {
    return (
        <div className={s.overlay}>
            <div className={s.spinner}></div>
        </div>
    );
}