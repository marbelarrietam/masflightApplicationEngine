import { Functions } from './Functions';

export class Columns{
  "name": string;
  "type": string;
  "functions": Functions;
  "selected": boolean;
  "groupBy": boolean;

  constructor(){
    this.name = '';
    this.type = '';
    this.groupBy = false;
    this.functions = new Functions();
  }
}
