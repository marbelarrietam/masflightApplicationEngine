import {Tables} from './Tables';
import { QueryArgument } from './QueryArgument';

export class QueryWS {
  "id": string;
  "name": string;
  "tables": Array<Tables>;
  "pageSize": number;
  "query": string;
  "whereclause": string;
  "havingclause": string;
  "description": string;
  "method": string;
  "arguments": Array<QueryArgument>;
  "url": string;
  "direction_order":string;

  constructor(){
    this.name = '';
    this.tables = new Array();
    this.pageSize = 0;
    this.arguments = new Array();
    this.whereclause = '';
    this.havingclause = '';
    this.query = '';
    this.description = '';
    this.method = 'GET';
    this.url = '';
    this.direction_order = 'DESC';

  }

}
