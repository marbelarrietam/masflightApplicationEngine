import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { QueryWS } from "../model/QueryWS";
import {
  FormControl,
  FormGroup,
  Validators,
  FormBuilder,
  FormArray
} from "@angular/forms";
import { Tables } from "../model/Tables";
import { Columns } from "../model/Columns";
import { ApplicationService } from "../services/application.service";
import { Globals } from "../globals/Globals";
import { MatDialog, MatTableDataSource } from "@angular/material";
import { Functions } from "../model/Functions";
import { CodemirrorComponent } from "@ctrl/ngx-codemirror";
import "codemirror/mode/sql/sql";
import { MessageComponent } from "../message/message.component";
import { QueryArgument } from "../model/QueryArgument";
import { AggregateFucntions } from "../model/AggregateFunctions";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { CustomFunctions } from '../model/CustomFunctions';
import { DialogErrorLogComponent } from '../dialog-error-log/dialog-error-log.component';

@Component({
  selector: "app-web-services-copy, FilterPipe",
  templateUrl: "./web-services-copy.component.html",
  styleUrls: ["./web-services-copy.component.css"]
})
export class WebServicesCopyComponent implements OnInit {
  @ViewChild("codeEditor") codeEditor: CodemirrorComponent;
  dataError: any;
  dataErrorStep: any
  queryEdit:boolean = true;
  queryText:string;
  searchText: string;
  searchView: string;
  searchColumn: string;
  searchGroup: string;
  searchOrder: string;
  checkColumn = '0';
  checkBool: boolean;
  deletedTables: Array<Tables> = new Array();
  deletedColumns: Array<Columns> = new Array();
  deletedArguments: Array<QueryArgument> = new Array();
  deletedAggregates: Array<AggregateFucntions> = new Array();
  deletedCustomFunctions: Array<CustomFunctions>  = new Array();
  selectSentence: string;
  selectedColumns: string;
  fromSentence: string;
  whereSentence: string;
  havingSentence: string;
  groupBySentence: string;
  orderBySentence: string;
  auxCustomFunction: string;
  groupinglist: string = '0';
  argumentGrouping: string;
  sortingList: string= '0';
  dataSourceForm = new FormGroup({
    tablesValidator: new FormControl("nameTable", [Validators.required])
  });

  columnsForm = new FormGroup({
    columnsValidator: new FormControl("nameColumn", [Validators.required])
  });

  groupBySelected: Array<Columns> = new Array<Columns>();
  orderBySelected: Array<Columns> = new Array<Columns>();

  tableSelected: Tables = new Tables();
  selectEdit: QueryWS = new QueryWS();
  selectTables: QueryWS = new QueryWS();
  selectViews: QueryWS = new QueryWS();
  selectconcat: QueryWS = new QueryWS();
  tables: any[] = [];
  tablesInicial: any[] = [];
  views: any[] = [];
  viewsInicial: any[] = [];
  argumentSelected: any;
  argForms: FormGroup;
  items: FormArray;
  configurationForm = new FormGroup({
    nameValidator: new FormControl("name", [Validators.required])
  });



  argumentsForm = new FormGroup({
    argumentRequired: new FormControl(),
    argumentName: new FormControl("argumentName", [Validators.required]),
    argumentType: new FormControl("argumentType", [Validators.required])
  });

  showError: boolean;
  dialogRef : any;

  constructor(
    private router: Router,
    public globals: Globals,
    private service: ApplicationService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog
  ) {}

  displayedColumns = ['label','type', 'required'];
  dataSource;

  ngOnInit() {
    this.showError=false;
    if(!this.globals.currentWebService){
      this.queryEdit = true;
    }else{
      this.queryEdit = false;
    }
    this.dataError = {errors:[]};
    this.dataErrorStep = {errors:[]};
    this.globals.DialogClose = true;
    this.getTables();
    this.argForms = this.formBuilder.group({
      items: this.formBuilder.array([])
    });
  }



  clear(){
    // var aux = this.tablesInicial.slice(0);
    // this.tables = [];
    // this.tables = aux;
    this.showError=false;
    this.dataError = {errors:[]};
    this.dataErrorStep = {errors:[]};
    this.tableSelected =  new Tables();
    this.selectEdit = new QueryWS();
    this.selectTables = new QueryWS();
    this.selectViews = new QueryWS();
    this.selectconcat = new QueryWS();
    for (let i = 0; i < this.tables.length; i++) {
      if(this.tables[i].selected===true){
        this.tables[i].id = null;
        this.tables[i].selected = false;
        this.tables[i].alias = null;
      }
    }
  }

  validate(){
    this.clear()
    this.service.getsetSteps(this,encodeURIComponent(this.queryText),this.checkColumn,"1",this.handlerSuccessText, this.handlerError)
  }

  handlerSuccessText(_this,data){
    if(data.errors==null){
      _this.selectEdit = data;
      _this.getDataQueryInit();
      _this.queryEdit=false;
      _this.getSelectedColumns();
      _this.globals.isLoading = false;
    }else{
      _this.globals.isLoading = false;
      _this.dataError=data;
      const dialogRef = _this.dialog.open(MessageComponent, {
        data: {
          title: "Error",
          message: "It was a problem whith your syntax, check and try again"
        }
      });
      console.log(data.errors);
    }
  }


