import {Columns} from './Columns';

export class Tables {
  "id":string;
  "name":string;
  "columns" : Array<Columns>;
  "alias":string;
  "type": string;
  "delete":boolean;

  constructor(){
    this.id = '';
    this.name = '';
    this.columns = new Array();
    this.alias = '';
    this.type = '';
    this.delete = false;
  }
}
