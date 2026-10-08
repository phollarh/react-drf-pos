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
                console.log(permittedRoles)
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

                console.log(err.response);

                hasRedirected.current = true;

                setSession(null);
                setStaffStatus(undefined);
                setEmployeeId("");

                navigate("/authorization", {
                    replace: true,
                });
            }
        };

        getSession();

        return () => {
            ignoreResult = true;
        };
    }, [
        access,
        jwtAxios,
        navigate,
        location.pathname,
        setStaffStatus,
        setEmployeeId,
    ]);

    if (checkingSession || !session) {
        return null;
    }

    return <>{children}</>;
};

export default ProtectedRoute;