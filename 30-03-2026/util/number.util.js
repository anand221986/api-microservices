"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeNumeric = safeNumeric;
function safeNumeric(value) {
    return value !== null && value !== undefined && value !== '' && !isNaN(value)
        ? Number(value)
        : 0;
}
//# sourceMappingURL=number.util.js.map