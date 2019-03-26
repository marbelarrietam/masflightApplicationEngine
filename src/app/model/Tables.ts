import {Columns} from './Columns';

export class Tables {
  "name":string;
  "columns" : Array<Columns>;
  "alias":string;
  "type": string;

  constructor(){
    this.name = '';
    this.columns = new Array();
    this.alias = '';
    this.type = '';
  }
}
