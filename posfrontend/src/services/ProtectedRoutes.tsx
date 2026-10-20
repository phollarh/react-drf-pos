import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import useAxiosWithInterceptor from "../helper/jwtinterceptor";
import { BASE_URL_ACCOUNT } from "../congif";
import { UseoutletNstaffContext } from "../context/OutletNStaffsContext";
import { useAuthServiceContext } from "../context/AuthContext";
import { Box, CircularProgress, Typography } from "@mui/material";

type SessionRole =
    | "admin"
    | "supervisor"
    | "staff";

type AccessLevel =
    | "all"
    | "adminOrSupervisor"
    | "adminOnly";

interface ProtectedRouteProps {
    children: React.ReactNode;
    access?: AccessLevel;
}

interface Session {
    role: SessionRole;
    user_session_id: string;
    user_session_name: string;
}


const ACCESS_ROLES: Record<AccessLevel,SessionRole[]> = {
    all: [
        "admin",
        "supervisor",
        "staff",
    ],

    adminOrSupervisor: [
        "admin",
        "supervisor",
    ],

    adminOnly: [
        "admin",
    ],
};

const ProtectedRoute = ({
    children,
    access = "all",
}: ProtectedRouteProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const jwtAxios = useAxiosWithInterceptor();
    const {isLoggedIn, authLoading } = useAuthServiceContext()

    const {
        setStaffStatus,
        setEmployeeId,
    } = UseoutletNstaffContext();

    const [session, setSession] =
        useState<Session | null>(null);

    const [checkingSession, setCheckingSession] =
        useState(true);

    const hasRedirected = useRef(false);

    useEffect(() => {
        let ignoreResult = false;

        hasRedirected.current = false;

        setCheckingSession(true);
        setSession(null);

        const getSession = async () => {
            try {
                const response = await jwtAxios.get(
                    `${BASE_URL_ACCOUNT}/user/check_user_session/`,
                    {
                        withCredentials: true,
                    }
                );

                if (ignoreResult) {
                    return;
                }

                const currentSession =
                    response.data as Session;

                const permittedRoles =
                    ACCESS_ROLES[access];

                const roleIsAllowed =permittedRoles.includes(
                        currentSession.role
                    );
                
                if (!roleIsAllowed) {
                    if (hasRedirected.current) {
                        return;
                    }

                    hasRedirected.current = true;

                    sessionStorage.setItem(
                        "protected_route",
                        "Unauthorized access. Access denied."
                    );

                    navigate(-1);
                    return;
                }

                setSession(currentSession);
                setCheckingSession(false);
            } catch (err: any) {
                if (
                    ignoreResult ||
                    hasRedirected.current
                ) {
                    return;
                }

                

                hasRedirected.current = true;

                setSession(null);
                setStaffStatus(undefined);
                setEmployeeId("");

                navigate("/authorization", {
                    replace: true,
                });
            }
        };
        if(isLoggedIn){
            getSession();
            return () => {
                ignoreResult = true;
            };
        }
        

       
    }, [
        access,
        jwtAxios,
        navigate,
        location.pathname,
        setStaffStatus,
        setEmployeeId,
        isLoggedIn,
        authLoading
    ]);
    if( checkingSession || !session){
        return null
    }
    if (authLoading) {
        return (
        <Box
            role="status"
            aria-live="polite"
            sx={{
                position: "fixed",
                inset: 0,
                zIndex: (theme) => theme.zIndex.modal + 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
                p: 3,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    px: 5,
                    py: 4,
                    borderRadius: 4,
                    bgcolor: "background.paper",
                    border: 1,
                    borderColor: "divider",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                }}
            >
                <CircularProgress
                    size={40}
                    thickness={3}
                    aria-label="Checking your session"
                />

                <Typography variant="subtitle1" fontWeight={600}>
                    Getting things ready
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    Checking your session…
                </Typography>
            </Box>
        </Box>
        )
    }
    

    return <>{children}</>;
};

export default ProtectedRoute;