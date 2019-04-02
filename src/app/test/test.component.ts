import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { DataSource } from '@angular/cdk/collections';
import { QueryArgument } from '../model/QueryArgument';
import { QueryWS } from '../model/QueryWS';
import { RequestWS } from '../model/RequestWS';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

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

  constructor(public globals: Globals,
    private service: ApplicationService,
    public dialog: MatDialog, ) { }

  ngOnInit() {
    this.ws = this.globals.currentWebService;
    this.arguments = this.ws.arguments;
  }

  getJsonRequest(){
    var mapConcat = '{"arguments" :{';
    for (let i = 0; i < this.arguments.length; i++){
      if (i==0){
      var aux = `"${this.arguments[i].label}" : "${this.arguments[i].value}"`;
      }else{
        var aux = `, "${this.arguments[i].label}" : "${this.arguments[i].value}"`;
      }
      mapConcat+= aux;
    }
    mapConcat+='}}';
    console.log(mapConcat);
    this.argumentsJson = JSON.parse(mapConcat);
    console.log(this.argumentsJson);
  }


  setDisplayedColumns(_this){

  }
  test(){
    this.getJsonRequest();
    this.service.testWebService(this,this.ws.name,this.argumentsJson, this.handlerSucces, this.handlerError);
  }

  handlerSucces(_this, data){
    _this.columnsHead = Object.keys(data[0]);
    _this.displayedColumns = _this.columnsHead;
    console.log(_this.displayedColumns);
    for (let i =0; i < _this.columnsHead.length; i++){
      let col = _this.columnsHead[i];
      let aux = { columnName: col, columnLabel: col};
      _this.columns.push(aux);

    }
    _this.data = data;
    console.log(data);
    _this.dataSource = new MatTableDataSource(data);
  }

  handlerError(result){
    console.log(result);
  }

}
