import Loading from './components/Loading';
import { useUIStore, type UIState } from './store/uiStore';
import AppRoutes from './routes';

export default function App() {
    const isLoading = useUIStore((state: UIState) => state.isLoading);

    return (
        <>
            {isLoading && <Loading />}
            <AppRoutes />
        </>
    );
}