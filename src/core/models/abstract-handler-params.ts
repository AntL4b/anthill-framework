import { AHCallable } from '../../framework/models/handler/callable';


export interface AHAbstractHandlerParams<T, U>  {
  name: string;
  callable: AHCallable<T, U>;
}
