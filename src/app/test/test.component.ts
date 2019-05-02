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
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(public globals: Globals,
    private service: ApplicationService,
    public dialog: MatDialog, ) { }

  ngOnInit() {
    this.ws = this.globals.currentWebService;
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
    if(this.ws.method=="POST"){
      this.service.testWebService(this,this.ws.name,this.argumentsJson, this.handlerSucces, this.handlerError);
    }
    if(this.ws.method=="GET"){
      this.service.testWebServicesGet(this,this.ws.name,this.argumentsJson, this.handlerSucces, this.handlerError);
    }
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
  }

  handlerSucces(_this, data){
    console.log("data");
    console.log(data);
    if(data.Response.records){
    if(data.Response.records.length>0){
    _this.cleanVariables();
    _this.columnsHead = Object.keys(data.Response.records[0]);
    console.log(_this.columnsHead);
    _this.displayedColumns = _this.columnsHead;
    for (let i =0; i < _this.columnsHead.length; i++){
      let col = _this.columnsHead[i];
      let aux = { columnName: col, columnLabel: col};
      _this.columns.push(aux);
    }

      _this.ws.url=_this.ws.url+_this.urlArguments;

    _this.data = data;

    console.log(_this.data)
    _this.dataSource = new MatTableDataSource(data.Response.records);
    _this.globals.isLoading = false;
  }
  else {
    _this.globals.isLoading = false;
    _this.errors.push("No data found");
}
    }
 else {
  _this.globals.isLoading = false;
  _this.errors.push("No data found");
}
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
