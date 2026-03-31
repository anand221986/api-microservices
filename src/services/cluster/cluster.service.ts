import { Injectable } from "@nestjs/common";
import { availableParallelism } from "os";
const cluster = require('cluster');
import * as process from 'node:process';

@Injectable()
export class ClusterService {
  static clusterize(callback: Function): void {

    // DO NOT use cluster in development
    if (process.env.NODE_ENV !== "production") {
      callback();
      return;
    }

    const numCPUs = availableParallelism();

    if (cluster.isPrimary) {
      console.log(`Master ${process.pid} running`);

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
      });

    } else {
      callback();
    }
  }
}