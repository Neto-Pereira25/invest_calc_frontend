import Loading from './components/Loading';
import { useUIStore, type UIState } from './store/uiStore';
import AppRoutes from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
    const isLoading = useUIStore((state: UIState) => state.isLoading);

    return (
        <>
            {isLoading && <Loading />}
            <AppRoutes />
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </>
    );
}