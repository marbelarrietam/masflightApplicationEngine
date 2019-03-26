export class QueryArgument {
  "label":string;
  "type":string;
  "required":boolean;

  constructor(){
    this.label = '';
    this.type = 'string';
    this.required = true;
  }
}
