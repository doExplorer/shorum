let isLogout: boolean | undefined;

export function isLoggedOut() {
    return isLogout === true;
}

export function loggedOut() {
    isLogout = true;
}

export function loggedIn() {
    isLogout = false;
}
