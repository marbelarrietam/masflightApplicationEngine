import { BrowserModule } from '@angular/platform-browser';
import { NgModule} from '@angular/core';
import { AppComponent } from './app.component';
import { LoginScreenComponent } from './login-screen/login-screen.component';
import { AppRoutingModule } from './routing/app.routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import {MaterialModule} from './material/material';
import { MessageComponent } from './message/message.component';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AuthService} from './services/auth.service';
import {HttpClientModule} from '@angular/common/http';
import { NotificationComponent } from './notification/notification.component';
import { ApiClient } from './api/api-client';
import {NgxMaskModule} from 'ngx-mask'
import { NgSelectModule } from '@ng-select/ng-select';
import { ApplicationComponent } from './application/application.component';
import {Globals} from './globals/Globals';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { MatFormFieldModule, MatSelectModule, MatChipsModule } from '@angular/material';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { IntroComponent } from './intro/intro.component';
import { CurrentQuerySummaryComponent } from './current-query-summary/current-query-summary.component';
import { DateFormatPipe } from './commons/DateFormatPipe ';
import { DateTimeFormatPipe } from './commons/DateTimeFormatPipe'
import { AmChartsModule } from '@amcharts/amcharts3-angular';
import { jqxGridComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxgrid';
import { jqxTreeGridComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxtreegrid';
import { jqxBarGaugeComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxbargauge';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import {MatSnackBarModule} from '@angular/material';
import { MsfLoadingComponent } from './msf-loading/msf-loading.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material';
import { AgGridModule } from 'ag-grid-angular';
import { Utils } from './commons/utils';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ColorPickerModule } from 'ngx-color-picker';
import { WebServicesComponent } from './web-services/web-services.component';
import { WebServicesCopyComponent } from './web-services-copy/web-services-copy.component';
import { FilterPipe } from './web-services/pipe-filter';
import { FilterPipeCopy } from './web-services-copy/pipe-filter-copy';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { AllWebServicesComponent } from './all-web-services/all-web-services.component';
import { TestComponent } from './test/test.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { DialogErrorLogComponent } from './dialog-error-log/dialog-error-log.component';
import { ConnectionsComponent } from './connections/connections.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginScreenComponent,
    WebServicesCopyComponent,
    FilterPipeCopy,
    WebServicesComponent,
    FilterPipe,
    MessageComponent,
    NotificationComponent,
    ApplicationComponent,
    IntroComponent,
    CurrentQuerySummaryComponent,
    DateFormatPipe,
    DateTimeFormatPipe,
    jqxBarGaugeComponent,
    jqxGridComponent,
    jqxTreeGridComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    MsfLoadingComponent,
    AllWebServicesComponent,
    TestComponent,
    DialogErrorLogComponent,
    ConnectionsComponent
  ],
  imports: [
    BrowserModule,
    DragDropModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatChipsModule,
    LayoutModule,
    MaterialModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
    NgSelectModule,
    NgxJsonViewerModule,
    NgxMaterialTimepickerModule.forRoot(),
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatFormFieldModule,
    NgxMatSelectSearchModule,
    AmChartsModule,
    CodemirrorModule,
    NgxMapboxGLModule.withConfig({
      accessToken: 'pk.eyJ1IjoiYXNwc29sdXRpb25zIiwiYSI6ImNqbm5uNGhscTI4N28za3FybnJ0OWF6NmEifQ.pDzlIgQjVkVszvxF2UoXvA',
      geocoderAccessToken: 'pk.eyJ1IjoiYXNwc29sdXRpb25zIiwiYSI6ImNqbm5uNGhscTI4N28za3FybnJ0OWF6NmEifQ.pDzlIgQjVkVszvxF2UoXvA'
    }),
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    AgGridModule.withComponents(null),
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ColorPickerModule
  ],
  providers: [
    AuthService,
    NotificationComponent,
    ApiClient,
    Globals,
    DateFormatPipe,
    DateTimeFormatPipe,
    Utils
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    MessageComponent,
    DialogErrorLogComponent]
})
export class AppModule { }
