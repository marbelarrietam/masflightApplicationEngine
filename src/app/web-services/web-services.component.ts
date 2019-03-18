import { Component, OnInit, ViewEncapsulation, Pipe, NgModule, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { QueryWS } from "../model/QueryWS";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Tables } from "../model/Tables";
import { Columns } from '../model/Columns';
import { ApplicationService } from '../services/application.service';
import { Globals } from '../globals/Globals';
import { Functions } from '../model/Functions';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';
import 'codemirror/mode/sql/sql';


@Component({
  selector: "app-web-services, FilterPipe",
  templateUrl: "./web-services.component.html",
  styleUrls: ["./web-services.component.css"],
  encapsulation: ViewEncapsulation.None
})


export class WebServicesComponent implements OnInit {
  @ViewChild('codeEditor') codeEditor: CodemirrorComponent;
  public searchText : string;
  public searchView : string;
  public searchColumn : string;
  public searchGroup : string;

  onChange(code) {
    console.log("new code", code);
}

  //@ViewChild('editor') editor;
  selectSentence : string;
  selectedColumns : string;
  fromSentence : string;
  whereSentence : string = "id=:id_airline and name=:name and group='a' order by name";
  groupBySentence : string;
  dataSourceForm = new FormGroup({
    tablesValidator:new FormControl("name", [Validators.required]),
  });

  columnsForm = new FormGroup({
    columnsValidator:new FormControl("name", [Validators.required]),
  });

  groupBySelected: Array<Columns> = new Array<Columns>();
  tableSelected: Tables = new Tables();
  selectTables: QueryWS = new QueryWS();
  selectViews: QueryWS = new QueryWS();
  selectconcat: QueryWS = new QueryWS();
  tables: any[] = [];

  views: any[] =[];

  constructor(private router: Router, public globals: Globals, private service: ApplicationService) { }

  ngOnInit() {
    this.getTables();
  }

  getTables(){

    this.service.getMetaDataTables(this, this.handlerSuccessTables, this.handlerError);
  }

  handlerSuccessTables(_this, data){
    for (let i = 0; i<data.length;i++){
      if (data[i].type == "table"){
        _this.tables.push(data[i]);
      }else if (data[i].type == "view"){
        _this.views.push(data[i]);
      }
    }
    _this.globals.isLoading = false;
  }

  handlerError(_this, result){
    console.log(result);
    _this.globals.isLoading = false;
  }
  goHome(){
    this.router.navigate(["/welcome"]);
  }

  addTable(table){
    if (table.selected){
      this.selectTables.tables.push(table)
      this.selectconcat.tables.push(table);
    }else {
      let index = this.selectTables.tables.findIndex(d => d === table);
      let indexConcat = this.selectconcat.tables.findIndex(d => d === table);
      if (index>=0 && indexConcat>=0){
        this.selectTables.tables.splice(index,1);
        this.selectconcat.tables.splice(indexConcat,1);
      }
    }
  }
  addGroupBy(table,column){
    let columnTable = table.alias + '.' + column.name;
    let columnAdd = column;
    columnAdd.name = columnTable;
    console.log(columnAdd)
    if(column.groupBy){
      this.groupBySelected.push(columnAdd);
    }else{
      let index = this.groupBySelected.findIndex(d => d === columnAdd);
      this.groupBySelected.splice(index,1);
    }
  }

  addFunction(event){
    console.log(this.tableSelected);
  }

  addColumn(column){
    if(column.selected){
    }
  }

  deleteFromSelectTable(table){
    let index = this.selectTables.tables.findIndex(d => d === table);
    let indexConcat = this.selectconcat.tables.findIndex(d => d === table);
    this.selectTables.tables.splice(index,1);
    this.selectconcat.tables.splice(indexConcat,1);
    table.selected = false;
  }

  getSelectedColumns(){
    let selected = [];
    let group = [];
    let selectedTables = [];
    for (let i = 0; i <this.selectconcat.tables.length; i++){
      let table = this.selectconcat.tables[i];
      if(table.alias){
      selectedTables.push(table.name+' '+table.alias);
      }else{selectedTables.push(table.name+' '+table.alias);}
      for(let j= 0; j<table.columns.length;j++){
        let column = table.columns[j];
        if(column.groupBy){
          group.push(column.name);
        }
        if(column.selected){
          let valueAux
          if(!column.groupBy){
            table.alias ? valueAux=table.alias+'.'+column.name : valueAux=column.name;
          }else{valueAux=column.name}
        if(column.type=='value'){
          let value = valueAux;
          selected.push(value);
        }else {
          if(column.type=='aggregate'){
            let value;
            if(column.functions.max){
              value = 'MAX('+valueAux+')';
              selected.push(value);
            }
            if(column.functions.min){
              value = 'MIN('+valueAux+')';
              selected.push(value);
            }
            if(column.functions.sum){
              value = 'SUM('+valueAux+')';
              selected.push(value);
            }
            if(column.functions.avg){
              value = 'AVG('+valueAux+')';
              selected.push(value);
            }
            if(column.functions.std){
              value = 'STDDEV('+valueAux+')';
              selected.push(value);
            }
            if(column.functions.count){
              value = 'COUNT('+valueAux+')';
              selected.push(value);
            }
          }
        }
      }
      }

    }
    let groupJoin = group.join(", ");
    let posTables = selectedTables.join(", ");
    let pos = selected.join(", ");
    this.groupBySentence = groupJoin;
    this.fromSentence = posTables;
    this.selectSentence = pos;

  }

  deleteFromSelectView(view){
    let index = this.selectViews.tables.findIndex(d => d === view);
    let indexConcat = this.selectconcat.tables.findIndex(d => d === view);
    this.selectViews.tables.splice(index,1);
    this.selectconcat.tables.splice(indexConcat,1);
    view.selected = false;
  }

  deleteArgument(arg){
    let index = this.selectconcat.arguments.findIndex(d => d === arg);
    this.selectconcat.arguments.splice(index,1);
  }

  addView(view){
    if(view.selected){
      this.selectViews.tables.push(view);
      this.selectconcat.tables.push(view);
    }else {
      let index = this.selectViews.tables.findIndex(d => d === view);
      let indexConcat = this.selectconcat.tables.findIndex(d => d === view);
      if (index>=0 && indexConcat>=0){
        this.selectViews.tables.splice(index,1);
        this.selectconcat.tables.splice(indexConcat,1);
      }
    }
  }

  concatChangeEvent(event) {
    this.tableSelected = event.value;
  }


  type(item){
    if(item.type=="aggregate"){
      item.functions = new Functions();
    }
  }

  options = {
    lineNumbers: true,
    theme: 'material',
    mode: { name: 'text/x-mariadb' },
    lineSeparator: 'string'
  };

  cursorPos: { line: number, ch: number } = { line: 0, ch: 0 };
  cursorMoved() {
    this.cursorPos = (this.codeEditor.codeMirror as any).getCursor();
  }

  addNewArgument(){
    this.selectconcat.arguments.push(
      {name:'',type:'',required:false}
    )
  }
}

