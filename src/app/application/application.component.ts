import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Menu } from '../model/Menu';
import { Option } from '../model/Option';
import {CategoryArguments} from '../model/CategoryArguments';
import { Globals } from '../globals/Globals';
import { Arguments } from '../model/Arguments';
import { MatDialog} from '@angular/material';
import { MenuService } from '../services/menu.service';
import { Router } from '@angular/router';
import {ExcelService} from '../services/excel.service';
import { PlanAdvanceFeatures } from '../model/PlanAdvanceFeatures';
import { User } from '../model/User';
import { WebServicesComponent } from '../web-services/web-services.component'



@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.css']
})
export class ApplicationComponent implements OnInit {

  isFullscreen: boolean;
  animal: string;
  name: string;
  chartPlan: boolean;
  dynamicTablePlan: boolean;
  exportExcelPlan: boolean;
  dashboardPlan: boolean;
  menu: Menu;
  planAdvanceFeatures: any[];
  status: boolean;
  user: any[];
  userName : any;

  admin: boolean = false;
  ELEMENT_DATA: any[];
  //displayedColumns: string[] = [];
  variables;


  constructor(public dialog: MatDialog, public globals: Globals, private service: MenuService,private router: Router,private excelService:ExcelService) {
    this.status = false;
  }

  ngOnInit() {
    this.globals.clearVariables();

  }


  validateAdmin(){
    this.service.getUserLoggedin(this, this.handleLogin, this.errorLogin);
  }

  handleLogin(_this,data){
    _this.user = data;
    _this.globals.currentUser = data.name;
    _this.userName = data.name;
    _this.admin = data.admin;
     _this.globals.isLoading = false;

    // if (_this.dashboardPlan)
    //  _this.goToDashboard ();
  }
  errorLogin(_this,result){
    console.log(result);
     _this.globals.isLoading = false;

    //  if (_this.dashboardPlan)
    //  _this.goToDashboard ();
  }




toggle(){
    this.status  = !this.status ;
    if(!this.status && this.globals.currentArgs){
      this.globals.currentArgs.open=false;
    }if(this.status && this.globals.currentArgs){
      this.globals.currentArgs.open=true;
    }

    this.globals.status  = !this.globals.status ;
    if(!this.globals.status && this.globals.currentArgs){
      this.globals.currentArgs.open=false;
    }if(this.globals.status && this.globals.currentArgs){
      this.globals.currentArgs.open=true;
    }
  }

  goHome(){
    this.router.navigate(["/welcome"]);
  }
  logOut(){
    window.localStorage.removeItem("token");
    this.router.navigate(['']);
  }

}
