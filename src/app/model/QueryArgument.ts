export class QueryArgument {
  "label":string;
  "valueArray":any[];
  "type":string;
  "required":string;
  "requiredBool":boolean;
  "delete":boolean;
  "value":string;
  "grouping":string;
  "groupingBool":boolean;
  "sorting":string;
  "sortingBool":boolean;

  constructor(){
    this.label = '';
    this.type = 'string';
    this.required = 'true';
    this.requiredBool = true;
    this.delete = false;
    this.value = '';
    this.valueArray = [];
    this.grouping = '0';
    this.groupingBool = false;
    this.sorting = '0';
    this.sortingBool = false;
  }
}
