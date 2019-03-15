import {Columns} from './Columns';

export class Tables {
  "name":string;
  "columns" : Array<Columns>;
  "alias":string;

  constructor(){
    this.name = '';
    this.columns = new Array();
    this.alias = '';
  }
}
