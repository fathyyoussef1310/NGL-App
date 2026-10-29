import {toMins} from "../../pkg/utils/time.js";


const baseOptions = {
    httpOnly: true,
    sameSite: "strict",
};

export const setAuthCookies = (res, { accessToken, refreshToken }) => {
    res.cookie('access_token', accessToken, {
        ...baseOptions,
        maxAge: toMins(15, "minutes"),
    });

    res.cookie('refresh_token', refreshToken, {
        ...baseOptions,
        maxAge: toMins(7, "days"),
        path: "/api/auth/refresh-token",
    });
};

export const clearAuthCookies = (res) => {
    res.clearCookie('access_token', baseOptions);
    res.clearCookie('refresh_Token', {...baseOptions,
        path: "/api/auth/refresh-token",
    });
};