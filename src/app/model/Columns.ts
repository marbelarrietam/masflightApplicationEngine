import { Functions } from './Functions';

export class Columns{
  "name": string;
  "typePresentation": string;
  "functions": Functions;
  "selected": boolean;
  "groupBy": number;
  "aggregationFunction": string;

  constructor(){
    this.name = '';
    this.aggregationFunction = '';
    this.typePresentation = 'value';
    this.groupBy = 0;
    this.functions = new Functions();
  }
}
