"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClusterService = void 0;
const common_1 = require("@nestjs/common");
const os_1 = require("os");
const cluster = require('cluster');
const process = require("node:process");
let ClusterService = class ClusterService {
    static clusterize(callback) {
        if (process.env.NODE_ENV !== "production") {
            callback();
            return;
        }
        const numCPUs = (0, os_1.availableParallelism)();
        if (cluster.isPrimary) {
            console.log(`Master ${process.pid} running`);
            for (let i = 0; i < numCPUs; i++) {
                cluster.fork();
            }
            cluster.on("exit", (worker) => {
                console.log(`Worker ${worker.process.pid} died`);
                cluster.fork();
            });
        }
        else {
            callback();
        }
    }
};
exports.ClusterService = ClusterService;
exports.ClusterService = ClusterService = __decorate([
    (0, common_1.Injectable)()
], ClusterService);
//# sourceMappingURL=cluster.service.js.map