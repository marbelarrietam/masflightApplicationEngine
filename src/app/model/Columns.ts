import { Functions } from './Functions';
import { AggregateFucntions } from './AggregateFunctions';

export class Columns{
  "id": string;
  "name": string;
  "typePresentation": string;
  "functions": Array<AggregateFucntions>;
  "functionsAux": Functions;
  "selected": boolean;
  "groupBy": string;
  "groupByBool": boolean;
  "aggregationFunction": string;
  "alias": string;
  "selectedResult":string;
  "delete":boolean;

  constructor(){
    this.name = '';
    this.aggregationFunction = '';
    this.alias = '';
    this.typePresentation = 'value';
    this.groupBy = '0';
    this.groupByBool = false;
    this.functionsAux = new Functions();
    this.functions = new Array();
    this.delete = false;
    this.selectedResult = '0';
  }
}
