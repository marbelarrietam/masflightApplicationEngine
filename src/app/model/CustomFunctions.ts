export class CustomFunctions{
  "id": string;
  "customText": string;
  "selected": boolean;
  "groupBy": string;
  "groupByBool": boolean;
  "orderBy": string;
  "orderByBool": boolean;
  "alias": string;
  "selectedResult":string;
  "delete":boolean;
  "order": number;
  "orderOrderBy":number;
  "orderGroupBy":number;
  "orderDirection":string;


  constructor(){
    this.customText = '';
    this.alias = ''
    this.groupBy = '0';
    this.groupByBool = false;
    this.orderBy = '0';
    this.orderByBool = false;
    this.delete = false;
    this.selectedResult = '1';
    this.order = 0;
    this.orderDirection = '';
    this.selected = false;
  }
}
