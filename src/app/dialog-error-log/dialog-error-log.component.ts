import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-dialog-error-log',
  templateUrl: './dialog-error-log.component.html',
  styleUrls: ['./dialog-error-log.component.css']
})
export class DialogErrorLogComponent implements OnInit {
  dataError: any;
  message: string;
 
  constructor(
    public globals: Globals, public dialogRef: MatDialogRef<DialogErrorLogComponent>,
    @Inject(MAT_DIALOG_DATA) data) { 
    this.dataError = data;
  }

  ngOnInit() {
  }

  
  onNoClick(): void {
    this.globals.DialogClose=true;
    this.dialogRef.close();
  }

}
