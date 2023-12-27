import { DURATION_ENUM } from 'src/constant';

export interface Leave {
  id: number;
  from: string;
  to: string;
  duration: DURATION_ENUM;
  user: string;
}