  addCustomFunction(){
    let custom = new CustomFunctions();
    custom.customText = this.auxCustomFunction;
    this.selectconcat.customFunctions.push(custom);
    console.log(this.selectconcat.customFunctions);
    this.auxCustomFunction = '';
  }

  getCustomFunctions(){
    let customArray = new Array<CustomFunctions>();
    for (let i = 0; i < this.selectconcat.customFunctions.length; i++){
      let row = this.selectconcat.customFunctions[i];
      if (row.groupByBool) {
        row.groupBy = "1";
      } else {
        row.groupBy = "0";
      }
      if (row.orderByBool) {
        row.orderBy = "1";
      } else {
        row.orderBy = "0";
      }
    }
    customArray = this.selectconcat.customFunctions.concat(this.deletedCustomFunctions);
    return customArray;
  }

  //modificado kp20190508
  deleteCustomFunction(c){
    let index = this.selectconcat.customFunctions.findIndex(d => d === c);
    if (index!=-1){
    if(c.id!=null){
      this.deletedCustomFunctions.push(this.selectconcat.customFunctions[index]);
    }
    this.selectconcat.customFunctions.splice(index, 1);
  }
  }

  getTables() {
    this.service.getMetaDataTables(
      this,"conn",
      this.handlerSuccessTables,
      this.handlerError
    );
  }

  backToList() {
    this.globals.currentApplication = "list";
  }

  verifyArguments() {
    let value = "";
    if (this.selectconcat.arguments!=null){
    for (let i = 0; i < this.selectconcat.arguments.length; i++) {
      if (
        this.selectconcat.arguments[i]["label"] == null ||
        this.selectconcat.arguments[i]["label"] == ""
      ) {
        value = "label";
      }
      if (
        this.selectconcat.arguments[i]["type"] == null ||
        this.selectconcat.arguments[i]["type"] == ""
      ) {
        value = "type";
      }
    }
  }
    if (value==="") {
      return "ok";
    } else {
      return value;
    }
  }

  saveWebService() {
    var merr="";
    this.getSelectedColumns();
    let argumentsVerification = this.verifyArguments();
    if (this.configurationForm.valid) {
      if (argumentsVerification==="ok") {
        this.service.saveWebServices(
          this,
          this.createQueryJson(),
          this.handlerSuccessWS,
          this.handlerErrorSave
        );
      } else {
        if (argumentsVerification==="label"){
          merr = "You have missing some arguments names, please check"
        }else if (argumentsVerification==="type"){
          merr = "You have missing some arguments types, please check"
        }
        const dialogRef = this.dialog.open(MessageComponent, {
          data: {
            title: "Error",
            message: merr
          }
        });
      }
    } else {
      const dialogRef = this.dialog.open(MessageComponent, {
        data: {
          title: "Error",
          message: "You have missing some configurations, please check"
        }
      });
    }
  }

  DisplayEditQuery(){
    if(this.queryEdit){
      this.queryEdit = false;
    }else{
      this.queryEdit = true;
    }
  }

    //kp20190510 actualizado
  // handlerSuccessWS(_this,data) {
  //   _this.showError=false;
  //   _this.globals.isLoading = false;
  //   if(data.errors==null){
  //   _this.globals.currentApplication = "list";
  //   }else{
  //     const dialogRef = _this.dialog.open(MessageComponent, {
  //       data: {
  //         title: "Error",
  //         message: "It was a problem whith your syntax, check and try again"
  //       }
  //     });
  //     console.log(data.errors);
  //   }
  // }

  handlerSuccessWS(_this,data) {


    if (!_this.globals.DialogClose){
      _this.dialogRef.close();
      _this.globals.DialogClose = true;
    }
    _this.showError=false;
    _this.globals.isLoading = false;
    _this.dataErrorStep=data;
    if(data.errors==null){
    _this.globals.currentApplication = "list";
    }else{
      _this.showError=true;
      _this.openDialog(_this.dataErrorStep);
    }
  }

  //kp20190510 actualizado
  // handlerErrorSave(_this, result) {
  //   const dialogRef = _this.dialog.open(MessageComponent, {
  //     data: { title: "Error", message: "It was a problem, try again" }
  //   });
  //   _this.globals.isLoading = false;
  // }

  handlerErrorSave(_this, result) {
    _this.showError=true;
    //hacer For ?
    const dialogRef = _this.dialog.open(DialogErrorLogComponent, result);
    _this.globals.isLoading = false;
  }

  getQueryString() {
    let queryString =
      "SELECT " + this.selectSentence + " FROM " + this.fromSentence;
    if (this.whereSentence) {
      queryString += " WHERE " + this.whereSentence;
    }
    if (this.groupBySentence && this.selectconcat.groupingList=='0') {
      queryString += " GROUP BY " + this.groupBySentence;
    }
    if (this.havingSentence  && this.selectconcat.groupingList=='0') {
      queryString += " HAVING " + this.havingSentence;
    }
    if (this.orderBySentence && this.selectconcat.sortingList=='0') {
      queryString += " ORDER BY " + this.orderBySentence;
    }



    return queryString;
  }

