import { toast } from 'react-toastify';

const baseConfig = {
    position: 'top-right' as const,
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'dark' as const,
};

export function successToast(message: string) {
    toast.success(message, baseConfig);
}

export function errorToast(message: string) {
    toast.error(message, baseConfig);
}

export function warningToast(message: string) {
    toast.warning(message, baseConfig);
}

export function infoToast(message: string) {
    toast.info(message, baseConfig);
}
