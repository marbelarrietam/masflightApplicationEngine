import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { DataSource } from '@angular/cdk/collections';
import { QueryArgument } from '../model/QueryArgument';
import { QueryWS } from '../model/QueryWS';
import {MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  arguments: Array<QueryArgument> = new Array();
  ws: QueryWS = new QueryWS();
  argumentsJson = {};
  columnsHead: any[] = [];
  columns: any[] = [];
  dataSource;
  data;
  displayedColumns: string[] = [];
  urlArguments: string = '?';

  constructor(public globals: Globals,
    private service: ApplicationService,
    public dialog: MatDialog, ) { }

  ngOnInit() {
    this.ws = this.globals.currentWebService;
    this.arguments = this.ws.arguments;
  }

   escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

  getJsonRequest(){
    for (let i = 0; i < this.arguments.length; i++){
      this.argumentsJson[this.arguments[i].label] = encodeURIComponent(this.arguments[i].value);
      if(i==0){
      this.urlArguments+=`${this.arguments[i].label}=${this.arguments[i].value}`;
      }else{
        this.urlArguments+=`&${this.arguments[i].label}=${this.arguments[i].value}`;
      }
    }
    for(let key in this.argumentsJson){
    }
  }


  setDisplayedColumns(_this){

  }
  test(){
    this.getJsonRequest();
    if(this.ws.method=="POST"){
      this.service.testWebService(this,this.ws.name,this.argumentsJson, this.handlerSucces, this.handlerError);
    }
    if(this.ws.method=="GET"){
      this.service.testWebServicesGet(this,this.ws.name,this.argumentsJson, this.handlerSucces, this.handlerError);
    }
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
    _this.cleanVariables();
    _this.columnsHead = Object.keys(data[0]);
    _this.displayedColumns = _this.columnsHead;
    for (let i =0; i < _this.columnsHead.length; i++){
      let col = _this.columnsHead[i];
      let aux = { columnName: col, columnLabel: col};
      _this.columns.push(aux);
    }
    if(_this.ws.method=='GET'){
      _this.ws.url=_this.ws.url+_this.urlArguments;
    }
    _this.data = data;
    _this.dataSource = new MatTableDataSource(data);
  }

  handlerError(result){
    console.log(result);
  }

}
