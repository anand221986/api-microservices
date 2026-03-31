"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TruncateNumberPipe = void 0;
const common_1 = require("@nestjs/common");
let TruncateNumberPipe = class TruncateNumberPipe {
    transform(value, metadata) {
        return value;
    }
    transformData(value, ...args) {
        if (value != null && !isNaN(value)) {
            if (args != null && args[0] != null && args[0] != undefined && !isNaN(args[0])) {
                return this.toTruncFixed(value, args[0]);
            }
            else {
                return value;
            }
        }
        else {
            return value;
        }
    }
    toTruncFixed(value, n) {
        return this.toTrunc(value, n).toFixed(n);
    }
    toTrunc(value, n) {
        return Math.floor(value * Math.pow(10, n)) / (Math.pow(10, n));
    }
};
exports.TruncateNumberPipe = TruncateNumberPipe;
exports.TruncateNumberPipe = TruncateNumberPipe = __decorate([
    (0, common_1.Injectable)()
], TruncateNumberPipe);
//# sourceMappingURL=truncate-number.pipe.js.map