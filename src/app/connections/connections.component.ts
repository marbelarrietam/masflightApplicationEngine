import { ConnectionQuery } from '../model/connection'
import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { MatTableDataSource } from '@angular/material';
import { FormControl, Validators,ValidatorFn, ValidationErrors, AbstractControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.css']
})
export class ConnectionsComponent implements OnInit {
  dataSource;
  connections;
  optionSelected = new ConnectionQuery();
  optionOver;
  databases:any[];
  innerHeight: number;
connectionForm = new FormGroup({
  hostValidator:new FormControl('host', [Validators.required]),
  usernameValidator:new FormControl('username', [Validators.required]),
  passwordValidator:new FormControl('password', [Validators.required]),
  schemaValidator:new FormControl('schema', [Validators.required]),
  portValidator:new FormControl('port', [Validators.required]),
});
  constructor(
    private router: Router,
    public globals: Globals,
    private service: ApplicationService) { }


  displayedColumns = ['columnHost', 'columnUsername', 'columnSchema'];

  ngOnInit() {
    this.innerHeight = window.innerHeight;
    this.getConnections();
    this.getDatabases();
  }


  handlerSuccessGet(_this, data){
     _this.connections = data;
     _this.dataSource = new MatTableDataSource(_this.connections);
     _this.globals.isLoading = false;
  }

  handlerDatabases(_this, data){
     _this.databases = data;
     _this.globals.isLoading = false;

  }
  errorHandler(_this, error){
    console.log(error);
    _this.globals.isLoading = false;
  }

  getDatabases(){
    this.service.getDatabases(this, this.handlerDatabases, this.errorHandler);
  }
  getConnections(){
    this.service.getConnections(this, this.handlerSuccessGet, this.errorHandler);
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  save(){
    if(this.connectionForm.valid){
      console.log("saved");
    }
  }
  cancelAndClean(){
    this.optionSelected =  new ConnectionQuery();
  }

  selectRow(row){
    this.optionSelected = row;
  }

  overRow(row){
    this.optionOver = row;
  }


  getErrorHostMessage() {
    return this.connectionForm.get('hostValidator').hasError('required') ? 'Host is required' : '';
  }

  getErrorUsernameMessage() {
    return this.connectionForm.get('usernameValidator').hasError('required') ? 'Username is required' : '';
  }

  getErrorPasswordMessage() {
    return this.connectionForm.get('passwordValidator').hasError('required') ? 'Password is required' : '';
  }

  getErrorSchemaMessage() {
    return this.connectionForm.get('schemaValidator').hasError('required') ? 'Schema is required' :'';
  }

  getErrorPortMessage() {
    return this.connectionForm.get('portValidator').hasError('required') ? 'Port is required' : '';
  }

  @HostListener('window:resize', ['$event'])
  checkScreen(event): void
  {
    this.innerHeight = event.target.innerHeight;
  }

  getInnerHeight(): number
  {
    return this.innerHeight;
  }
}