  createQueryJson() {
    let queryJson = new QueryWS();
    if (this.selectconcat.id) {
      queryJson.id = this.selectconcat.id;
    } else {
      queryJson.id = null;
    }
    queryJson.name = this.selectconcat.name;
    queryJson.customFunctions = this.getCustomFunctions();
    queryJson.tables = this.getTablesColumn();
    queryJson.tables = queryJson.tables.concat(this.deletedTables);
    queryJson.arguments = this.selectconcat.arguments;
    if(this.selectconcat.arguments!=null){
    queryJson.arguments = queryJson.arguments.concat(this.deletedArguments);
    }
    queryJson.whereclause = this.whereSentence;
    queryJson.havingclause = this.havingSentence;
    queryJson.query = this.getQueryString();
    queryJson.sortingSentence = this.selectconcat.sortingList != '1' ? this.orderBySentence : null;
    queryJson.groupBySentence = this.selectconcat.groupingList != '1' ? this.groupBySentence : null;
    queryJson.method = this.selectconcat.method;
    queryJson.description = this.selectconcat.description;
    queryJson.pageSize = this.selectconcat.pageSize;
    queryJson.wrapped = this.selectconcat.wrapped; //kp20190507
    queryJson.groupingList = this.selectconcat.groupingList;
    queryJson.sortingList = this.selectconcat.sortingList;
    queryJson.checkColumn = this.checkColumn;
    return queryJson;
  }

  getTablesColumn() {
    let tables = new Array<Tables>();
    for (let i = 0; i < this.selectconcat.tables.length; i++) {
      let table = new Tables();
      if (this.selectconcat.tables[i].id) {
        table.id = this.selectconcat.tables[i].id;
      }
      table.name = this.selectconcat.tables[i].name;
      this.selectconcat.tables[i].alias
        ? (table.alias = this.selectconcat.tables[i].alias)
        : null;
      table.type = this.selectconcat.tables[i].type;

      for (let j = 0; j < this.selectconcat.tables[i].columns.length; j++) {
        let columnsItem = this.selectconcat.tables[i].columns[j];
        if (columnsItem.selected || columnsItem.groupByBool || columnsItem.orderByBool) {
          let columnToAdd = new Columns();
          if (columnsItem.id) {
            columnToAdd.id = columnsItem.id;
          } else {
            columnToAdd.id = null;
          }
          columnToAdd.name = columnsItem.name;
          columnToAdd.typePresentation = columnsItem.typePresentation;
          columnToAdd.selectedResult = columnsItem.selectedResult;
          if (columnsItem.groupByBool) {
            columnToAdd.groupBy = "1";
          } else {
            columnToAdd.groupBy = "0";
          }
          if (columnsItem.orderByBool) {
            columnToAdd.orderBy = "1";
          } else {
            columnToAdd.orderBy = "0";
          }
          if (columnsItem.selectedResult == "1") {
            columnToAdd.order = j;
          }
          if (columnsItem.typePresentation == "value") {
            columnToAdd.alias = columnsItem.alias;
            columnToAdd.orderDirection = columnsItem.orderDirection;
            columnToAdd.typePresentation = columnsItem.typePresentation;
            table.columns.push(columnToAdd);
          } else if (columnsItem.typePresentation == "aggregate") {
            columnToAdd.typePresentation = columnsItem.typePresentation;
            columnToAdd.functions = [];
            if (columnsItem.functionsAux.sum == true) {
              let agr = new AggregateFucntions();
              agr.alias = columnsItem.functionsAux.aliasSum;
              agr.function = "SUM";
              agr.selected = true;
              agr.label = "Sum";
              agr.id = columnsItem.functionsAux.idSum;
              agr.orderDirection = columnsItem.functionsAux.orderDirectionSum;
              if(columnsItem.functionsAux.orderSum){
                agr.orderBy = "1";
              }else{agr.orderBy = "0";}
              columnToAdd.functions.push(agr);
            }
            if (columnsItem.functionsAux.std == true) {
              let agr = new AggregateFucntions();
              agr.alias = columnsItem.functionsAux.aliasStd;
              agr.function = "STD";
              agr.selected = true;
              agr.label = "Std";
              agr.id = columnsItem.functionsAux.idStd;
              agr.orderDirection = columnsItem.functionsAux.orderDirectionStd;
              if(columnsItem.functionsAux.orderStd){
                agr.orderBy = "1";
              }else{agr.orderBy = "0";}
              columnToAdd.functions.push(agr);
            }
            if (columnsItem.functionsAux.min == true) {
              let agr = new AggregateFucntions();
              agr.alias = columnsItem.functionsAux.aliasMin;
              agr.function = "MIN";
              agr.selected = true;
              agr.label = "Min";
              agr.id = columnsItem.functionsAux.idMin;
              agr.orderDirection = columnsItem.functionsAux.orderDirectionMin;
              if(columnsItem.functionsAux.orderMin){
                agr.orderBy = "1";
              }else{agr.orderBy = "0";}
              columnToAdd.functions.push(agr);
            }
            if (columnsItem.functionsAux.max == true) {
              let agr = new AggregateFucntions();
              agr.alias = columnsItem.functionsAux.aliasMax;
              agr.function = "MAX";
              agr.selected = true;
              agr.label = "Max";
              agr.id = columnsItem.functionsAux.idMax;
              agr.orderDirection = columnsItem.functionsAux.orderDirectionMax;
              if(columnsItem.functionsAux.orderMax){
                agr.orderBy = "1";
              }else{agr.orderBy = "0";}
              columnToAdd.functions.push(agr);
            }
            if (columnsItem.functionsAux.avg == true) {
              let agr = new AggregateFucntions();
              agr.alias = columnsItem.functionsAux.aliasAvg;
              agr.function = "AVG";
              agr.selected = true;
              agr.label = "Avg";
              agr.id = columnsItem.functionsAux.idAvg;
              agr.orderDirection = columnsItem.functionsAux.orderDirectionAvg;
              if(columnsItem.functionsAux.orderAvg){
                agr.orderBy = "1";
              }else{agr.orderBy = "0";}
              columnToAdd.functions.push(agr);
            }
            if (columnsItem.functionsAux.count == true) {
              let agr = new AggregateFucntions();
              agr.alias = columnsItem.functionsAux.aliasCount;
              agr.function = "COUNT";
              agr.selected = true;
              agr.label = "Count";
              agr.id = columnsItem.functionsAux.idCount;
              agr.orderDirection = columnsItem.functionsAux.orderDirectionCount;
              if(columnsItem.functionsAux.orderCount){
                agr.orderBy = "1";
              }else{agr.orderBy = "0";}
              columnToAdd.functions.push(agr);
            }
            table.columns.push(columnToAdd);
          }
        }
        if (
          !columnsItem.selected &&
          !columnsItem.groupByBool &&
          !columnsItem.orderByBool &&
          columnsItem.id
        ) {
          columnsItem.delete = true;
          table.columns.push(columnsItem);
        }
      }
      tables.push(table);
    }
    return tables;
  }

