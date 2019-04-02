export class QueryArgument {
  "label":string;
  "type":string;
  "required":boolean;
  "delete":boolean;
  "value":string;

  constructor(){
    this.label = '';
    this.type = 'string';
    this.required = true;
    this.delete = false;
    this.value = '';
  }
}
