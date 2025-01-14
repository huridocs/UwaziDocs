import { NextFunction, Request, Response } from 'express';

export type Dependencies = {
  next: NextFunction;
  res: Response;
};

export abstract class AbstractController {
  protected next: NextFunction;

  protected res: Response;

  constructor({ next, res }: Dependencies) {
    this.next = next;
    this.res = res;
  }

  abstract handle(request: Request): Promise<void>;
}
