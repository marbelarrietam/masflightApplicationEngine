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
import { ConnectionQuery } from '../model/connection';

@Component({
  selector: "app-web-services, FilterPipe",
  templateUrl: "./web-services.component.html",
  styleUrls: ["./web-services.component.css"]
})
export class WebServicesComponent implements OnInit {
  @ViewChild("codeEditorWhere") codeEditorWhere: CodemirrorComponent;
  @ViewChild("codeEditorQuery") codeEditorQuery: CodemirrorComponent;
  @ViewChild("codeEditorHaving") codeEditorHaving: CodemirrorComponent;
   dataError: any;
  dataErrorStep: any
  queryEdit:boolean = true;
  queryText:string;
  searchText: string;
  searchView: string;
  searchColumn: string;
  searchGroup: string;
  searchOrder: string;
  checkColumn = '1';
  checkQuery = '1';
  checkBool: boolean = true;
  checkBoolQuery: boolean = true;
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
  actualConn: any =null;
  argumentGrouping: string;
  sortingList: string= '0';
  dataSourceForm = new FormGroup({
    tablesValidator: new FormControl("nameTable", [Validators.required])
  });

  columnsForm = new FormGroup({
    columnsValidator: new FormControl("nameColumn", [Validators.required])
  });

  groupBySelected: Array<any> = new Array<any>();
  orderBySelected: Array<any> = new Array<any>();
  connections: Array<ConnectionQuery> = new Array<ConnectionQuery>();
  tableSelected: Tables = new Tables();
  selectEdit: QueryWS = new QueryWS();
  selectTables: QueryWS = new QueryWS();
  selectViews: QueryWS = new QueryWS();
  selectconcat: QueryWS = new QueryWS();
  tables: any[] = [];
  tablesBackup: any[] = [];
  views: any[] = [];
  viewsBackup: any[] = [];
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
  publish: boolean;
  pagina: any;

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
    this.pagina=0;
    if(!this.globals.currentWebService){
      this.queryEdit = true;
      this.publish = false;
    }else{
      this.queryEdit = false;
      this.publish = true;
      this.actualConn = this.globals.currentWebService.connection;
      this.queryText = this.globals.currentWebService.query;
      if (this.globals.currentWebService.tables.length == 0 ){
        this.checkQuery = '0';
        this.checkBool=false;
        this.checkColumn = '0';
        this.checkBoolQuery=false;
      }else{
        //agrego las otras columnas del query para completarlo
        /* Descomentar cuando mire si realiza bien el group by quitandolo del campo query en la BD
        if (this.globals.currentWebService.groupBySentence!=null && this.globals.currentWebService.groupingList=='0') {
          this.queryText += " GROUP BY " + this.globals.currentWebService.groupBySentence;
        }else */
        if(this.globals.currentWebService.groupingList=='1'){
          for (let i=0;i<this.globals.currentWebService.arguments.length;i++){
            if(this.globals.currentWebService.arguments[i].grouping=="1"){
              this.queryText += " GROUP BY :" + this.globals.currentWebService.arguments[i].label;
              i=this.globals.currentWebService.arguments.length;
            }
          }
        }
        if (this.globals.currentWebService.sortingSentence!=null && this.globals.currentWebService.sortingSentence!=""){
          if(this.globals.currentWebService.sortingList=='0'){
            this.queryText += " ORDER BY " + this.globals.currentWebService.sortingSentence;
          }
        }
      }
    }
    this.dataError = {errors:[]};
    this.dataErrorStep = {errors:[]};
    this.globals.DialogClose = true;
    this.getConnections();

