import { InputService } from '../../services/input.service';
import {
  Component,
  Inject,
  Injectable,
  Output,
  EventEmitter,
  NgZone,
} from '@angular/core';

import { CalendarOptions, Calendar, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
// import { Chart } from 'Chart.js';
import 'chart.js/auto';
import { SharedDataService } from '../../services/shared-data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe, DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

declare var require: any;
const Chart = require('chart.js/auto');
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  counter: number = 0;
  zone_data: any;

  dataString: any;
  intakeProposals: any;
  auditTrailForm!: any;
  currentDate: Date = new Date();
  month_year_now: Date = new Date();
  monthYearString: string = '';

  departmentNames: string[] = [
    'SBA',
    'SEA',
    'SAS',
    'SHTM',
    'SEd',
    'SNAMS',
    'SoC',
    'CCJEF',
    'BEd',
    'ICSFI',
  ];
  months_of_year: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  department_project_count: number[] = [];

  proposalIntakeForm!: any;
  proposalIntakesDisplay!: any;
  proposalData!: any;
  proposalDetailsEmployee!: any;

  proposal_approved!: any;
  proposal_done!: any;

  data_line = [{}];
  data_line_two = [{}];

  proposalDetails!: any;
  proposalDetailsDisplay!: any;
  proposal_action_plan_details!: any;
  proposalActionPlans!: any;
  userDetails!: any;
  userDetail!: any;

  user_fname: string = '';
  user_mname: string = '';
  user_lname: string = '';
  user_tenure: string = '';
  user_department: string = '';
  user_email: string = '';

  allUsers!: any;
  proposalDetailsFilterByCurrentUser!: any;
  proposalIntakeFilterByCurrentUser!: any;

  userId: string = '';
  roleName: string = '';

  done_projects_count: number = 0;
  approved_projects_count: number = 0;

  constructor(
    private sharedData: SharedDataService,
    private fb: FormBuilder,
    private inputService: InputService,
    private router: Router,
    private datepipe: DatePipe,
    private ngzone: NgZone,
    @Inject(DOCUMENT) private document: Document
  ) {} // constructor()

  public chartData_dps = [
    { label: 'In-Progress', value: 0 },
    { label: 'Done', value: 0 },
  ];

  labels: string[] = ['SBA', 'SOC', 'SHTM', 'SNAMS', 'SED', 'CCJEF', 'SEA'];
  data: number[] = [50, 70, 40, 80, 60, 20, 90];

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    events: [],
    headerToolbar: {
      left: '', // Display navigation buttons
      center: '',
      right: '', // Remove any default buttons on the right
    },
  };

  onViewAllIntakeRecords() {
    this.inputService
      .getIntakeFormService(this.router.url)
      .subscribe((data) => (this.intakeProposals = data));
  }

  ngOnInit() {
    this.dataString = localStorage.getItem('localData');

    if (this.dataString) {
      const jsonString = JSON.parse(this.dataString);
      this.userId = jsonString._id;
      this.roleName = jsonString.role;
      this.saveAuditTrailLog('View Dashboard');
      this.onLoadAllNotifications();

      this.onLoadAllProposalActionPlan();
      this.onViewAllStudentProposal();
      this.onViewAllStudentProposalByUser(this.userId);
      this.onViewAllProposalRecords();

      this.getUserDetails();
      this.onViewLineGraph();
    } else {
      this.router.navigate(['/login']);
    }

    this.monthYearString = `${this.currentDate.toLocaleString('default', {
      month: 'long',
    })} ${this.currentDate.getFullYear()}`;

    if (this.dataString) {
      if (document) {
        const ctx = document.getElementById(
          'barChartOverallReport'
        ) as HTMLCanvasElement;

        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: this.labels,
            datasets: [
              {
                label: 'Department',
                data: this.data,
                backgroundColor: ['#700f1d', '#f9c20c'],
                borderColor: ['#700f1d', '#f9c20c'],
                borderWidth: 1,
              },
            ],
          },

          options: {}, // Add custom options as needed
        });
      } // if document
    } // if this.dataString
  } // ngOnInit()

  getProposalStatus(statusID: string): string {
    let string_value = '';

    switch (statusID) {
      case '0':
        string_value = 'Rejected';
        break;
      case '1':
        string_value = 'Approved';
        break;
      case '2':
        string_value = 'Done';
        break;
      case '3':
        string_value = 'Pending';
        break;
      case '4':
        string_value = 'Revise';
        break;
      case '5':
        string_value = 'Implementation';
        break;
      case '6':
        string_value = 'Output';
        break;
      case '7':
        string_value = 'Outcome';
        break;
      case '8':
        string_value = 'Revision Submitted';
        break;
    }

    return string_value;
  }

  onViewLineGraph() {
    const project_numbers: number[] = [];
    var project_numbers_by_month: number[][] = [[]];

    const ctx_line_graph_projects = document.getElementById(
      'lineGraph-projects'
    ) as HTMLCanvasElement;

    let ChartGraph = new Chart(ctx_line_graph_projects, {
      type: 'line',
      data: {
        labels: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'June',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ], // Your x-axis labels

        datasets: [
          {
            label: '',
            data: [{}], // line 1
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
          },
        ],
      },
      // Additional options for scales, grid lines, tooltips, etc.
    });

    //ChartGraph.data.labels?.push("");

    let current_year_string = '';
    current_year_string = String(this.datepipe.transform(new Date(), 'yyyy'));

    this.departmentNames.forEach((item, index) => {
      // x: Month Label
      // y: No. of Projects

      this.data_line = [
        {
          x: 1,
          y: this.countProjectsDepartment(item, '7', current_year_string),
        },
        {
          x: 2,
          y: this.countProjectsDepartment(item, '7', current_year_string),
        },
        {
          x: 3,
          y: this.countProjectsDepartment(item, '7', current_year_string),
        },
        {
          x: 4,
          y: this.countProjectsDepartment(item, '7', current_year_string),
        },
        {
          x: 5,
          y: this.countProjectsDepartment(item, '7', current_year_string),
        },
        {
          x: 6,
          y: this.countProjectsDepartment(item, '7', current_year_string),
        },
        {
          x: 7,
          y: this.countProjectsDepartment(item, '7', current_year_string),
        },
        {
          x: 8,
          y: this.countProjectsDepartment(item, '8', current_year_string),
        },
        {
          x: 9,
          y: this.countProjectsDepartment(item, '9', current_year_string),
        },
        {
          x: 10,
          y: this.countProjectsDepartment(item, '10', current_year_string),
        },
        {
          x: 11,
          y: this.countProjectsDepartment(item, '11', current_year_string),
        },
        {
          x: 12,
          y: this.countProjectsDepartment(item, '12', current_year_string),
        },
      ];

      ChartGraph.data.datasets.push({
        label: item,
        data: this.data_line,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
      });
    });
  } // onViewLineGraph()

  addCounter(iteration_count: number) {
    this.counter += iteration_count;
  } // addCounter

  countProjectsDepartment(
    dept_item: string,
    month_string: string,
    year_string: string
  ): number {
    //this.counter = 0;
    var count_here = 0;

    if (this.proposalDetails) {
      this.proposalDetails.forEach((item: any) => {
        count_here += 1;
      });
    }

    return count_here;
  } // countProjectsDepartment()

  getRandomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getUserDetails() {
    this.inputService
      .getUserAccounts(this.router.url)
      .subscribe((data: any) => {
        this.userDetails = data;

        this.userDetail = this.userDetails.filter((item: any) => {
          return item._id.includes(this.userId);
        });

        this.user_fname = this.userDetail[0].fname;
        this.user_mname = this.userDetail[0].mname;
        this.user_lname = this.userDetail[0].lname;
        this.user_email = this.userDetail[0].email;
        this.user_department = this.userDetail[0].department;
        this.user_tenure = this.userDetail[0].tenure;
      });
  } // getUserDetails()

  sortByDate(data: any[], property: string, descending = false): any[] {
    return data.sort((a, b) => {
      const valueA = a[property];
      const valueB = b[property];
      const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      return descending ? comparison * -1 : comparison;
    });
  } // sortByDate

  onLoadAllProposalActionPlan() {
    this.inputService
      .getProposalActionPlanService(this.router.url)
      .subscribe((data: any) => {
        this.proposalActionPlans = data;
      });
  } // onLoadAllProposalActionPlan()

  getProposalActionPlanDetails(proposalId: string, criteria: string): string {
    let return_value = '';

    this.proposal_action_plan_details = this.proposalActionPlans.filter(
      (item: any) => {
        return item.proposal_id.includes(proposalId);
      }
    );

    let time_frame_start =
      this.proposal_action_plan_details[0].time_frame_start;
    let time_frame_end = this.proposal_action_plan_details[0].time_frame_end;
    let objective_string = this.proposal_action_plan_details[0].objectives;
    let activity_title = this.proposal_action_plan_details[0].activity_title;
    let activity_details =
      this.proposal_action_plan_details[0].activity_details;

    if (criteria === 'objectives') {
      return_value = time_frame_start;
    }

    if (criteria === 'time_frame_start') {
      return_value = time_frame_start;
    }

    if (criteria === 'time_frame_end') {
      return_value = time_frame_end;
    }

    if (criteria === 'objectives') {
      return_value = objective_string;
    }

    if (criteria === 'activity_title') {
      return_value = activity_title;
    }

    if (criteria === 'activity_details') {
      return_value = activity_details;
    }

    return return_value;
  } // getProposalActionPlanDetails()

  onViewAllProposalRecords() {
    this.inputService
      .getProposalService(this.router.url)
      .subscribe((data: any) => {
        this.proposalDetails = data;
        this.proposalDetailsDisplay = data;

        this.proposalIntakeForm.forEach((item: any) => {
          this.proposalDetailsDisplay.push({
            project_title: item.project_title,
            target_beneficiary: item.target_beneficiary,
            venue: item.target_area,
            createdAt: item.date_submitted,
            status: item.status,
          });
        });

        this.proposalDetailsDisplay = this.proposalDetailsDisplay.filter(
          (p_item_filter: any) => {
            return (
              p_item_filter.proposal_root_id === '' ||
              p_item_filter.proposal_root_id === null ||
              p_item_filter.proposal_root_id === undefined ||
              p_item_filter.proposal_root_id === ' -- '
            );
          }
        );

        if (this.proposalDetails) {
          this.proposalDetailsFilterByCurrentUser = this.proposalDetails.filter(
            (item: any) => {
              return item.user_id.includes(this.userId);
            }
          );

          this.proposalDetailsFilterByCurrentUser =
            this.proposalDetailsFilterByCurrentUser.filter((item: any) => {
              return (
                item.proposal_root_id === '' ||
                item.proposal_root_id === ' -- ' ||
                item.proposal_root_id === undefined ||
                item.proposal_root_id == null
              );
            });
        }

        if (this.proposalDetailsDisplay) {
          this.proposal_done = this.proposalDetailsDisplay.filter(
            (item: any) => {
              return item.status.includes('2');
            }
          );

          this.proposal_approved = this.proposalDetailsDisplay.filter(
            (item: any) => {
              return item.status.includes('1');
            }
          );

          this.approved_projects_count = Object.keys(
            this.proposal_approved
          ).length;
          this.done_projects_count = Object.keys(this.proposal_done).length;
        }

        this.chartData_dps = [
          { label: 'In-Progress', value: this.approved_projects_count },
          { label: 'Done', value: this.done_projects_count },
        ];

        const ctx_dps = document.getElementById(
          'pieChart-progress-report'
        ) as HTMLCanvasElement;

        new Chart(ctx_dps, {
          type: 'pie',
          data: {
            labels: this.chartData_dps.map((d) => d.label),
            datasets: [
              {
                backgroundColor: ['#700f1d', '#f9c20c'],
                data: this.chartData_dps.map((d) => d.value),
              },
            ],
          },
          options: {}, // Add custom options as needed
        });

        //this.done_projects_count = Object.keys(this.proposal_done).length;
        //this.approved_projects_count = Object.keys(this.proposal_approved).length;

        this.proposalDetails = this.sortByDate(
          this.proposalDetails,
          'createdAt',
          true
        );

        if (this.proposalDetailsFilterByCurrentUser) {
          this.proposalDetailsFilterByCurrentUser = this.sortByDate(
            this.proposalDetailsFilterByCurrentUser,
            'createdAt',
            true
          );
        }
      });
  } /// onViewAllProposalRecords()

  onViewAllStudentProposal() {
    this.proposalIntakeForm = this.inputService
      .getIntakeFormService(this.router.url)
      .subscribe((data: any) => {
        this.proposalIntakeForm = data;
      });
  } // onViewAllStudentProposal()

  onViewAllStudentProposalByUser(user_id_student: string) {} // onViewAllStudentProposalByUser()

  onViewDocumentReport(projectId: string) {
    this.router.navigate(['/view-document-report', projectId, 'notif']);
  } // onViewDocumentReport()

  onLoadAllNotifications() {
    this.inputService
      .getNotificationService(this.router.url)
      .subscribe((data: any) => {
        this.sharedData.setDataArray(data);
      });
  } // onLoadAllNotifications()

  onViewDocumentReports() {
    this.router.navigate(['/document-reports']);
  } // onViewDocumentReports()

  initializeAuditTrail(actionTaken: string): void {
    this.auditTrailForm = this.fb.group({
      user_id: this.userId,
      role: this.roleName,
      action_taken: actionTaken,
      action_date_time: new Date(),
    });
  } // initializeAuditTrail()

  onRecordAuditTrailLogs() {
    this.inputService
      .createAuditTrailService(this.auditTrailForm.value)
      .subscribe(
        (response) => {
          console.log('Data for Audit Trail Submitted Successfully:', response);
        },
        (error) => {
          console.error('Error submitting form of Audit Trail:', error);
          // Handle error logic if needed
        }
      );
  }

  saveAuditTrailLog(actionString: string): void {
    this.initializeAuditTrail(actionString);
    this.onRecordAuditTrailLogs();
  }
}
