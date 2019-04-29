export class AggregateFucntions{
  "function": string;
  "alias": string;
  "label": string;
  "selected":boolean;
  "delete":boolean;
  "id": string;
  "orderBy": string;
  "orderDirection": string;

  constructor(){
    this.id = '';
    this.function = '';
    this.alias = '';
    this.label = '';
    this.selected = false;
    this.delete = false;
    this.orderBy = '1';
    this.orderDirection = '';
  }
}

