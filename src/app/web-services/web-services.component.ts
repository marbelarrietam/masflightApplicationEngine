import {
  Component,
  OnInit,
  ViewEncapsulation,
  Pipe,
  NgModule,
  ViewChild
} from "@angular/core";
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
        (this.selectconcat.arguments[i]['label']== null) ||
        (this.selectconcat.arguments[i]['label'] == "")
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
      if (argumentsVerification){
      this.service.saveWebServices(this, this.createQueryJson(), this.handlerSuccessWS, this.handlerErrorSave);
      }else{
        const dialogRef = this.dialog.open(MessageComponent, {
          data: { title: "Error", message: "You have missing some arguments names, please check" }
        });
      }
    }else{
      const dialogRef = this.dialog.open(MessageComponent, {
        data: { title: "Error", message: "You have missing some configurations, please check" }
      });
    }
  }

  handlerSuccessWS(_this) {
    console.log("success");
    const dialogRef = _this.dialog.open(MessageComponent, {
      data: { title: "Success", message: "Web service was created" }
    });
    _this.globals.isLoading = false;
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
    if (this.groupBySentence) {
      +" WHERE " + this.whereSentence;
    }
    if (this.groupBySentence) {
      +" GROUP BY " + this.groupBySentence;
    }

    return queryString;
  }

  createQueryJson() {
    let queryJson = new QueryWS();
    queryJson.name = this.selectconcat.name;
    queryJson.tables = this.getTablesColumn();
    queryJson.arguments = this.selectconcat.arguments;
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
      table.name = this.selectconcat.tables[i].name;
      this.selectconcat.tables[i].alias
        ? (table.alias = this.selectconcat.tables[i].alias)
        : null;
      table.type = this.selectconcat.tables[i].type;

      for (let j = 0; j < this.selectconcat.tables[i].columns.length; j++) {
        let columnsItem = this.selectconcat.tables[i].columns[j];
        if (columnsItem.selected || columnsItem.groupBy) {
          let columnToAdd = new Columns();
          columnToAdd.name = columnsItem.name;
          columnToAdd.typePresentation = columnsItem.typePresentation;
          if (columnsItem.groupBy) {
            columnToAdd.groupBy = 1;
          } else {
            columnToAdd.groupBy = 0;
          }
          if (columnsItem.typePresentation == "value") {
            columnToAdd.typePresentation = columnsItem.typePresentation;
            table.columns.push(columnToAdd);
          } else if (columnsItem.typePresentation == "aggregate") {
            columnToAdd.typePresentation = columnsItem.typePresentation;
            if (columnsItem.functions.sum) {
              columnToAdd.aggregationFunction += "SUM, ";
            }
            if (columnsItem.functions.std) {
              columnToAdd.aggregationFunction += "STD, ";
            }
            if (columnsItem.functions.min) {
              columnToAdd.aggregationFunction += "MIN, ";
            }
            if (columnsItem.functions.max) {
              columnToAdd.aggregationFunction += "MAX, ";
            }
            if (columnsItem.functions.avg) {
              columnToAdd.aggregationFunction += "AVG, ";
            }
            if (columnsItem.functions.count) {
              columnToAdd.aggregationFunction += "COUNT";
            }
            table.columns.push(columnToAdd);
          }
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
    _this.globals.isLoading = false;
  }

  handlerError(_this, result) {
    console.log(result);
    _this.globals.isLoading = false;
  }
  goHome() {
    this.router.navigate(["/welcome"]);
  }

  addTable(table) {
    if (table.selected) {
      this.selectTables.tables.push(table);
      this.selectconcat.tables.push(table);
    } else {
      let index = this.selectTables.tables.findIndex(d => d === table);
      let indexConcat = this.selectconcat.tables.findIndex(d => d === table);
      if (index >= 0 && indexConcat >= 0) {
        this.selectTables.tables.splice(index, 1);
        this.selectconcat.tables.splice(indexConcat, 1);
      }
    }
    this.tableSelected = this.selectconcat.tables[0];
  }
  addGroupBy(table, column) {
    let columnAdd = column;
    console.log(columnAdd);
    if (column.groupBy) {
      this.groupBySelected.push(columnAdd);
    } else {
      let index = this.groupBySelected.findIndex(d => d === columnAdd);
      this.groupBySelected.splice(index, 1);
    }
  }

  addFunction(event) {
    console.log(this.tableSelected);
  }

  addColumn(column) {
    if (column.selected) {
    }
  }

  deleteFromSelectTable(table) {
    let index = this.selectTables.tables.findIndex(d => d === table);
    let indexConcat = this.selectconcat.tables.findIndex(d => d === table);
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
        if (column.groupBy) {
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
              if (column.functions.max) {
                value = "MAX(" + valueAux + ")";
                selected.push(value);
              }
              if (column.functions.min) {
                value = "MIN(" + valueAux + ")";
                selected.push(value);
              }
              if (column.functions.sum) {
                value = "SUM(" + valueAux + ")";
                selected.push(value);
              }
              if (column.functions.avg) {
                value = "AVG(" + valueAux + ")";
                selected.push(value);
              }
              if (column.functions.std) {
                value = "STDDEV(" + valueAux + ")";
                selected.push(value);
              }
              if (column.functions.count) {
                value = "COUNT(" + valueAux + ")";
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
    this.selectViews.tables.splice(index, 1);
    this.selectconcat.tables.splice(indexConcat, 1);
    view.selected = false;
  }

  deleteArgument(arg) {
    let index = this.selectconcat.arguments.findIndex(d => d === arg);
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
      item.functions = new Functions();
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