  handlerSuccessTables(_this, data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].type == "table") {
        _this.tables.push(data[i]);
      } else if (data[i].type == "view") {
        _this.views.push(data[i]);
      }
    }
    if (_this.globals.currentWebService) {
      _this.loadWebService();
    }
    _this.globals.isLoading = false;
  }

  handlerError(_this, result) {
    console.log(result);
    _this.globals.isLoading = false;
  }


  loadWebService() {
    this.selectEdit = this.globals.currentWebService;
    this.getDataQueryInit();
  }
  getDataQueryInit() {
    this.selectconcat.arguments = this.selectEdit.arguments;
    if(this.selectconcat.arguments!=null){
    for (let i=0;i<this.selectconcat.arguments.length;i++){
      if(this.selectconcat.arguments[i].required=="true"){
        this.selectconcat.arguments[i].requiredBool=true;

      }else{
        this.selectconcat.arguments[i].requiredBool=false;
      }
      if(this.selectconcat.arguments[i].grouping=="1"){
        this.selectconcat.arguments[i].groupingBool = true;
        this.argumentGrouping = this.selectconcat.arguments[i].label;
      }else{
        this.selectconcat.arguments[i].groupingBool=false;
      }
    }
  }
    this.selectconcat.name = this.selectEdit.name;
    this.selectconcat.groupingList = this.selectEdit.groupingList;
    this.selectconcat.sortingList = this.selectEdit.sortingList;
    this.selectconcat.id = this.selectEdit.id;
    this.selectconcat.pageSize = this.selectEdit.pageSize;
    this.selectconcat.method = this.selectEdit.method;
    this.selectconcat.description = this.selectEdit.description;
    this.selectconcat.customFunctions = this.selectEdit.customFunctions;
    this.selectconcat.wrapped = this.selectEdit.wrapped; //kp20190508
    if(this.selectconcat.customFunctions!=null){
    for (let a = 0; a < this.selectconcat.customFunctions.length;a++){
      if (this.selectconcat.customFunctions[a].orderBy == "1") {
        this.selectconcat.customFunctions[a].orderByBool = true;
      } else {
        this.selectconcat.customFunctions[a].orderByBool = false;
      }
    }
  }
    this.whereSentence = this.selectEdit.whereclause;
    this.havingSentence = this.selectEdit.havingclause;
    //kp20190508 change order of for to decrease time of search
    for (let j = 0; j < this.selectEdit.tables.length; j++) {
      for (let i = 0; i < this.tables.length; i++) {
        if (this.tables[i].name.toLowerCase() == this.selectEdit.tables[j].name.toLowerCase()) {
          this.tables[i].id = this.selectEdit.tables[j].id;
          this.tables[i].selected = true;
          this.tables[i].alias = this.selectEdit.tables[j].alias;
          this.selectTables.tables.push(this.tables[i]);
          this.selectconcat.tables.push(this.tables[i]);
          for (let k = 0; k < this.tables[i].columns.length; k++) {
            this.tables[i].columns[k].order = 0;
            for (let m = 0; m < this.selectEdit.tables[j].columns.length; m++) {
              let columnsOrigin = this.selectEdit.tables[j].columns[m];
              columnsOrigin.order = columnsOrigin.order
                ? columnsOrigin.order
                : 0;
              if (
                this.tables[i].columns[k].name.toLowerCase() ==
                this.selectEdit.tables[j].columns[m].name.toLowerCase()
              ) {
                let columnsToAdd = this.tables[i].columns[k];

                columnsToAdd.id = columnsOrigin.id;
                columnsToAdd.selectedResult = columnsOrigin.selectedResult;
                columnsToAdd.functionsAux = new Functions();
                columnsToAdd.functions = columnsOrigin.functions;
                columnsToAdd.groupBy = columnsOrigin.groupBy;
                columnsToAdd.orderBy = columnsOrigin.orderBy;
                if (columnsToAdd.groupBy == "1" && this.groupinglist=='0') {
                  columnsToAdd.groupByBool = true;
                  this.groupBySelected.push(columnsToAdd);
                } else {
                  columnsToAdd.groupByBool = false;
                }
                if (columnsToAdd.orderBy == "1") {
                  columnsToAdd.orderByBool = true;
                  this.orderBySelected.push(columnsToAdd);
                } else {
                  columnsToAdd.orderBool = false;
                }
                columnsToAdd.selected = true;
                columnsToAdd.typePresentation = columnsOrigin.typePresentation;
                columnsToAdd.selectedResult = columnsOrigin.selectedResult;
                columnsToAdd.order = columnsOrigin.order;
                if (columnsToAdd.typePresentation == "aggregate") {
                  for (let n = 0; n < columnsToAdd.functions.length; n++) {
                    console.log(columnsToAdd.functions[n]);

                    switch(columnsToAdd.functions[n].function) {
                      case "SUM":{
                        columnsToAdd.functionsAux.sum = true;
                        columnsToAdd.functionsAux.aliasSum = columnsToAdd.functions[n].alias;
                        columnsToAdd.functionsAux.idSum = columnsToAdd.functions[n].id;
                        columnsToAdd.functionsAux.orderDirectionSum = columnsToAdd.functions[n].orderDirection;
                        if(columnsToAdd.functions[n].orderBy=="1"){
                        columnsToAdd.functionsAux.orderSum = true;
                        }else{ columnsToAdd.functionsAux.orderSum = false;}
                        break;
                      }
                      case "MAX":{
                        columnsToAdd.functionsAux.max = true;
                        columnsToAdd.functionsAux.aliasMax = columnsToAdd.functions[n].alias;
                        columnsToAdd.functionsAux.idMax = columnsToAdd.functions[n].id;
                        columnsToAdd.functionsAux.orderDirectionMax = columnsToAdd.functions[n].orderDirection;
                        if(columnsToAdd.functions[n].orderBy=="1"){
                          columnsToAdd.functionsAux.orderMax = true;
                          }else{ columnsToAdd.functionsAux.orderMax= false;}
                        break;
                      }
                      case "MIN": {
                        columnsToAdd.functionsAux.min = true;
                        columnsToAdd.functionsAux.aliasMin = columnsToAdd.functions[n].alias;
                        columnsToAdd.functionsAux.idMin = columnsToAdd.functions[n].id;
                        columnsToAdd.functionsAux.orderDirectionMin = columnsToAdd.functions[n].orderDirection;
                        if(columnsToAdd.functions[n].orderBy=="1"){
                          columnsToAdd.functionsAux.orderMin = true;
                          }else{ columnsToAdd.functionsAux.orderMin = false;}
                        break;
                      }
                      case "AVG": {
                        columnsToAdd.functionsAux.avg = true;
                        columnsToAdd.functionsAux.aliasAvg = columnsToAdd.functions[n].alias;
                        columnsToAdd.functionsAux.idAvg = columnsToAdd.functions[n].id;
                        columnsToAdd.functionsAux.orderDirectionAvg = columnsToAdd.functions[n].orderDirection;
                        if(columnsToAdd.functions[n].orderBy=="1"){
                          columnsToAdd.functionsAux.orderAvg = true;
                          }else{ columnsToAdd.functionsAux.orderAvg = false;}
                        break;
                      }
                      case "COUNT": {
                        columnsToAdd.functionsAux.count = true;
                        columnsToAdd.functionsAux.aliasCount = columnsToAdd.functions[n].alias;
                        columnsToAdd.functionsAux.idCount = columnsToAdd.functions[n].id;
                        columnsToAdd.functionsAux.orderDirectionCount = columnsToAdd.functions[n].orderDirection;
                        if(columnsToAdd.functions[n].orderBy=="1"){
                          columnsToAdd.functionsAux.orderCount = true;
                          }else{ columnsToAdd.functionsAux.orderCount = false;}
                        break;
                      }
                      case  "STD":{
                        columnsToAdd.functionsAux.std = true;
                        columnsToAdd.functionsAux.aliasStd = columnsToAdd.functions[n].alias;
                        columnsToAdd.functionsAux.idStd = columnsToAdd.functions[n].id;
                        columnsToAdd.functionsAux.orderDirectionStd = columnsToAdd.functions[n].orderDirection;
                        if(columnsToAdd.functions[n].orderBy=="1"){
                          columnsToAdd.functionsAux.orderStd = true;
                          }else{ columnsToAdd.functionsAux.orderStd= false;}
                        break;
                      }
                    }
                    }
                } else {
                  columnsToAdd.alias = columnsOrigin.alias;
                  columnsToAdd.orderDirection = columnsOrigin.orderDirection;
                }
              }
            }
          }
          this.tables[i].columns.sort(function(a, b) {
            if (a.order > b.order) {
              return 1;
            } else if (a.order < b.order) {
              return -1;
            }
            return 0;
          });
        }
      }
    }
    this.tableSelected = this.selectconcat.tables[0];
    console.log(this.selectconcat.tables);
  }

  addTable(table) {
    if (table.selected) {
      this.selectTables.tables.push(table);
      this.selectconcat.tables.push(table);
    } else {
      let index = this.selectTables.tables.findIndex(d => d === table);
      let indexConcat = this.selectconcat.tables.findIndex(d => d === table);
      if (index >= 0 && indexConcat >= 0) {
        table.delete = true;
        this.deletedTables.push(table);
        this.selectTables.tables.splice(index, 1);
        this.selectconcat.tables.splice(indexConcat, 1);
      }
    }
    this.tableSelected = this.selectconcat.tables[0];
  }

  setGroupingState(i){
    for(let arg of this.selectconcat.arguments){
      arg.groupingBool = false;
      arg.grouping = '0';
    }
    this.selectconcat.arguments[i].groupingBool = true;
    this.selectconcat.arguments[i].grouping = '1';
    this.argumentGrouping = this.selectconcat.arguments[i].label;

  }



  addGroupBy(table, column) {
    let columnAdd = column;
    if (column.groupByBool) {
      column.groupBy = "1";
      this.groupBySelected.push(columnAdd);
    } else {
      let index = this.groupBySelected.findIndex(d => d === columnAdd);
      columnAdd.delete = true;
      this.deletedColumns.push(columnAdd);
      this.groupBySelected.splice(index, 1);
      column.groupBy = "0";
    }
  }

  addFunction(item, ag) {}

  addOrderBy(table, column) {
    let columnAdd = column;
    if (column.orderByBool) {
      column.orderBy = "1";
      column.orderDirection = "DESC"
      this.orderBySelected.push(columnAdd);
    } else {
      let index = this.orderBySelected.findIndex(d => d === columnAdd);
      columnAdd.delete = true;
      this.deletedColumns.push(columnAdd);
      this.orderBySelected.splice(index, 1);
      column.orderBy = "0";
      column.orderDirection = null;
    }
  }

  addOrderByCF(cf) {
    if (cf.orderByBool) {
      cf.orderBy = "1";
      cf.orderDirection = "DESC"
    } else {
      cf.orderBy = "0";
      cf.orderDirection = null;
    }
  }


  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.tableSelected.columns,
      event.previousIndex,
      event.currentIndex
    );
  }


  addColumn(column) {
    if (column.selected) {
      column.selectedResult = "1";
    } else {
      column.selectedResult = "0";
        //kp20190506 add
      if (!column.orderBool && !column.groupByBool){
        column.delete = true;
      }

    }
  }

  deleteFromSelectTable(table) {
    let index = this.selectTables.tables.findIndex(d => d === table);
    let indexConcat = this.selectconcat.tables.findIndex(d => d === table);
    table.delete = true;
    this.deletedColumns.push(table);
    this.selectTables.tables.splice(index, 1);
    this.selectconcat.tables.splice(indexConcat, 1);
    table.selected = false;
  }

  getSelectedColumns() {
    let selected = [];
    let group = [];
    let orderb = [];
    let selectedTables = [];
    for (let i = 0; i < this.selectconcat.tables.length; i++) {
      let table = this.selectconcat.tables[i];
      if (table.alias) {
        selectedTables.push(table.name + " " + table.alias);
      } else {
        selectedTables.push(table.name);
      }
      for (let j = 0; j < table.columns.length; j++) {
        let column = table.columns[j];
        if (column.groupBy == "1") {
          let valueAux;
          let val;
          table.alias
            ? (valueAux = table.alias + "." + column.name)
            : (valueAux = column.name);
            if(column.alias){
              val = column.alias;
            }else{val = valueAux}
          group.push(val);
        }
        if (column.orderBy == "1") {
          let valueAux;
          table.alias
            ? (valueAux = table.alias + "." + column.name)
            : (valueAux = column.name);

        }
        if(column.orderByBool && column.typePresentation=='value'){
          if(column.alias){
            orderb.push(column.alias + ' '+column.orderDirection);
          }else{
          orderb.push(column.name + ' '+column.orderDirection);
          }
        }
        if (column.selected) {
          let valueAux;
          let col = column.name;
          /* if(column.name.toLowerCase() == "date"){
            col = "DATE_FORMAT(STR_TO_DATE(" + column.name+", '%m/%d/%y'),'%Y/%m')"
          }else{col = column.name} */
          table.alias
            ? (valueAux =
                table.alias +
                "." +
                col +
                (column.alias ? " " + column.alias : ""))
            : (valueAux =
              col + (column.alias ? " " + column.alias : ""));

          if (column.typePresentation == "value") {
            let value = valueAux;
            value = value.toLowerCase();
            selected.push(value);

          } else {
            if (column.typePresentation == "aggregate") {
              let value;
              if (column.functionsAux.max) {
                value = "MAX(" + valueAux + ") " + column.functionsAux.aliasMax;
                selected.push(value);
                if(column.functionsAux.orderMax){
                  let aggrName;
                  if(column.functionsAux.aliasMax){
                    aggrName = column.functionsAux.aliasMax;
                  }else{
                    aggrName = "MAX(" + valueAux + ")";
                  }
                orderb.push(aggrName + ' '+column.functionsAux.orderDirectionMax);
                }
              }
              if (column.functionsAux.min) {
                value = "MIN(" + valueAux + ") " + column.functionsAux.aliasMin;
                selected.push(value);
                if(column.functionsAux.orderMin){
                  let aggrName;
                  if(column.functionsAux.aliasMin){
                    aggrName = column.functionsAux.aliasMin;
                  }else{
                    aggrName = "MIN(" + valueAux + ")";
                  }
                orderb.push(aggrName + ' '+column.functionsAux.orderDirectionMin);
                }
              }
              if (column.functionsAux.sum) {
                value = "SUM(" + valueAux + ") " + column.functionsAux.aliasSum;
                selected.push(value);
                if(column.functionsAux.orderSum){
                  let aggrName;
                  if(column.functionsAux.aliasSum){
                    aggrName = column.functionsAux.aliasSum;
                  }else{
                    aggrName = "SUM(" + valueAux + ")";
                  }
                orderb.push(aggrName + ' '+column.functionsAux.orderDirectionSum);
                }
              }
              if (column.functionsAux.avg) {
                value = "AVG(" + valueAux + ") " + column.functionsAux.aliasAvg;
                selected.push(value);
                if(column.functionsAux.orderAvg){
                  let aggrName;
                  if(column.functionsAux.aliasAvg){
                    aggrName = column.functionsAux.aliasAvg;
                  }else{
                    aggrName = "AVG(" + valueAux + ")";
                  }
                orderb.push(aggrName + ' '+column.functionsAux.orderDirectionAvg);
                }
              }
              if (column.functionsAux.std) {
                value =
                  "STDDEV(" + valueAux + ") " + column.functionsAux.aliasStd;
                selected.push(value);
                if(column.functionsAux.orderStd){
                  let aggrName;
                  if(column.functionsAux.aliasStd){
                    aggrName = column.functionsAux.aliasStd;
                  }else{
                    aggrName = "STDDEV(" + valueAux + ")";
                  }
                orderb.push(aggrName + ' '+column.functionsAux.orderDirectionStd);
                }
              }
              if (column.functionsAux.count) {
                value =
                  "COUNT(" + valueAux + ") " + column.functionsAux.aliasCount;
                selected.push(value);
                if(column.functionsAux.orderCount){
                  let aggrName;
                  if(column.functionsAux.aliasCount){
                    aggrName = column.functionsAux.aliasCount;
                  }else{
                    aggrName = "COUNT(" + valueAux + ")";
                  }
                orderb.push(aggrName + ' '+column.functionsAux.orderDirectionCount);
                }
              }
            }
          }
        }
      }
    }
    for (let m= 0; m < this.selectconcat.customFunctions.length; m++){
      let valueCustom = this.selectconcat.customFunctions[m].alias ? this.selectconcat.customFunctions[m].customText +
      ' '+this.selectconcat.customFunctions[m].alias :
      this.selectconcat.customFunctions[m].customText;
      selected.push(valueCustom);
      if(this.selectconcat.customFunctions[m].orderByBool){
        let aggrName;
        if(this.selectconcat.customFunctions[m].alias){
          aggrName = this.selectconcat.customFunctions[m].alias;
        }else{
          aggrName = this.selectconcat.customFunctions[m].customText;
        }
      orderb.push(aggrName + ' '+this.selectconcat.customFunctions[m].orderDirection);
      }
      if(this.selectconcat.customFunctions[m].groupByBool){
        let aggrName;
        if(this.selectconcat.customFunctions[m].alias){
          aggrName = this.selectconcat.customFunctions[m].alias;
        }else{
          aggrName = this.selectconcat.customFunctions[m].customText;
        }
      group.push(aggrName);
      }
    }

    let groupJoin;
    if(this.selectconcat.groupingList=='1'){
      groupJoin = ':'+this.argumentGrouping;
    }else{
      groupJoin = group.join(", ");
    }
    let orderJoin = orderb.join(", ");
    let posTables = selectedTables.join(", ");
    let pos = selected.join(", ");
    this.groupBySentence = groupJoin;
    this.orderBySentence = orderJoin;
    this.fromSentence = posTables;
    this.selectSentence = pos;
  }

  deleteFromSelectView(view) {
    let index = this.selectViews.tables.findIndex(d => d === view);
    let indexConcat = this.selectconcat.tables.findIndex(d => d === view);
    view.delete = true;
    this.deletedTables.push(view);
    this.selectViews.tables.splice(index, 1);
    this.selectconcat.tables.splice(indexConcat, 1);
    view.selected = false;
  }

  //modificado kp20190508
  deleteArgument(arg) {
    let index = this.selectconcat.arguments.findIndex(d => d === arg);
    if (index!=-1){
    if (arg.id != null){
      arg.delete = true;
      if (arg.type===null || arg.type===""){
        arg.type="string";
      }
      this.deletedArguments.push(arg);

    }
    this.selectconcat.arguments.splice(index, 1);
  }
  }

  addView(view) {
    if (view.selected) {
      this.selectViews.tables.push(view);
      this.selectconcat.tables.push(view);
    } else {
      let index = this.selectViews.tables.findIndex(d => d === view);
      let indexConcat = this.selectconcat.tables.findIndex(d => d === view);
      if (index >= 0 && indexConcat >= 0) {
        view.delete = true;
        this.deletedTables.push(view);
        this.selectViews.tables.splice(index, 1);
        this.selectconcat.tables.splice(indexConcat, 1);
      }
    }
  }

  concatChangeEvent(event) {
    this.tableSelected = event.value;
  }

  type(item) {
    if (item.typePresentation == "aggregate") {
      item.functionsAux = new Functions();
      item.functions = new Array<AggregateFucntions>();
      item.functions.push({function:'SUM',alias:'',label:'',selected:false,delete:false,orderBy:'0',orderDirection:''});
      item.functions.push({function:'MAX',alias:'',label:'',selected:false,delete:false,orderBy:'0',orderDirection:''});
      item.functions.push({function:'MIN',alias:'',label:'',selected:false,delete:false,orderBy:'0',orderDirection:''});
      item.functions.push({function:'AVG',alias:'',label:'',selected:false,delete:false,orderBy:'0',orderDirection:''});
      item.functions.push({function:'COUNT',alias:'',label:'',selected:false,delete:false,orderBy:'0',orderDirection:''});
      item.functions.push({function:'STD',alias:'',label:'',selected:false,delete:false,orderBy:'0',orderDirection:''});
      item.alias=null;
    }
  }

  options = {
    lineNumbers: true,
    lineWrapping: true,
    theme: "material",
    autofocus: true,
    mode: { name: "text/x-mariadb" }
  };

  cursorPos: { line: number; ch: number } = { line: 0, ch: 0 };
  cursorMoved() {
    this.cursorPos = (this.codeEditor.codeMirror as any).getCursor();
  }

  selectRow(row) {
    this.argumentSelected = row;
}

