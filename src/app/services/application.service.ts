import { Injectable } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { Utils } from '../commons/utils';
import { Observable, of } from 'rxjs';
import { Airport } from '../model/Airport';
import { delay } from 'rxjs/operators';
import { Globals } from '../globals/Globals';

import { MatDialog } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {


  utils: Utils;

  host = "http://localhost:8889";
  //host = "";

  //host1 = "http://localhost:8886";
  host1 = "http://69.64.45.220:8886";

  host2 = "http://staging.pulse.aspsols.com";
  constructor(private http: ApiClient, private globals:Globals, private dialog: MatDialog) {
    this.utils = new Utils();
    this.host = this.globals.baseUrl;
    this.host1 = this.globals.baseUrl2;
  }

  checkWSName(_this,successHandler,errorHandler,name){
    let url= this.globals.baseUrl+'/checkName?name='+name;
    // let url='http://localhost:8887/checkEmail?email='+email;
    this.http.get(_this,url,successHandler,errorHandler,null);
  }


  getTracking(_this, successHandler, errorHandler) {
    let params = this.utils.getUrlParameters(_this.globals.currentOption);
    let url = this.host1 + "/getTracking?" + params.url;
    this.http.get(_this, url, successHandler, errorHandler, null);
  }


  getMapBoxTracking(_this, successHandler, errorHandler) {
    let params = this.utils.getUrlParameters(_this.globals.currentOption);
    let url = this.host1 + "/getMapBoxTracking?" + params.url;
    this.http.get(_this, url, successHandler, errorHandler, null);
  }

  getDataTableSource(_this, handlerSuccess, handlerError,pageNumber: String) {
    // _this.globals.isLoading = true;
    _this.displayedColumns = [];
    let param = this.utils.getUrlParameters(_this.globals.currentOption);
    let urlBase = param.url;
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=100&page_number="+pageNumber;
    if(pageNumber=="0"){
      _this.dataSource = null;
    }
    console.log(urlBase);
    let urlArg = encodeURIComponent(urlBase);
    let url = this.host + "/consumeWebServices?url=" + urlArg + "&optionId=" + _this.globals.currentOption.id;
    this.http.get(_this, url, handlerSuccess, handlerError, null);
    console.log(url);
  }

  loadChartData(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    let param = this.utils.getUrlParameters(_this.globals.currentOption);
    let urlBase = param.url;
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
    console.log(urlBase);
    let urlArg = encodeURIComponent(urlBase);
    let url = this.host + "/getChartData?url=" + urlArg + "&variable=" + _this.variable.id + "&xaxis=" + _this.xaxis.id + "&valueColumn=" + _this.valueColumn.id + "&function=" + _this.function.id;
    this.http.post(_this, url, null, handlerSuccess, handlerError);
  }


  loadDynamicTableData(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    _this.columns = [];

    _this.jqxTreeGridRef.clear();
    let param = this.utils.getUrlParameters(_this.globals.currentOption);
    let urlBase = param.url;
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999&page_number=0";
    console.log(urlBase);
    let urlArg = encodeURIComponent(urlBase);
    let url = this.host + "/getDynamicTableData?url=" + urlArg;
    let data = { variables: _this.globals.variables, values: _this.globals.values };
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  loadMenuOptions(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    if(_this.globals.currentApplication == undefined){
      _this.globals.currentApplication = JSON.parse(localStorage.getItem("currentApplication"));
    }
    let url = this.host + "/getMenuTree?appId=" + _this.globals.currentApplication.id;
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  loadAllUsers(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    if(_this.globals.currentApplication == undefined){
      _this.globals.currentApplication = JSON.parse(localStorage.getItem("currentApplication"));
    }
    let url = this.host + "/getAllUsers";
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }
/*
  createMenucategory(_this, data, handlerSuccess, handlerError) {
    let url = this.host + "/menuTreeCategory";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  createMenuOption(_this, data, handlerSuccess, handlerError) {
    let url = this.host + "/menuTreeOption";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }
  */

  loadOptionCategoryArguments(_this, data, handlerSuccess, handlerError) {
    //_this.globals.isLoading = true;
    let url = this.host + "/getOptionArgumentsCategories?optionId=" + data.id;
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  loadWebservicMeta(_this,data,handlerSuccess, handlerError) {
    let url = this.host+"/getMetaByOptionId?optionId=" + data.id;
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }
  loadArguments(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    let url = this.host + "/getArguments";
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  loadAdvanceFeatures(_this, handlerSuccess, handlerError) {
    let url = this.host + "/getAdvanceFeatures";
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  loadCategoryArguments(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    let url = this.host + "/getArgumentsCategories";
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  loadPlanOptions(_this, data, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    let url = this.host + "/getOptionsPlan?plan="+data+"&application="+_this.globals.currentApplication.id;
    // let url = this.host + "/getOptionsPlan?plan="+data+"&application=4";
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }


  createArgument(_this, data, handlerSuccess, handlerError) {
    let url = this.host +  "/arguments?idOption=" + data.idOption;
    this.http.post(_this, url, data.argument, handlerSuccess, handlerError);
  }

  loadMenuCategories(_this, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/getMenu";
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  saveMenu(_this, data, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/menu";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  saveMeta(_this, data, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/saveWebServieMeta";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  saveOptionCategoryArguments(_this, data, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/saveOptionArgumentsCategories";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  loadArgumentsByCategory(_this, data, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/getArgumentsByCategory?idCategory=" + data.id;
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  saveArgumentsCategory(_this, data, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/saveArgumentsCategory";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  saveArguments(_this, data, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/saveArguments";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  deleteArgumentsCategory(_this, data, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/deleteArgumentsCategory";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  deleteArguments(_this, data, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/deleteArguments";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  loadChartDataUsageStatistics(_this, handlerSuccess, handlerError) {
    _this.globals.isLoading = true;
    let params = this.utils.getParameters(_this.globals.currentOption);
    params += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=999999";
    console.log(params);
    let url = this.host + "/getChartDataUsageStatistics?variable=" + _this.variable.id + "&xaxis=" + _this.xaxis.id + "&valueColumn=" + _this.valueColumn.id + "&function=" + _this.function.id + "&" +params+ "&optionId=" + _this.globals.currentOption.id;;
    this.http.get(_this, url, handlerSuccess, handlerError, null);
  }

  getDataTableSourceUsageStatistics(_this, handlerSuccess, handlerError) {
    _this.dataSource = null;
    _this.displayedColumns = [];
    _this.globals.isLoading = true;
    let param = this.utils.getUrlParameters(_this.globals.currentOption);
    let urlBase = param.url;
    urlBase += "&MIN_VALUE=0&MAX_VALUE=999&minuteunit=m&pageSize=100";
    console.log(urlBase);
    let urlArg = encodeURIComponent(urlBase);
    urlBase += "&optionId=" + _this.globals.currentOption.id;
    this.http.get(_this, urlBase, handlerSuccess, handlerError, null);
  }

  getMenuString(_this, applicationId, handlerSuccess, handlerError): void
  {
    let url = this.host + "/getMenuString?appId=" + applicationId;
    this.http.get (_this, url, handlerSuccess, handlerError, null);
  }

  getChartFilterValues(_this, id, handlerSuccess, handlerError): void
  {
    let url = this.host + "/getMetaByOptionId?optionId=" + id;
    this.http.get (_this, url, handlerSuccess, handlerError, null);
  }

  createDashboardPanel(_this, panels, handlerSuccess, handlerError): void
  {
    let url = "/addDashboardPanels";
    if (this.host != "")
      this.http.post (_this, this.host + url, panels, handlerSuccess, handlerError);
    else
      this.http.postSecure (_this, this.host + "/secure" + url, panels, handlerSuccess, handlerError);
  }

  createDashboardPanelInColumn(_this, panels, width, handlerSuccess, handlerError): void
  {
    let url = "/addDashboardPanels/column?width=" + width;
    if (this.host != "")
      this.http.post (_this, this.host + url, panels, handlerSuccess, handlerError);
    else
      this.http.postSecure (_this, this.host + "/secure" + url, panels, handlerSuccess, handlerError);
  }

  deleteDashboardPanel(_this, id, width, handlerSuccess, handlerError): void
  {
    let url = this.host + "/deleteDashboardPanel?width=" + width;
    this.http.post (_this, url, id, handlerSuccess, handlerError);
  }

  deleteDashboardColumn(_this, appId, column, handlerSuccess, handlerError): void
  {
    let url = "/updateDashboardPanelColumns?appId=" + appId + "&column=" + column;
    if (this.host != "")
      this.http.post (_this, this.host + url, null, handlerSuccess, handlerError);
    else
      this.http.postSecure (_this, this.host + "/secure" + url, null, handlerSuccess, handlerError);
  }

  getDashboardPanels(_this, appId, handlerSuccess, handlerError): void
  {
    let url = "/getDashboardPanels?appId=" + appId;
    if (this.host != "")
      this.http.get (_this, this.host + url, handlerSuccess, handlerError, null);
    else
      this.http.getSecure (_this, this.host + "/secure" + url, handlerSuccess, handlerError, null);
  }

  updateDashboardPanel(_this, panel, handlerSucess, handlerError): void
  {
    let url = this.host + "/updateDashboardPanel";
    this.http.post (_this, url, panel, handlerSucess, handlerError);
  }

  updateDashboardPanelHeight(_this, dashboardIds, height, handlerSucess, handlerError): void
  {
    let url = this.host + "/updateDashboardPanelHeight?height=" + height;
    this.http.post (_this, url, dashboardIds, handlerSucess, handlerError);
  }

  updateDashboardPanelWidth(_this, dashboardIds, handlerSucess, handlerError): void
  {
    let url = this.host + "/updateDashboardPanelWidth";
    this.http.post (_this, url, dashboardIds, handlerSucess, handlerError);
  }

  getMetaDataTables(_this, handlerSucess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/getMetaDataTables";
    this.http.get(_this, url, handlerSucess, handlerError, null);
  }

  getsetSteps(_this,data,check,handlerSucess,handlerError){
      _this.globals.isLoading = true;
      let url = this.host + "/setSteps?query="+data+"&checkColumns="+check;
      this.http.get(_this, url, handlerSucess, handlerError, null);

  }

  getWebServices(_this, handlerSucess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/getWebServices";
    this.http.get(_this, url, handlerSucess, handlerError, null);
  }

  getConnections(_this, handlerSucess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/getConnections";
    this.http.get(_this, url, handlerSucess, handlerError, null);
  }

  getDatabases(_this, handlerSucess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/getDatabases";
    this.http.get(_this, url, handlerSucess, handlerError, null);
  }


  saveWebServices(_this, data, handlerSuccess, handlerError){
    _this.globals.isLoading = true;
    let url = this.host + "/saveWebServices";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }

  saveConnections(_this, data, handlerSuccess, handlerError){
    //_this.globals.isLoading = true;
    let url = this.host + "/saveConnections";
    this.http.post(_this, url, data, handlerSuccess, handlerError);
  }


  deleteWebServices(_this, id, handlerSuccess, handlerError){
    let url = this.host + "/deleteWebServices?id="+id;
    this.http.post(_this, url, id, handlerSuccess, handlerError);
  }

  deleteConnection(_this, id, handlerSuccess, handlerError){
    let url = this.host + "/deleteConnection?id="+id;
    this.http.post(_this, url, id, handlerSuccess, handlerError);
  }

  testWebService(_this, name, data, handlerSuccess, handlerError){
    let url = this.host + "/engineWebServices/"+name;
    this.globals.currentURL = url;
    this.http.post(_this,url,data,handlerSuccess,handlerError);
  }


  testWebServicesGet(_this, name, data, pageNumber, pageSize, handlerSuccess, handlerError){
    let urlString = this.host + "/engineWebServices/"+name+"?";
    for (let key in data){
      urlString = urlString + key + "=";
      urlString = urlString + data[key]+"&";
    }
    let url = urlString+"page_number="+pageNumber+"&pageSize="+pageSize;
    this.globals.currentURL = url;
    let url2 = url + "&testEngine=yes"
    this.http.get(_this,url,handlerSuccess,handlerError, null);
  }
}
