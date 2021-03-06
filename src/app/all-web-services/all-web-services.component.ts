import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { ApplicationService } from "../services/application.service";
import { Globals } from "../globals/Globals";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-all-web-services',
  templateUrl: './all-web-services.component.html',
  styleUrls: ['./all-web-services.component.css']
})

export class AllWebServicesComponent implements OnInit {

  webServices: any[] = [];
  webServicesRouter: any[] = [];
  dataSource;
  tableString: string;
  dataFromService = '';
  optionOver;
  optionSelected;

  constructor(
    private router: Router,
    public globals: Globals,
    private service: ApplicationService) { }

  // displayedColumns = ['columnName', 'columnDescription', 'columnQuery', 'columnTables', 'columnEdit'];

  displayedColumns = ['columnName', 'columnDescription', 'columnQuery', 'columnTables']; //kp20190517


  getData(rowNum){
   this.dataFromService = rowNum;
  }

  ngOnInit() {
    this.getWebServices();
  }


  addWebService(){
    this.globals.currentURL = null;
    this.globals.currentWebService = null;
    this.globals.currentApplication = 'create';
  }
  getWebServices(){
    this.service.getWebServices(this, this.handlerSuccessWS, this.handlerError);
  }

  handlerError(_this, result){
    console.log(result);
    _this.globals.isLoading = false;
  }


  handlerSuccessWS(_this,data){
    _this.webServices = data;
    for (let i =0; i < _this.webServices.length; i++ ){
    _this.tableString = _this.stringTables(_this.webServices[i]);
    _this.webServices[i].stringTable = _this.tableString;
    }
    //  _this.dataSource = new MatTableDataSource(_this.webServices);
    // _this.globals.isLoading = false;
    _this.service.getRouters(_this, _this.handlerSuccessWSRouters, _this.handlerErrorRouters);
  }
  
  handlerSuccessWSRouters(_this,data){
    _this.webServicesRouter = data;
    for (let i =0; i < _this.webServicesRouter.length; i++ ){
      _this.webServices.push(_this.webServicesRouter[i])
    }
    _this.dataSource = new MatTableDataSource(_this.webServices);
    _this.globals.isLoading = false;
  }

  handlerErrorRouters(_this, result){
    console.log(result);
    _this.globals.isLoading = false;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  stringTables(data){
    let arrayTables: any[] = [];
    for (let i=0; i < data.tables.length; i++){
      arrayTables.push(data.tables[i].name);
    }

    return arrayTables.join(", ");
  }
  testWebService(element){
    if (element!=null){
    this.globals.currentWebService = element;
    this.globals.currentApplication = 'test';
    }
  }

  edit(element){
    console.log(element);
    if (element!=null){
    this.globals.currentWebService = element;
    this.globals.currentApplication = 'create';
    }

  }

  deleteWebServices(element){
    if (element!=null){
    this.globals.currentWebService = element;;
    let id = this.globals.currentWebService.id;
    this.service.deleteWebServices(this, id, this.handleSuccessDelete, this.handlerError);
    }
  }

  handleSuccessDelete(_this, data){
    let index = _this.webServices.findIndex(d => d === _this.globals.currentWebService);
    _this.webServices.splice(index, 1);
    _this.dataSource = new MatTableDataSource(_this.webServices);
    _this.optionOver = null;
    _this.optionSelected = null;
  }

  overRow(row){
      if(this.optionSelected != row){
        this.optionOver = row;
      }
  }

  selectRow(row){
    if(this.optionSelected==null){
      this.optionSelected = row;
      this.optionOver = null;
    }else{
      if(this.optionSelected == row){
        this.optionOver = this.optionSelected;
        this.optionSelected = null;
      }else{
        this.optionSelected = row;
        this.optionOver = null;
      }
    }
  }

  getBackground(option : any, name: any){
    if(option!=null){
      return "../assets/images/"+name+"White.png"
    }else{
      return "../assets/images/"+name+".png"
    }
  }

}
