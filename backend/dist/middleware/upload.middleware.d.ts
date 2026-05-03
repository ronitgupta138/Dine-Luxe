import { Request, Response, NextFunction, RequestHandler } from 'express';
export declare function uploadSingle(fieldName: string, bucket: string, folder: string): RequestHandler[];
export declare function uploadMultiple(fieldName: string, maxCount: number, bucket: string, folder: string): RequestHandler[];
export declare function handleUploadError(err: Error, _req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=upload.middleware.d.ts.map