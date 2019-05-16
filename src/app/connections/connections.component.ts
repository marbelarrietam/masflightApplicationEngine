import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Globals } from '../globals/Globals';
import { ApplicationService } from '../services/application.service';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.css']
})
export class ConnectionsComponent implements OnInit {
  dataSource;
  connections;

  constructor(
    private router: Router,
    public globals: Globals,
    private service: ApplicationService) { }


  displayedColumns = ['columnHost', 'columnUsername', 'columnSchema'];

  ngOnInit() {
    this.getConnections();
  }

  handlerSuccessGet(_this, data){
     _this.connections = data;
     _this.dataSource = new MatTableDataSource(_this.connections);
    _this.globals.isLoading = false;
  }

  errorHandler(_this, error){
    console.log(error);
    _this.globals.isLoading = false;
  }
  getConnections(){
    this.service.getConnections(this, this.handlerSuccessGet, this.errorHandler);
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
