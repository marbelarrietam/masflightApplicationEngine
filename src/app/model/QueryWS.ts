import {Tables} from './Tables';
import { QueryArgument } from './QueryArgument';
import { CustomFunctions } from './CustomFunctions';

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
  "customFunctions": Array<CustomFunctions>;
  "url": string;
  "wrapped": string;
  "groupingList":string;
  "sortingList":string;
  "groupBySentence":string;
  "sortingSentence":string;
  "checkColumn":string;
  "connection":number

  constructor(){
    this.name = '';
    this.tables = new Array();
    this.pageSize = 0;
    this.arguments = new Array();
    this.customFunctions = new Array();
    this.whereclause = '';
    this.havingclause = '';
    this.query = '';
    this.description = '';
    this.method = 'GET';
    this.url = '';
    this.wrapped = '1';
    this.groupingList = '0';
    this.sortingList = '0';
    this.groupBySentence ='';
    this.sortingSentence='';
    this.checkColumn = '0';
    this.connection=null;
  }

}
