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
  "orderBy": string;
  "orderByBool": boolean;
  "aggregationFunction": string;
  "alias": string;
  "selectedResult":string;
  "delete":boolean;
  "order": number;
  "orderDirection":string;

  constructor(){
    this.name = '';
    this.aggregationFunction = '';
    this.alias = '';
    this.typePresentation = 'value';
    this.groupBy = '0';
    this.groupByBool = false;
    this.orderBy = '0';
    this.orderByBool = false;
    this.functionsAux = new Functions();
    this.functions = new Array();
    this.delete = false;
    this.selectedResult = '0';
    this.order = 0;
    this.orderDirection = '';
  }
}
