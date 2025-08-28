import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export function validateData(schema: z.ZodObject<any, any>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid data', details: error.issues });
        // const errorMessages = error.issues.map((issue: any) => ({
        //   message: `${issue.path.join('.')} is ${issue.message}`,
        // }))
        // res.status(400).json({ error: 'Invalid data', details: errorMessages });
      } else {
        console.error('Unhandled error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };
}