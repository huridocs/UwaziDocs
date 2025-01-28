import { z } from 'zod';

type StyleType = z.infer<typeof StyleSchema>;
const StyleSchema = z.enum(['contain', 'cover'], {
  message: 'You should only provide "contain" or "cover" as type',
});

export type { StyleType };
export { StyleSchema };
