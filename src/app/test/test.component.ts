import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { DataSource } from '@angular/cdk/collections';
import { QueryArgument } from '../model/QueryArgument';
import { QueryWS } from '../model/QueryWS';
import {MatTableDataSource} from '@angular/material';
import {MatChipInputEvent} from '@angular/material';
import {COMMA, ENTER} from '@angular/cdk/keycodes';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  tab:number = 1;
  showUrl:boolean = false;
  showTable:boolean = false;
  arguments: Array<QueryArgument> = new Array();
  resultsOk: boolean = false;
  ws: QueryWS = new QueryWS();
  argumentsJson = {};
  argumentList: any[] = [];
  columnsHead: any[] = [];
  columns: any[] = [];
  errors:any[] = [];
  dataSource;
  data;
  displayedColumns: string[] = [];
  urlArguments: string = '?';
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  viewParameters = true;
  wrapped:string = "0";
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(public globals: Globals,
    private service: ApplicationService,
    public dialog: MatDialog, ) { }

  ngOnInit() {
    this.ws = this.globals.currentWebService;
    this.wrapped = this.ws.wrapped;
    this.arguments = this.ws.arguments;
    for (let i =0; i< this.arguments.length;i++){
      if(this.arguments[i].type=='list'){
        this.arguments[i].valueArray = [];
      }
    }
    console.log(this.arguments)
  }

   escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

 displayParameters(){
  if(this.viewParameters){
    this.viewParameters = false;
  }else{
    this.viewParameters = true;
  }
}

  getJsonRequest(){
    for (let i = 0; i < this.arguments.length; i++){
      if(this.arguments[i].type=='list'){
        console.log( this.arguments[i].valueArray)
        this.arguments[i].value = this.arguments[i].valueArray.join(",");
        console.log( this.arguments[i].value)
      }
      this.arguments[i].value = this.arguments[i].value ? this.arguments[i].value : null;
      this.argumentsJson[this.arguments[i].label] = encodeURIComponent(this.arguments[i].value);

      if(i==0){
      this.urlArguments+=`${this.arguments[i].label}=${this.arguments[i].value}`;
      }else{
        this.urlArguments+=`&${this.arguments[i].label}=${this.arguments[i].value}`;
      }
    }
  }


  setDisplayedColumns(_this){

  }
  test(){
    this.globals.isLoading = true;
    this.getJsonRequest();
    this.service.testWebServicesGet(this,this.ws.name,this.argumentsJson, this.handlerSucces, this.handlerError);
    }

  backToList() {
    this.globals.currentApplication = "list";
  }
  cleanVariables(){
    this.argumentsJson = {};
    this.columnsHead = [];
    this.columns = [];
    this.dataSource = [];
    this.data = [];
    this.displayedColumns = [];
    this.showTable = false;
    this.showUrl = false;
  }

  handlerSucces(_this, data){
    if(_this.wrapped=="1"){
    if(data.Response.records){
    if(data.Response.records.length>0){
    _this.cleanVariables();
    _this.data = data;
    _this.showUrl = true;
    _this.columnsHead = Object.keys(data.Response.records[0]);
    console.log(_this.columnsHead);
    _this.displayedColumns = _this.columnsHead;
    for (let i =0; i < _this.columnsHead.length; i++){
      let col = _this.columnsHead[i];
      let aux = { columnName: col, columnLabel: col};
      _this.columns.push(aux);
    }

      _this.ws.url=_this.ws.url+_this.urlArguments;
    console.log(_this.data)
    _this.dataSource = new MatTableDataSource(data.Response.records);
    _this.showTable = true;
    _this.tab=1;
  }
  else {
    if(_this.data.Response.errors){
      _this.cleanVariables();
      _this.data = data;
      _this.showUrl = true;
    for (let i=0;i<_this.data.Response.errors.length;i++){
    _this.errors.push(_this.data.Response.errors[i].error);
    _this.tab=2;
    }
  }
}
    }

 else {
  if(_this.data.Response.errors){
    _this.cleanVariables();
    _this.data = data;
    _this.showUrl = true;
for (let i=0;i<_this.data.Response.errors.length;i++){
    _this.errors.push(_this.data.Response.errors[i].error);
    _this.tab=2;
    }
  }
}
    }

else{
  if(data){
    if(data.length>0){
      _this.cleanVariables();
      _this.data = data;
      _this.showUrl = true;
    _this.displayedColumns = _this.columnsHead;
    if(_this.columnsHead[0] == 'error'){
      for(let i=0;i<data.length;i++){
      _this.errors.push(data[i].error);
      }
      _this.tab=2;

    }
    else{
      _this.cleanVariables();
      _this.data = data;
      _this.showUrl = true;
      _this.columnsHead = Object.keys(data[0]);
      _this.displayedColumns = _this.columnsHead;
    for (let i =0; i < _this.columnsHead.length; i++){
      let col = _this.columnsHead[i];
      let aux = { columnName: col, columnLabel: col};
      _this.columns.push(aux);
    }
      _this.ws.url=_this.ws.url+_this.urlArguments;
    _this.data = data;

    console.log(_this.data)
    _this.dataSource = new MatTableDataSource(data);
    _this.showTable = true;
    _this.tab=1;
    }
  }
  }
}
_this.globals.isLoading = false;

  }

  handlerError(_this, result){
    console.log(result);
    _this.globals.isLoading = false;
    _this.errors.push(result.message);
  }

  add(event: MatChipInputEvent, arrayArg: any[]): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      arrayArg.push(value.trim());
    }
    if (input) {
      input.value = '';
    }
    console.log(arrayArg)
  }

  remove(arg: any, arrayArg): void {
    const index = arrayArg.indexOf(arg);

    if (index >= 0) {
      arrayArg.splice(index, 1);
    }
  }

}
