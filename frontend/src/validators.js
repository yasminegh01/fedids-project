// frontend/src/utils/validators.js
export const validateDeviceName = (name) => {
    if (!name || name.trim() === "") return "Device name is required.";
    if (name.length < 3) return "Device name must be at least 3 characters.";
    if (name.length > 50) return "Device name must be less than 50 characters.";
    return null;
};

export const validateIpAddress = (ip) => {
    if (!ip) return null; // Champ optionnel
    const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
    return ipv4Regex.test(ip) ? null : "Invalid IPv4 address format.";
};

export const validateMacAddress = (mac) => {
    if (!mac) return null; // Champ optionnel
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac) ? null : "Invalid MAC address format (e.g., 00:1A:2B:3C:4D:5E).";
};