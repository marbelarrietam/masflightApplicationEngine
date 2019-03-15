import {Tables} from './Tables';
import { QueryArgument } from './QueryArgument';

export class QueryWS {
  "name": string;
  "tables": Array<Tables>;
  "arguments": Array<QueryArgument>;

  constructor(){
    this.name = '';
    this.tables = new Array();
    this.arguments = new Array();
  }

}
