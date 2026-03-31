"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isExplicitFalse = isExplicitFalse;
exports.validEmail = validEmail;
function isExplicitFalse(value) {
    return value === false;
}
function validEmail(email) {
    const isGmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
    return isGmail;
}
//# sourceMappingURL=boolean.utils.js.map