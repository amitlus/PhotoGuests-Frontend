const getBackendBaseUrl = () => {
    return process.env.NODE_ENV === "development"
        ? process.env.REACT_APP_BACKEND_LOCAL_HOST
        : process.env.REACT_APP_BACKEND_PROD_HOST;
};

const getVipUsers = () => {
    const vipUsers = process.env.REACT_APP_VIP_USERS || "";
    return vipUsers.split(",").map(email => email.trim());
};

export {getBackendBaseUrl, getVipUsers};
