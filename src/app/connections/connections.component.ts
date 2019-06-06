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
  connToDelete;
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


  displayedColumns = ['columnHost', 'columnUsername', 'columnSchema','columnAction'];

  ngOnInit() {
    this.innerHeight = window.innerHeight;

    this.getDatabases();
  }


  handlerSuccessGet(_this, data){
     _this.connections = data;
     _this.dataSource = new MatTableDataSource(_this.connections);
     _this.globals.isLoading = false;
  }

  handlerDatabases(_this, data){
     _this.databases = data;
     _this.getConnections();

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
    console.log(this.optionSelected);
    this.optionSelected.host = this.connectionForm.get ('hostValidator').value;
    this.optionSelected.username = this.connectionForm.get ('usernameValidator').value;
    this.optionSelected.password = this.connectionForm.get ('passwordValidator').value;
    this.optionSelected.nameSchema = this.connectionForm.get ('schemaValidator').value;
    this.optionSelected.port = this.connectionForm.get ('portValidator').value;
    console.log(this.optionSelected);
    if(this.connectionForm.valid){
      // this.service.testConnections(this, this.optionSelected, this.handlerTestConn, this.errorHandlerTest);
      this.service.saveConnections(this, this.optionSelected, this.handlerNewConn, this.errorHandler);
    }
  }

  handlerTestConn(_this, data){
    this.service.saveConnections(_this, data, _this.handlerNewConn, _this.errorHandler);
  }

  errorHandlerTest(_this, error){
    console.log(error);
  }

  handlerNewConn(_this, data){
    _this.connections = data;
    _this.dataSource = new MatTableDataSource(_this.connections);
  }

  cancelAndClean(){
    this.optionSelected =  new ConnectionQuery();
  }

  deleteConnection(){
      this.connToDelete = this.optionSelected;
      let id = this.connToDelete.id;
      console.log(this.connToDelete);
      this.service.deleteConnection(this, id, this.handleSuccessDelete, this.errorHandler);

  }

  handleSuccessDelete(_this, data){
    let index = _this.connections.findIndex(d => d === _this.connToDelete);
    _this.connections.splice(index, 1);
    _this.dataSource = new MatTableDataSource(_this.connections);
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
      this.cancelAndClean()
    }else{
      this.optionSelected = row;
      this.optionOver = null;
    }
  }
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