    this.argForms = this.formBuilder.group({
      items: this.formBuilder.array([])
    });
  }

  getConnections(){
    this.service.getConnections(this,this.handlerConn, this.handlerError);
  }

  handlerConn(_this, data){
     _this.connections = data;
     if (_this.globals.currentWebService) {
       _this.selectconcat.connection = _this.actualConn;
       _this.pagina=1;
       _this.getTables(_this.selectconcat.connection,1,null,null,3);
     }else{

     _this.globals.isLoading = false;
     }

  }

  changeConnection(){
    console.log(this.selectconcat);
    this.actualConn = this.selectconcat.connection;
    this.pagina=1;
    this.getTables(this.selectconcat.connection,1,null,null,3);
  }

  clear(){
    this.showError=false;
    this.dataError = {errors:[]};
    this.dataErrorStep = {errors:[]};
    this.tableSelected =  new Tables();
    this.selectEdit = new QueryWS();
    this.selectTables = new QueryWS();
    this.selectViews = new QueryWS();
    this.selectconcat = new QueryWS();
    this.tables = this.tablesBackup;
    this.views = this.viewsBackup;
  }

  validate(){
    this.selectconcat.connection = this.actualConn;
    if(this.actualConn!=null && this.queryText!=null && this.queryText!='' ){
    this.service.getsetSteps(this,encodeURIComponent(this.queryText),
    this.checkColumn,this.actualConn, this.handlerSuccessText, this.handlerError)
    }else{
      const dialogRef = this.dialog.open(MessageComponent, {
        data: {
          title: "Error",
          message: "You must choose a connection and write a query to validate"
        }
      });
    }
  }

  handlerSuccessText(_this, data) {
    if (data.errors == null) {
      _this.clear2();
      if(!_this.globals.currentWebService){   
        //si es un nuevo servicio   
        // _this.clear;
        _this.selectEdit = data;
      }else{
      if (_this.globals.currentWebService.id != null) {
        //si es un servicio ya guardado
        // _this.clear2();
        _this.cleanDataWs(_this, data)
        _this.CleanArguments(_this, data)
        _this.CleanCustomFun(_this, data)
        _this.CleanTables(_this, data)
      } 
      // else {
      //   //si aun no se ha gurdado
      //   _this.clear;
      //   _this.selectEdit = data;
      // }
    }
      _this.getDataQueryInit();
      _this.queryEdit = false;
      _this.getSelectedColumns();
      _this.publish=true;
      _this.globals.isLoading = false;
    } else {
      _this.publish=false;
      _this.globals.isLoading = false;
      _this.dataError = data;
      const dialogRef = _this.dialog.open(MessageComponent, {
        data: {
          title: "Error",
          message: "It was a problem whith your syntax, check and try again"
        }
      });
      console.log(data.errors);
    }
  }

  clear2() {
    this.showError = false;
    this.dataError = { errors: [] };
    this.dataErrorStep = { errors: [] };
    this.tableSelected = new Tables();
    this.selectTables = new QueryWS();
    this.selectViews = new QueryWS();
    this.selectconcat = new QueryWS();
    this.groupBySelected = new Array<any>();
    this.orderBySelected = new Array<any>();
    this.tables = this.tablesBackup;
    this.views = this.viewsBackup;
  }

  
  cleanDataWs(_this, data) {
    _this.selectEdit.groupingList = data.groupingList;
    _this.selectEdit.sortingList = data.sortingList;
    _this.selectEdit.whereclause = data.whereclause;
    _this.selectEdit.havingclause = data.havingclause;
    _this.selectEdit.query = data.query;

    _this.selectEdit.groupBySentence = data.groupBySentence;
    _this.selectEdit.sortingSentence = data.sortingSentence;
    _this.selectEdit.stringTable = data.stringTable;
  }
  
  CleanArguments(_this, data) {
    var aux = _this.globals.currentWebService.arguments.slice();
    var cont = 0;
    let index = 0;
    //marco para borar los arg que estan en el edit y no estan en el data, si el data es null borro todos los arg del edit
    for (let j = 0; j < _this.globals.currentWebService.arguments.length; j++) {
      var x = j;
      x = x - cont;
      if (data.arguments == null) {
        index = -1;
      } else {
        index = data.arguments.findIndex(d => d.label.toLowerCase() === _this.globals.currentWebService.arguments[j].label.toLowerCase());
      }
      if (index == -1) {
        //si tiene id lo marco para borrar de la BD , sino simplemente lo borro de la lista
        if (aux[x].id != null) {
          aux[x].delete = true;
        } else {
          aux.splice(x, 1);
          cont++;
        }
      }
    }
    //Agrego los argumentos que estan en el data y no estan en el edit
    if (data.arguments != null) {
      for (let i = 0; i < data.arguments.length; i++) {
        let index = aux.findIndex(d => d.label.toLowerCase() === data.arguments[i].label.toLowerCase());
        if (index == -1) {
          aux.push(data.arguments[i]);
        }else{
          // si lo encuentra lo dejo igual que el data , pero conservo el id
          data.arguments[i].id=aux[index].id;
          aux[index]=data.arguments[i];
        }
      }
    }
    _this.selectEdit.arguments = aux;
  }

  CleanCustomFun(_this, data) {
    var aux = _this.globals.currentWebService.customFunctions.slice();
    var cont = 0;
    let index = 0;
    //marco para borar los customFunctions que estan en el edit y no estan en el data, si el data es null borro todos los arg del edit
    for (let j = 0; j < _this.globals.currentWebService.customFunctions.length; j++) {
      var x = j;
      x = x - cont;
      if (data.customFunctions == null) {
        index = -1;
      } else {
        index = data.customFunctions.findIndex(d => d.customText.toLowerCase() === _this.globals.currentWebService.customFunctions[j].customText.toLowerCase());
      }
      if (index == -1) {
        if (aux[x].id != null) {
          aux[x].delete = true;
        } else {
          aux.splice(x, 1);
          cont++;
        }
      }
    }
    //Agrego los argumentos que estan en el data y no estan en el edit
    if (data.customFunctions != null) {
      for (let i = 0; i < data.customFunctions.length; i++) {
        let index = aux.findIndex(d => d.customText.toLowerCase() === data.customFunctions[i].customText.toLowerCase());
        if (index == -1) {
          aux.push(data.customFunctions[i]);
        }else{
          // si lo encuentra lo dejo igual que el data , pero conservo el id
          data.customFunctions[i].id=aux[index].id;
          aux[index]=data.customFunctions[i];
        }
      }
    }
    _this.selectEdit.customFunctions = aux;
  }

  CleanTables(_this, data) {
    var aux = _this.globals.currentWebService.tables.slice();
    var cont = 0;
    var contColumn = 0;
    let index = 0;
    let indexColumn = 0;
    //marco para borar los tables que estan en el edit y no estan en el data, si el data es null borro todos los arg del edit
    for (let j = 0; j < _this.globals.currentWebService.tables.length; j++) {
      var x = j;
      x = x - cont;
      if (data.tables == null) {
        index = -1;
      } else {
        index = data.tables.findIndex(d => d.name.toLowerCase() === _this.globals.currentWebService.tables[j].name.toLowerCase());
      }
      //si la tabla no esta
      if (index == -1) {
        //si la tabla esta en la BD la marco para borrar
        if (aux[x].id != null) {
          aux[x].delete = true;
          for (let j = 0; j < aux[x].columns.length; j++) {
            if (aux[x].columns[j].orderBy==='1') {
              aux[x].columns[j].orderBool = false;
              _this.addOrderBy(aux[x], aux[x].columns[j]);
            }else{
              aux[x].columns[j].orderByBool = false;
            }
            if (aux[x].columns[j].groupBy==='1') {
              aux[x].columns[j].groupByBool = false;
              _this.addGroupBy(aux[x], aux[x].columns[j]);
            }else{
              aux[x].columns[j].orderByBool = false;
            }
            _this.addColumn(aux[x].columns[j]);
          }
        } else {
          aux.splice(x, 1);
          cont++;
        }
      } else {
        aux[x].alias = data.tables[index].alias;
        //si la tabla existe recorro las columnas del edit y borro las columnas que no esten
        for (let i = 0; i < _this.globals.currentWebService.tables[j].columns.length; i++) {
          var y = i;
          y = y - contColumn;
          indexColumn = data.tables[index].columns.findIndex(d => d.name.toLowerCase() === _this.globals.currentWebService.tables[j].columns[i].name.toLowerCase());
          if (indexColumn == -1) {
            //sino encuentra la columna en el data la borro del auxiliar
            if (aux[x].columns[y].id != null) {
              if (aux[x].columns[j].orderBy==='1') {
                aux[x].columns[j].orderByBool = false;
                _this.addOrderBy(aux[x], aux[x].columns[j]);
              }else{
                aux[x].columns[j].orderByBool = false;
              }
              if (aux[x].columns[j].groupBy==='1') {
                aux[x].columns[j].groupByBool = false;
                _this.addGroupBy(aux[x], aux[x].columns[j]);
                // aux[x].columns[j].groupBy='0'
              }else{
                aux[x].columns[j].orderByBool = false;
              }
              _this.addColumn(aux[x].columns[j]);
              // aux[x].columns[y].delete = true;
            } else {
              aux[x].columns.splice(y, 1);
              contColumn++;
            }
          }else{
            //si encuentra la columna conservo el id y la remplazo por la columna del data
            data.tables[index].columns[indexColumn].id = _this.globals.currentWebService.tables[j].columns[i].id;
            aux[x].columns[y]=data.tables[index].columns[indexColumn];
          }
        }
      }
    }
    //Agrego los tablas que estan en el data y no estan en el edit
    if (data.tables != null) {
      for (let i = 0; i < data.tables.length; i++) {
        let index2 = aux.findIndex(d => d.name.toLowerCase() === data.tables[i].name.toLowerCase());
        if (index2 == -1) {
          aux.push(data.tables[i]);
        } else {
          //si la tabla existe recorro las columnas del data y agrego las colum que no esten
          for (let j = 0; j < data.tables[i].columns.length; j++) {
            let indexColumn2 = aux[index2].columns.findIndex(d => d.name.toLowerCase() === data.tables[i].columns[j].name.toLowerCase());
            //si la columna no existe en el auxiliar la agrego
            if (indexColumn2 == -1) {
              aux[index2].columns.push(data.tables[i].columns[j]);
            }
          }
        }
      }
    }
    _this.selectEdit.tables = aux;
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

  getTables(conn,pag,nomTable,nomView,search) {
    if (pag==1 && search==3){
      this.tables=[];
      this.views=[];
    }
    this.service.getMetaDataTables(
      this,conn,pag,nomTable,nomView,search,
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
      this.publish = true;
    }else{
      this.queryEdit = true;
      if(this.checkBoolQuery){
        this.publish = false;
      }else{
        this.publish = true;
      }
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
    let queryString= "";
    if (this.checkQuery==='0'){
      queryString = this.queryText;
    }else{
     queryString =
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
    /*if (this.orderBySentence && this.selectconcat.sortingList=='0') {
      queryString += " ORDER BY " + this.orderBySentence;
    }*/ //SACAR DE LA BD CUANDO SE HACE EL TEST
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
    if (this.checkQuery==='0'){
      queryJson.whereclause = null;
      queryJson.havingclause = null
    }else{
      queryJson.whereclause = this.whereSentence;
      queryJson.havingclause = this.havingSentence;
    }
    queryJson.sortingSentence = this.selectconcat.sortingList != '1' ? this.orderBySentence : null;
    queryJson.groupBySentence = this.selectconcat.groupingList != '1' ? this.groupBySentence : null;
    queryJson.groupingList = this.selectconcat.groupingList;
    queryJson.sortingList = this.selectconcat.sortingList;
    queryJson.query = this.getQueryString();
    queryJson.method = this.selectconcat.method;
    queryJson.description = this.selectconcat.description;
    queryJson.pageSize = this.selectconcat.pageSize;
    queryJson.rows = this.selectconcat.rows;
    queryJson.wrapped = this.selectconcat.wrapped != null ? this.selectconcat.wrapped : '1';
    queryJson.checkColumn = this.checkColumn;
    queryJson.checkQuery = this.checkQuery;
    queryJson.connection = this.selectconcat.connection;
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
      if (data[i].type.toLowerCase() == "table") {
        _this.tables.push(data[i]);
      } else if (data[i].type.toLowerCase() == "view") {
        _this.views.push(data[i]);
      }
    }
    _this.tablesBackup = JSON.parse(JSON.stringify( _this.tables ));
    _this.viewsBackup = JSON.parse(JSON.stringify( _this.views));
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
    //la primera vez no tiene id, cuando camnbio de coneccion y estoy editando ya tengo id , no necesito volver llenar los datos
    if(this.selectEdit.id==null){
    this.selectEdit = this.globals.currentWebService;
    this.getDataQueryInit();
    }
  }

  getDataQueryInit() {
    this.selectconcat.connection = this.actualConn;
    this.getArgumentsQuery();
    this.selectconcat.name = this.selectEdit.name;
    this.selectconcat.groupingList = this.selectEdit.groupingList;
    this.selectconcat.sortingList = this.selectEdit.sortingList;
    this.selectconcat.id = this.selectEdit.id;
    this.selectconcat.pageSize = this.selectEdit.pageSize;
    this.selectconcat.method = this.selectEdit.method;
    this.selectconcat.description = this.selectEdit.description;
    this.selectconcat.wrapped = this.selectEdit.wrapped; //kp20190508
    this.getcustomFunctionsQuery();
    this.whereSentence = this.selectEdit.whereclause;
    this.havingSentence = this.selectEdit.havingclause;
    //kp20190508 change order of for to decrease time of search
    this.gettablesQuery();
    this.tableSelected = this.selectconcat.tables[0];
    console.log(this.selectconcat.tables);
  }

  getArgumentsQuery() {
    var cont = 0;
    if (this.selectEdit.arguments != null) {
      this.selectconcat.arguments = this.selectEdit.arguments.slice();
      for (let x = 0; x < this.selectEdit.arguments.length; x++) {
        var i = x;
        i = i - cont;
        if (this.selectconcat.arguments[i].delete == true) {
          //revisar si funciona porque yo coloque delete=true
          this.deleteArgument(this.selectconcat.arguments[i]);
          cont++;
        } else {
          if (this.selectconcat.arguments[i].required == "true") {
            this.selectconcat.arguments[i].requiredBool = true;

          } else {
            this.selectconcat.arguments[i].requiredBool = false;
          }
          if (this.selectconcat.arguments[i].grouping == "1") {
            this.selectconcat.arguments[i].groupingBool = true;
            this.argumentGrouping = this.selectconcat.arguments[i].label;
          } else {
            this.selectconcat.arguments[i].groupingBool = false;
          }
        }
      }//end fot arguments
    }
  }

  getcustomFunctionsQuery() {
    var cont = 0;
    if (this.selectEdit.customFunctions != null) {
      this.selectconcat.customFunctions = this.selectEdit.customFunctions.slice();
      for (let x = 0; x < this.selectconcat.customFunctions.length; x++) {
        var a = x;
        a = a - cont;
        if (this.selectconcat.customFunctions[a].delete == true) {
          //revisar si funciona porque yo coloque delete=true
          this.deleteCustomFunction(this.selectconcat.customFunctions[a]);
          cont++;
        } else {
          if (this.selectconcat.customFunctions[a].orderBy == "1") {
            this.selectconcat.customFunctions[a].orderByBool = true;
          } else {
            this.selectconcat.customFunctions[a].orderByBool = false;
          }

          if (this.selectconcat.customFunctions[a].groupBy == "1") {
            this.selectconcat.customFunctions[a].groupByBool = true;
          } else {
            this.selectconcat.customFunctions[a].groupByBool = false;
          }
        }
      }
    }
  }

  
  gettablesQuery() {
    for (let j = 0; j < this.selectEdit.tables.length; j++) {
      if (this.selectEdit.tables[j].delete == true) {
        this.deletedTables.push(this.selectEdit.tables[j]);
      } else
        if (this.selectEdit.tables[j].type.toLowerCase() === "table" && this.selectEdit.tables[j].delete != true) {
          for (let i = 0; i < this.tables.length; i++) {
            if (this.tables[i].name.toLowerCase() == this.selectEdit.tables[j].name.toLowerCase()) {
              this.tables[i].id = this.selectEdit.tables[j].id;
              this.tables[i].selected = true;
              this.tables[i].alias = this.selectEdit.tables[j].alias;
              this.selectTables.tables.push(this.tables[i]);
              this.selectconcat.tables.push(this.tables[i]);
              for (let m = 0; m < this.selectEdit.tables[j].columns.length; m++) {
                  let columnsOrigin = this.selectEdit.tables[j].columns[m];
                columnsOrigin.order = columnsOrigin.order
                  ? columnsOrigin.order
                  : 0;
                for (let k = 0; k < this.tables[i].columns.length; k++) {
                  this.tables[i].columns[k].order = 0;
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
                    if (columnsToAdd.groupBy == "1" && this.groupinglist == '0') {
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
                    if(columnsOrigin.delete===true){
                      columnsToAdd.selected = false;
                    }else{
                      columnsToAdd.selected = true;
                    }
                    columnsToAdd.typePresentation = columnsOrigin.typePresentation;
                    columnsToAdd.selectedResult = columnsOrigin.selectedResult;
                    columnsToAdd.order = columnsOrigin.order;
                    if (columnsToAdd.typePresentation == "aggregate") {
                      for (let n = 0; n < columnsToAdd.functions.length; n++) {
                        console.log(columnsToAdd.functions[n]);

                        switch (columnsToAdd.functions[n].function) {
                          case "SUM": {
                            columnsToAdd.functionsAux.sum = true;
                            columnsToAdd.functionsAux.aliasSum = columnsToAdd.functions[n].alias;
                            columnsToAdd.functionsAux.idSum = columnsToAdd.functions[n].id;
                            columnsToAdd.functionsAux.orderDirectionSum = columnsToAdd.functions[n].orderDirection;
                            if (columnsToAdd.functions[n].orderBy == "1") {
                              columnsToAdd.functionsAux.orderSum = true;
                            } else { columnsToAdd.functionsAux.orderSum = false; }
                            break;
                          }
                          case "MAX": {
                            columnsToAdd.functionsAux.max = true;
                            columnsToAdd.functionsAux.aliasMax = columnsToAdd.functions[n].alias;
                            columnsToAdd.functionsAux.idMax = columnsToAdd.functions[n].id;
                            columnsToAdd.functionsAux.orderDirectionMax = columnsToAdd.functions[n].orderDirection;
                            if (columnsToAdd.functions[n].orderBy == "1") {
                              columnsToAdd.functionsAux.orderMax = true;
                            } else { columnsToAdd.functionsAux.orderMax = false; }
                            break;
                          }
                          case "MIN": {
                            columnsToAdd.functionsAux.min = true;
                            columnsToAdd.functionsAux.aliasMin = columnsToAdd.functions[n].alias;
                            columnsToAdd.functionsAux.idMin = columnsToAdd.functions[n].id;
                            columnsToAdd.functionsAux.orderDirectionMin = columnsToAdd.functions[n].orderDirection;
                            if (columnsToAdd.functions[n].orderBy == "1") {
                              columnsToAdd.functionsAux.orderMin = true;
                            } else { columnsToAdd.functionsAux.orderMin = false; }
                            break;
                          }
                          case "AVG": {
                            columnsToAdd.functionsAux.avg = true;
                            columnsToAdd.functionsAux.aliasAvg = columnsToAdd.functions[n].alias;
                            columnsToAdd.functionsAux.idAvg = columnsToAdd.functions[n].id;
                            columnsToAdd.functionsAux.orderDirectionAvg = columnsToAdd.functions[n].orderDirection;
                            if (columnsToAdd.functions[n].orderBy == "1") {
                              columnsToAdd.functionsAux.orderAvg = true;
                            } else { columnsToAdd.functionsAux.orderAvg = false; }
                            break;
                          }
                          case "COUNT": {
                            columnsToAdd.functionsAux.count = true;
                            columnsToAdd.functionsAux.aliasCount = columnsToAdd.functions[n].alias;
                            columnsToAdd.functionsAux.idCount = columnsToAdd.functions[n].id;
                            columnsToAdd.functionsAux.orderDirectionCount = columnsToAdd.functions[n].orderDirection;
                            if (columnsToAdd.functions[n].orderBy == "1") {
                              columnsToAdd.functionsAux.orderCount = true;
                            } else { columnsToAdd.functionsAux.orderCount = false; }
                            break;
                          }
                          case "STD": {
                            columnsToAdd.functionsAux.std = true;
                            columnsToAdd.functionsAux.aliasStd = columnsToAdd.functions[n].alias;
                            columnsToAdd.functionsAux.idStd = columnsToAdd.functions[n].id;
                            columnsToAdd.functionsAux.orderDirectionStd = columnsToAdd.functions[n].orderDirection;
                            if (columnsToAdd.functions[n].orderBy == "1") {
                              columnsToAdd.functionsAux.orderStd = true;
                            } else { columnsToAdd.functionsAux.orderStd = false; }
                            break;
                          }
                        }
                      }
                    } else {
                      columnsToAdd.alias = columnsOrigin.alias;
                      columnsToAdd.orderDirection = "ASC";
                      columnsToAdd.orderDirection = columnsOrigin.orderDirection;
                    }
                  }
                }//end for columns
              // }
              }
              this.tables[i].columns.sort(function (a, b) {
                if (a.order > b.order) {
                  return 1;
                } else if (a.order < b.order) {
                  return -1;
                }
                return 0;
              });
            }
          }//end for tables
        } else if (this.selectEdit.tables[j].type.toLowerCase() === "view" && this.selectEdit.tables[j].delete != true) {
          for (let i = 0; i < this.views.length; i++) {
            if (this.views[i].name.toLowerCase() == this.selectEdit.tables[j].name.toLowerCase()) {
              this.views[i].id = this.selectEdit.tables[j].id;
              this.views[i].selected = true;
              this.views[i].alias = this.selectEdit.tables[j].alias;
              this.selectViews.tables.push(this.views[i]);
              this.selectconcat.tables.push(this.views[i]);
              for (let m = 0; m < this.selectEdit.tables[j].columns.length; m++) {
                let columnsOrigin = this.selectEdit.tables[j].columns[m];
                columnsOrigin.order = columnsOrigin.order
                  ? columnsOrigin.order
                  : 0;
                for (let k = 0; k < this.views[i].columns.length; k++) {
                  this.views[i].columns[k].order = 0;
                  if (
                    this.views[i].columns[k].name.toLowerCase() ==
                    this.selectEdit.tables[j].columns[m].name.toLowerCase()
                  ) {
                    let columnsToAdd = this.views[i].columns[k];

                    columnsToAdd.id = columnsOrigin.id;
                    columnsToAdd.selectedResult = columnsOrigin.selectedResult;
                    columnsToAdd.functionsAux = new Functions();
                    columnsToAdd.functions = columnsOrigin.functions;
                    columnsToAdd.groupBy = columnsOrigin.groupBy;
                    columnsToAdd.orderBy = columnsOrigin.orderBy;
                    if (columnsToAdd.groupBy == "1" && this.groupinglist == '0') {
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
                    if(columnsOrigin.delete===true){
                      columnsToAdd.selected = false;
                    }else{
                      columnsToAdd.selected = true;
                    }
                    columnsToAdd.typePresentation = columnsOrigin.typePresentation;
                    columnsToAdd.selectedResult = columnsOrigin.selectedResult;
                    columnsToAdd.order = columnsOrigin.order;
                    if (columnsToAdd.typePresentation == "aggregate") {
                      for (let n = 0; n < columnsToAdd.functions.length; n++) {
                        console.log(columnsToAdd.functions[n]);

                        switch (columnsToAdd.functions[n].function) {
                          case "SUM": {
                            columnsToAdd.functionsAux.sum = true;
                            columnsToAdd.functionsAux.aliasSum = columnsToAdd.functions[n].alias;
                            columnsToAdd.functionsAux.idSum = columnsToAdd.functions[n].id;
                            columnsToAdd.functionsAux.orderDirectionSum = columnsToAdd.functions[n].orderDirection;
                            if (columnsToAdd.functions[n].orderBy == "1") {
                              columnsToAdd.functionsAux.orderSum = true;
                            } else { columnsToAdd.functionsAux.orderSum = false; }
                            break;
                          }
                          case "MAX": {
                            columnsToAdd.functionsAux.max = true;
                            columnsToAdd.functionsAux.aliasMax = columnsToAdd.functions[n].alias;
                            columnsToAdd.functionsAux.idMax = columnsToAdd.functions[n].id;
                            columnsToAdd.functionsAux.orderDirectionMax = columnsToAdd.functions[n].orderDirection;
                            if (columnsToAdd.functions[n].orderBy == "1") {
                              columnsToAdd.functionsAux.orderMax = true;
                            } else { columnsToAdd.functionsAux.orderMax = false; }
                            break;
                          }
                          case "MIN": {
                            columnsToAdd.functionsAux.min = true;
                            columnsToAdd.functionsAux.aliasMin = columnsToAdd.functions[n].alias;
                            columnsToAdd.functionsAux.idMin = columnsToAdd.functions[n].id;
                            columnsToAdd.functionsAux.orderDirectionMin = columnsToAdd.functions[n].orderDirection;
                            if (columnsToAdd.functions[n].orderBy == "1") {
                              columnsToAdd.functionsAux.orderMin = true;
                            } else { columnsToAdd.functionsAux.orderMin = false; }
                            break;
                          }
                          case "AVG": {
                            columnsToAdd.functionsAux.avg = true;
                            columnsToAdd.functionsAux.aliasAvg = columnsToAdd.functions[n].alias;
                            columnsToAdd.functionsAux.idAvg = columnsToAdd.functions[n].id;
                            columnsToAdd.functionsAux.orderDirectionAvg = columnsToAdd.functions[n].orderDirection;
                            if (columnsToAdd.functions[n].orderBy == "1") {
                              columnsToAdd.functionsAux.orderAvg = true;
                            } else { columnsToAdd.functionsAux.orderAvg = false; }
                            break;
                          }
                          case "COUNT": {
                            columnsToAdd.functionsAux.count = true;
                            columnsToAdd.functionsAux.aliasCount = columnsToAdd.functions[n].alias;
                            columnsToAdd.functionsAux.idCount = columnsToAdd.functions[n].id;
                            columnsToAdd.functionsAux.orderDirectionCount = columnsToAdd.functions[n].orderDirection;
                            if (columnsToAdd.functions[n].orderBy == "1") {
                              columnsToAdd.functionsAux.orderCount = true;
                            } else { columnsToAdd.functionsAux.orderCount = false; }
                            break;
                          }
                          case "STD": {
                            columnsToAdd.functionsAux.std = true;
                            columnsToAdd.functionsAux.aliasStd = columnsToAdd.functions[n].alias;
                            columnsToAdd.functionsAux.idStd = columnsToAdd.functions[n].id;
                            columnsToAdd.functionsAux.orderDirectionStd = columnsToAdd.functions[n].orderDirection;
                            if (columnsToAdd.functions[n].orderBy == "1") {
                              columnsToAdd.functionsAux.orderStd = true;
                            } else { columnsToAdd.functionsAux.orderStd = false; }
                            break;
                          }
                        }
                      }
                    } else {
                      columnsToAdd.alias = columnsOrigin.alias;
                      columnsToAdd.orderDirection = "ASC";
                      columnsToAdd.orderDirection = columnsOrigin.orderDirection;
                    }
                  }
                }
              }
              this.views[i].columns.sort(function (a, b) {
                if (a.order > b.order) {
                  return 1;
                } else if (a.order < b.order) {
                  return -1;
                }
                return 0;
              });
            }
          }//end for views
        }
    }

  }

  addTable(table) {
    if (table.selected) {
      this.selectTables.tables.push(table);
      this.selectconcat.tables.push(table);
    } else {
      let index = this.selectTables.tables.findIndex(d => d === table);
      let indexConcat = this.selectconcat.tables.findIndex(d => d === table);
      if (index >= 0 && indexConcat >= 0) {
        if (table.id != null){
          table.delete = true;
          this.deletedTables.push(table);
        }
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

  addGroupByExpression(exp){
    if(exp.groupByBool){
      exp.groupBy="1";
      this.groupBySelected.push(exp);
    }else{
      this.deletedCustomFunctions.push(exp)
      this.groupBySelected.splice(this.groupBySelected.indexOf(exp),1);
      exp.groupBy="0";
    }
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
      if (index != -1){
        this.orderBySelected.splice(index, 1);
      }
      this.deletedColumns.push(columnAdd);
      columnAdd.delete = true;
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
      if(this.selectconcat.customFunctions[m].selectedResult=="1"){
      selected.push(valueCustom);
      }
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
    if (index >= 0 && indexConcat >= 0) {
      if (view.id != null){
        view.delete = true;
        this.deletedTables.push(view);
      }
    this.selectViews.tables.splice(index, 1);
    this.selectconcat.tables.splice(indexConcat, 1);
    view.selected = false;
    }
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
        if(view.id!=null){
        view.delete = true;
        this.deletedTables.push(view);
        }
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

  cursorPosQuery: { line: number; ch: number } = { line: 0, ch: 6 };
  cursorMovedQuery() {
    this.cursorPosQuery = (this.codeEditorQuery.codeMirror as any).getCursor();
  }

  optionsWhere = {
    lineNumbers: false,
    lineWrapping: false,
    theme: "material",
    autofocus: true,
    mode: { name: "text/x-mariadb" }
  };
  cursorPosWhere: { line: number; ch: number } = { line: 0, ch: 0 };
  cursorMovedWhere() {
    this.cursorPosWhere = (this.codeEditorWhere.codeMirror as any).getCursor();
  }

  optionsHaving = {
    lineNumbers: false,
    lineWrapping: false,
    theme: "material",
    autofocus: true,
    mode: { name: "text/x-mariadb" }
  };
  cursorPosHaving: { line: number; ch: number } = { line: 0, ch: 0 };
  cursorMovedHaving() {
    this.cursorPosHaving = (this.codeEditorHaving.codeMirror as any).getCursor();
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
    this.globals.DialogClose=true;
  }
  }

  checkValidate(){
    if(this.checkBool){
      this.checkColumn = '1';
    }else{
      this.checkColumn = '0';
    }
  }

  checkValidateQuery(){
    if(this.checkBoolQuery){
      this.checkQuery = '1';
      this.publish=false;
    }else{
      this.checkQuery = '0';
      this.checkBool=false;
      this.checkColumn = '0';
      this.publish=true;
    }
  }

  moreResult(){
    this.pagina=this.pagina+1;
    this.getTables(this.selectconcat.connection,this.pagina,this.searchText,this.searchView,3);
  }
  SearchTable(){
    this.getTables(this.selectconcat.connection,1,this.searchText,null,1);
  }
}
