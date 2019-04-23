export class QueryArgument {
  "label":string;
  "type":string;
  "required":string;
  "requiredBool":boolean;
  "delete":boolean;
  "value":string;

  constructor(){
    this.label = '';
    this.type = 'string';
    this.required = 'true';
    this.requiredBool = true;
    this.delete = false;
    this.value = '';
  }
}
