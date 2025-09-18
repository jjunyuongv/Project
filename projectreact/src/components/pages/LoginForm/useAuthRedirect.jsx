// @ts-nocheck
import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const useAuthRedirect = () => {
    const { isLoggedIn } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            setShowModal(true);
        } else {
            setShowModal(false);
            setShouldRedirect(false);
        }
    }, [isLoggedIn]);

    const handleConfirm = () => {
        setShowModal(false);
        setShouldRedirect(true);
    };

    return { showModal, handleConfirm, shouldRedirect, isLoggedIn };
};

export default useAuthRedirect;