//modificado kp20190513
  addNewArgument() {
    let argument = new QueryArgument();
    if(this.selectconcat.arguments!=null){
      this.selectconcat.arguments.push(argument);
    }else{
      this.selectconcat.arguments = [];
      this.selectconcat.arguments.push(argument);
    }
    this.dataSource = new MatTableDataSource(this.selectconcat.arguments);
  }

  //kp20190507 modificado
  setRequired(arg){
    if(arg.requiredBool){
      arg.required = "true";
    }else{
      arg.required = "false";
    }
  }

  checkNameValidator(name) {
    this.service.checkWSName(
      this,
      this.checkNameResponse,
      this.handlerError,
      name
    );
  }

  checkNameResponse(_this, data) {
    if (data) {
      _this.configurationForm.get("nameValidator").setErrors({ exists: data });
    } else {
      _this.configurationForm.get("nameValidator").setErrors(null);
    }
  }

  getErrorArgMessage() {
    return this.argumentsForm.get("argumentName").hasError("required")
      ? "You must enter a name for this argument"
      : "";
  }

  getErrorNameMessage() {
    return this.configurationForm.get("nameValidator").hasError("required")
      ? "You must enter a name"
      : "";
  }

  getErrorNameExistMessage() {
    return this.configurationForm.get("nameValidator").hasError("exists")
      ? "Name already exists"
      : "";
  }

  getErrorTypeArguments() {
    return this.argumentsForm.get("argumentType").hasError("required")
      ? "You must enter a type argument"
      : "";
  }

  //kp20190510
  openDialog(data): void {
    // openDialog(): void {
    if (this.globals.DialogClose){
    this.globals.DialogClose=false;
    this.dialogRef = this.dialog.open(DialogErrorLogComponent, {
      disableClose: false,
      hasBackdrop: false
      ,data: data
    });

    this.dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  else{
    this.dialogRef.close();
  }
  }

  checkValidate(){
    if(this.checkBool){
      this.checkColumn = '1';
    }else{
      this.checkColumn = '0';
    }
  }

}
