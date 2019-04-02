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
import { MatDialog } from "@angular/material";
import { Functions } from "../model/Functions";
import { CodemirrorComponent } from "@ctrl/ngx-codemirror";
import "codemirror/mode/sql/sql";
import { MessageComponent } from "../message/message.component";
import { QueryArgument } from "../model/QueryArgument";
import { AggregateFucntions } from "../model/AggregateFunctions";

@Component({
  selector: "app-web-services, FilterPipe",
  templateUrl: "./web-services.component.html",
  styleUrls: ["./web-services.component.css"]
})
export class WebServicesComponent implements OnInit {
  @ViewChild("codeEditor") codeEditor: CodemirrorComponent;
  public searchText: string;
  public searchView: string;
  public searchColumn: string;
  public searchGroup: string;
  deletedTables: Array<Tables> = new Array();
  deletedColumns: Array<Columns>= new Array();
  deletedArguments: Array<QueryArgument> = new Array();
  deletedAggregates: Array<AggregateFucntions> = new Array();
  selectSentence: string;
  selectedColumns: string;
  fromSentence: string;
  whereSentence: string;
  groupBySentence: string;
  dataSourceForm = new FormGroup({
    tablesValidator: new FormControl("nameTable", [Validators.required])
  });

  columnsForm = new FormGroup({
    columnsValidator: new FormControl("nameColumn", [Validators.required])
  });

  groupBySelected: Array<Columns> = new Array<Columns>();
  tableSelected: Tables = new Tables();
  selectEdit: QueryWS = new QueryWS();
  selectTables: QueryWS = new QueryWS();
  selectViews: QueryWS = new QueryWS();
  selectconcat: QueryWS = new QueryWS();
  tables: any[] = [];
  views: any[] = [];
  argForms: FormGroup;
  items: FormArray;
  configurationForm = new FormGroup({
    nameValidator: new FormControl("name", [Validators.required])
  });

  argumentsForm = new FormGroup({
    argumentRequired: new FormControl(),
    argumentName: new FormControl("argumentName", [Validators.required]),
    argumentType: new FormControl()
  });

  constructor(
    private router: Router,
    public globals: Globals,
    private service: ApplicationService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getTables();
    this.argForms = this.formBuilder.group({
      items: this.formBuilder.array([])
    });
  }

  getTables() {
    this.service.getMetaDataTables(
      this,
      this.handlerSuccessTables,
      this.handlerError
    );
  }

  verifyArguments() {
    let value = 0;
    for (let i = 0; i < this.selectconcat.arguments.length; i++) {
      console.log(this.selectconcat.arguments[i]);
      if (
        this.selectconcat.arguments[i]["label"] == null ||
        this.selectconcat.arguments[i]["label"] == ""
      ) {
        value = 1;
      }
    }
    if (value > 0) {
      return false;
    } else {
      return true;
    }
  }

