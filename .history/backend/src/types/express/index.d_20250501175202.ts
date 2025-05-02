import { Request } from 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      name?: string;
      email?: string;
    };
  }
}

export {};