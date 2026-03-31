import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
export declare class TruncateNumberPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata): any;
    transformData(value: any, ...args: number[]): any;
    toTruncFixed(value: any, n: any): string;
    toTrunc(value: any, n: any): number;
}