  saveWebService() {
    this.getSelectedColumns();
    let argumentsVerification = this.verifyArguments();
    if (this.configurationForm.valid) {
      if (argumentsVerification) {
        this.service.saveWebServices(
          this,
          this.createQueryJson(),
          this.handlerSuccessWS,
          this.handlerErrorSave
        );
      } else {
        const dialogRef = this.dialog.open(MessageComponent, {
          data: {
            title: "Error",
            message: "You have missing some arguments names, please check"
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

  handlerSuccessWS(_this) {
    console.log("success");
    let activity = "created";
    if (_this.globals.currentWebService) {
      activity = "edited";
    }
    const dialogRef = _this.dialog.open(MessageComponent, {
      data: { title: "Success", message: "Web service was " + activity }
    });
    _this.globals.isLoading = false;
    _this.globals.currentApplication = "list";
  }

  handlerErrorSave(_this, result) {
    const dialogRef = _this.dialog.open(MessageComponent, {
      data: { title: "Error", message: "It was a problem, try again" }
    });
    _this.globals.isLoading = false;
  }
  getQueryString() {
    let queryString =
      "SELECT " + this.selectSentence + " FROM " + this.fromSentence;
    if (this.whereSentence) {
      queryString +=" WHERE " + this.whereSentence;
    }
    if (this.groupBySentence) {
      queryString +=" GROUP BY " + this.groupBySentence;
    }

    console.log(queryString);
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
    queryJson.tables = this.getTablesColumn();
    queryJson.tables = queryJson.tables.concat(this.deletedTables);
    queryJson.arguments = this.selectconcat.arguments;
    queryJson.arguments = queryJson.arguments.concat(this.deletedArguments);
    queryJson.whereclause = this.whereSentence;
    queryJson.query = this.getQueryString();
    queryJson.method = this.selectconcat.method;
    queryJson.description = this.selectconcat.description;
    queryJson.pageSize = this.selectconcat.pageSize;
    console.log(queryJson);
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
        if (columnsItem.selected || columnsItem.groupByBool) {
          let columnToAdd = new Columns();
          if (columnsItem.id) {
            columnToAdd.id = columnsItem.id;
          } else {
            columnToAdd.id = null;
          }
          columnToAdd.name = columnsItem.name;
          columnToAdd.typePresentation = columnsItem.typePresentation;
          console.log(columnsItem);
          console.log(columnToAdd);
          columnToAdd.selectedResult = columnsItem.selectedResult;
          console.log(columnsItem.selectedResult);
          console.log(columnToAdd.selectedResult);
          console.log(columnToAdd);
          if (columnsItem.groupByBool) {
            columnToAdd.groupBy = "1";
          } else {
            columnToAdd.groupBy = "0";
          }
          if (columnsItem.typePresentation == "value") {
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
              columnToAdd.functions.push(agr);
            }
            if (columnsItem.functionsAux.std == true) {
              let agr = new AggregateFucntions();
              agr.alias = columnsItem.functionsAux.aliasStd;
              agr.function = "STD";
              agr.selected = true;
              agr.label = "Std";
              columnToAdd.functions.push(agr);
            }
            if (columnsItem.functionsAux.min == true) {
              let agr = new AggregateFucntions();
              agr.alias = columnsItem.functionsAux.aliasMin;
              agr.function = "MIN";
              agr.selected = true;
              agr.label = "Min";
              columnToAdd.functions.push(agr);
            }
            if (columnsItem.functionsAux.max == true) {
              let agr = new AggregateFucntions();
              agr.alias = columnsItem.functionsAux.aliasMax;
              agr.function = "MAX";
              agr.selected = true;
              agr.label = "Max";
              columnToAdd.functions.push(agr);
            }
            if (columnsItem.functionsAux.avg == true) {
              let agr = new AggregateFucntions();
              agr.alias = columnsItem.functionsAux.aliasAvg;
              agr.function = "AVG";
              agr.selected = true;
              agr.label = "Avg";
              columnToAdd.functions.push(agr);
            }
            if (columnsItem.functionsAux.count == true) {
              let agr = new AggregateFucntions();
              agr.alias = columnsItem.functionsAux.aliasCount;
              agr.function = "COUNT";
              agr.selected = true;
              agr.label = "Count";
              columnToAdd.functions.push(agr);
            }
            table.columns.push(columnToAdd);
          }
        }
        if(!columnsItem.selected && !columnsItem.groupByBool && columnsItem.id){
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
    console.log(this.selectconcat);
  }
  getDataQueryInit() {
    this.selectconcat.arguments = this.selectEdit.arguments;
    this.selectconcat.name = this.selectEdit.name;
    this.selectconcat.id = this.selectEdit.id;
    this.selectconcat.pageSize = this.selectEdit.pageSize;
    this.selectconcat.method = this.selectEdit.method;
    this.selectconcat.description = this.selectEdit.description;
    this.whereSentence = this.selectEdit.whereclause;
    for (let i = 0; i < this.tables.length; i++) {
      for (let j = 0; j < this.selectEdit.tables.length; j++) {
        if (this.tables[i].name == this.selectEdit.tables[j].name) {
          this.tables[i].id = this.selectEdit.tables[j].id;
          this.tables[i].selected = true;
          this.tables[i].alias = this.selectEdit.tables[j].alias;
          this.selectTables.tables.push(this.tables[i]);
          this.selectconcat.tables.push(this.tables[i]);
          console.log("ASI VAaaa");
          console.log(this.selectconcat);
          for (let k = 0; k < this.tables[i].columns.length; k++) {
            for (let m = 0; m < this.selectEdit.tables[j].columns.length; m++) {
              if (
                this.tables[i].columns[k].name ==
                this.selectEdit.tables[j].columns[m].name
              ) {
                console.log("COINCIDEn");
                console.log(this.tables[i].columns[k].name);
                console.log(this.selectEdit.tables[j].columns[m].name);
                let columnsToAdd = this.tables[i].columns[k];
                let columnsOrigin = this.selectEdit.tables[j].columns[m];
                columnsToAdd.id = columnsOrigin.id;
                columnsToAdd.selectedResult = columnsOrigin.selectedResult;
                columnsToAdd.functionsAux = new Functions();
                columnsToAdd.functions = columnsOrigin.functions;
                columnsToAdd.groupBy = columnsOrigin.groupBy;
                if (columnsToAdd.groupBy == "1") {
                  columnsToAdd.groupByBool = true;
                  this.groupBySelected.push(columnsToAdd);
                } else {
                  columnsToAdd.groupByBool = false;
                }
                columnsToAdd.selected = true;
                columnsToAdd.typePresentation = columnsOrigin.typePresentation;
                if (columnsToAdd.typePresentation == "aggregate") {
                  for (let n = 0; n < columnsToAdd.functions.length; n++) {
                    if (columnsToAdd.functions[n].function == "SUM") {
                      columnsToAdd.functionsAux.sum = true;
                      columnsToAdd.functionsAux.aliasSum =
                        columnsToAdd.functions[n].alias;
                    }
                    if (columnsToAdd.functions[n].function == "MAX") {
                      columnsToAdd.functionsAux.max = true;
                      columnsToAdd.functionsAux.aliasSum =
                        columnsToAdd.functions[n].alias;
                    }
                    if (columnsToAdd.functions[n].function == "MIN") {
                      columnsToAdd.functionsAux.min = true;
                      columnsToAdd.functionsAux.aliasSum =
                        columnsToAdd.functions[n].alias;
                    }
                    if (columnsToAdd.functions[n].function == "AVG") {
                      columnsToAdd.functionsAux.avg = true;
                      columnsToAdd.functionsAux.aliasSum =
                        columnsToAdd.functions[n].alias;
                    }
                    if (columnsToAdd.functions[n].function == "COUNT") {
                      columnsToAdd.functionsAux.count = true;
                      columnsToAdd.functionsAux.aliasSum =
                        columnsToAdd.functions[n].alias;
                    }
                    if (columnsToAdd.functions[n].function == "STD") {
                      columnsToAdd.functionsAux.std = true;
                      columnsToAdd.functionsAux.aliasSum =
                        columnsToAdd.functions[n].alias;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    this.tableSelected = this.selectconcat.tables[0];
    console.log("QUEDA ASI: ------");
    console.log(this.selectconcat);
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
  addGroupBy(table, column) {
    let columnAdd = column;
    console.log(columnAdd);
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
    console.log(this.selectconcat.tables);
  }

  addFunction(item, ag) {}

  addColumn(column) {
    if (column.selected) {
      column.selectedResult = '1';
      console.log(column);
      console.log(this.selectconcat);
    }else{
      column.selectedResult = '0';
      console.log('en 0')
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
          table.alias
            ? (valueAux = table.alias + "." + column.name)
            : (valueAux = column.name);
          group.push(valueAux);
        }
        if (column.selected) {
          let valueAux;
          table.alias
            ? (valueAux = table.alias + "." + column.name)
            : (valueAux = column.name);
          if (column.typePresentation == "value") {
            let value = valueAux;
            selected.push(value);
          } else {
            if (column.typePresentation == "aggregate") {
              let value;
              if (column.functionsAux.max) {
                value = "MAX(" + valueAux + ") " + column.functionsAux.aliasMax;
                selected.push(value);
              }
              if (column.functionsAux.min) {
                value = "MIN(" + valueAux + ") " + column.functionsAux.aliasMin;
                selected.push(value);
              }
              if (column.functionsAux.sum) {
                value = "SUM(" + valueAux + ") " + column.functionsAux.aliasSum;
                selected.push(value);
              }
              if (column.functionsAux.avg) {
                value = "AVG(" + valueAux + ") " + column.functionsAux.aliasAvg;
                selected.push(value);
              }
              if (column.functionsAux.std) {
                value =
                  "STDDEV(" + valueAux + ") " + column.functionsAux.aliasStd;
                selected.push(value);
              }
              if (column.functionsAux.count) {
                value =
                  "COUNT(" + valueAux + ") " + column.functionsAux.aliasCount;
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

  deleteFromSelectView(view) {
    let index = this.selectViews.tables.findIndex(d => d === view);
    let indexConcat = this.selectconcat.tables.findIndex(d => d === view);
    view.delete = true;
    this.deletedTables.push(view);
    this.selectViews.tables.splice(index, 1);
    this.selectconcat.tables.splice(indexConcat, 1);
    view.selected = false;
  }

  deleteArgument(arg) {
    let index = this.selectconcat.arguments.findIndex(d => d === arg);
    arg.delete = true;
    this.deletedArguments.push(arg);
    this.selectconcat.arguments.splice(index, 1);
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
    }
  }

  options = {
    lineNumbers: true,
    lineWrapping: true,
    theme: "material",
    mode: { name: "text/x-mariadb" },
    lineSeparator: "string"
  };

  cursorPos: { line: number; ch: number } = { line: 0, ch: 0 };
  cursorMoved() {
    this.cursorPos = (this.codeEditor.codeMirror as any).getCursor();
  }

  addNewArgument() {
    let argument = new QueryArgument();
    console.log(argument);
    this.selectconcat.arguments.push(argument);
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
    console.log(data);
    if (data) {
      _this.configurationForm.get("nameValidator").setErrors({ exists: data });
      console.log("exists");
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
}
