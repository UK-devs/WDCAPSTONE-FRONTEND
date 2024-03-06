import { Component, Injectable, Output, EventEmitter } from '@angular/core';
import { Chart } from 'Chart.js/auto';
import { SharedDataService } from '../../services/shared-data.service'; 
import { InputService } from '../../services/input.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common'; 
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})

@Component({
  selector: 'app-visual-reports',
  templateUrl: './visual-reports.component.html',
  styleUrl: './visual-reports.component.scss'
})
export class VisualReportsComponent {

  dataString:any;
  currentDate: Date = new Date();
  auditTrailForm!:any;
  userId: string = "";
  role_name: string = "";


  data_line = [

    { x: 1, y: 10 },
    { x: 2, y: 20 },
    { x: 3, y: 35 },
    { x: 4, y: 50 },
    { x: 5, y: 100 },
    { x: 6, y: 125 }
    
  ];

  data_line_two = [

    { x: 1, y: 50 },
    { x: 2, y: 30 },
    { x: 3, y: 105 },
    { x: 4, y: 5 },
    { x: 5, y: 70 },
    { x: 6, y: 69 }
    
  ];

  public chartData_dps = [
    { label: 'In-Progress', value: 30 },
    { label: 'Done', value: 50 } 
  ];

  public chartData_overall_report = [
    { label: 'Accepted', value: 90 },
    { label: 'Rejected', value: 10 } 
  ];

  labels: string[] = ['SBA', 'SOC', 'SHTM', 'SNAMS', 'SED','CCJEF','SEA'];
  data: number[] = [50, 70, 40, 80, 60, 20, 90];

  constructor(private sharedDataService:SharedDataService,
    private fb: FormBuilder,
    private inputService: InputService,
    private router: Router,
    private datePipe: DatePipe) { 
    this.currentDate = new Date(); 
    
  }


  ngOnInit(){

    this.dataString = localStorage.getItem('localData');
    
    if(this.dataString){
      const jsonString = JSON.parse(this.dataString);   
      this.userId = jsonString._id;
      this.role_name = jsonString.role;
    }else{
      this.router.navigate(['/login']);
    }

    this.saveAuditTrailLog("View Visual Reports");

  const ctx = document.getElementById('barChart') as HTMLCanvasElement;   
  const ctx_dps = document.getElementById('pieChart-department-point-system') as HTMLCanvasElement;
  const ctx_overall_report = document.getElementById('pieChart-overall-report') as HTMLCanvasElement;
  const ctx_line_graph_projects = document.getElementById('lineGraph-projects') as HTMLCanvasElement;

  new Chart(ctx_dps, {
    type: 'pie',
    data: {
      labels: this.chartData_dps.map(d => d.label),
      datasets: [{
        backgroundColor: ['#700f1d', '#f9c20c'],
        data: this.chartData_dps.map(d => d.value)
      }]
    },
    options: {} // Add custom options as needed
  });

  new Chart(ctx_overall_report, {
    type: 'pie',
    data: {
      labels: this.chartData_overall_report.map(d => d.label),
      datasets: [{
        backgroundColor: ['#700f1d', '#f9c20c'],
        data: this.chartData_overall_report.map(d => d.value)
      }]
    },
    options: {} // Add custom options as needed
  });

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: this.labels,
      datasets: [{
        label: 'Sales',
        data: this.data,
        backgroundColor: ['#700f1d','#f9c20c'],
        borderColor: ['#700f1d','#f9c20c'],
        borderWidth: 1
      }]
    },
    
    options: {} // Add custom options as needed
    
  });

  
  new Chart(ctx_line_graph_projects,{
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar','Apr','May','June'], // Your x-axis labels
      datasets: [
        {
          label: 'Projects by Month',
          data: this.data_line, // line 1
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          // customization hereeeeeeee
        },
        {
          label: 'Projects by Month - Department',
          data: this.data_line_two, // line 2
          backgroundColor: 'rgba(225, 19, 132, 0.2)',
          borderColor: 'rgba(252, 29, 130, 1)',
          // customization hereeeeeeee for line 2
        }
      ]
    },
    // Additional options for scales, grid lines, tooltips, etc.
  });
  
  } // ngOnInit


  
  initializeAuditTrail(actionTaken:string) : void{
    
    this.auditTrailForm = this.fb.group({

      user_id: this.userId,     
      role: this.role_name,
      action_taken: actionTaken,
      action_date_time: new Date()      
    
    });

  }

  onRecordAuditTrailLogs(){

    this.inputService.createAuditTrailService(this.auditTrailForm.value).subscribe(
      (response) => {
        console.log('Data for Audit Trail Submitted Successfully:', response);      
      },
      (error) => {
        console.error('Error submitting form of Audit Trail:', error);
        // Handle error logic if needed
      }
    );

  }

  saveAuditTrailLog(actionString:string):void{
    this.initializeAuditTrail(actionString);
    this.onRecordAuditTrailLogs();
  }
  
 

}
