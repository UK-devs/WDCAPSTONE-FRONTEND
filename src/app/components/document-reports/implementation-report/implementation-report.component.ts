import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputService } from '../../../services/input.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import {Storage, ref, uploadBytesResumable, getDownloadURL} from '@angular/fire/storage';

@Component({
  selector: 'app-implementation-report',
  templateUrl: './implementation-report.component.html',
  styleUrl: './implementation-report.component.scss',
})
export class ImplementationReportComponent {



  implementationForm!: FormGroup;
  proposalDetails!:any;
  proposalDetailSelected!:any;
  proposedActionPlan!:any;
  proposedActionPlanSelected!:any

  proposal_id: string = "";

  event_project_title: string = "";
  event_venue: string = "";
  event_sponsor_department: string = "";
  event_beneficiaries: string = "";

  updateProposalDetailsForm!:any;
  activity_category_collections: string[] = ['Education','Finance and Business Management','ICT','Micro-Infrastracture, Engineering, and Architectural Works','Values and Spiritual Formation','SNAMS','HRM Related Skills Traning'];
  activity_category: string = "";

  dateImplemented: string = "";
  timeImplemented: string = "";
  accomplishedObjective:string = "";
  briefNarrative: string = "";
  projectTopic: string = "";
  activitySpeaker: string = "";
  projectVolunteers: string = "";
  designation: string = "";
  participationType: string = "";
  prepStartTime: string = "";
  prepEndTime: string = "";
  learnings: string = "";
  projectStrengths: string = "";
  projectWeakness: string = "";
  projectImprovement: string = "";
  projectCounterpart: string = "";
  projectParticulars: string = "";
  projectAmount: string = "";
  imageUpload: string = "";

  dataString: any;
  role_name: string = "";
  userId: string = "";

  minDate: string = "";
  maxDate: string = "";

  public file: any = {};
  public file_image_one: any = {};
  public file_image_two: any = {};
  public file_image_three: any = {};

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private inputService: InputService,
    private actRoute: ActivatedRoute,
    private datepipe: DatePipe,
    public storage: Storage
  ) {

    const today = new Date();
    const date_basis = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.maxDate = String(this.datepipe.transform(date_basis.setFullYear(today.getFullYear()+2),"yyyy-MM-dd"))

  }

  ngOnInit(): void {

    const id = this.actRoute.snapshot.paramMap.get('id');

    if(id){
      this.proposal_id = id;

      this.getAllProposals();
     
    } // if id exist

    this.dataString = localStorage.getItem('localData');
    
    if(this.dataString){
      const jsonString = JSON.parse(this.dataString);   
      this.role_name = jsonString.role;
      this.userId = jsonString._id; 


    }else{
      this.router.navigate(['/login']);
    }
   
  } // ngOnInit()


  
  chooseFile(event:any){
    this.file = event.target.files[0];

  }

  choose_file_image_one(event:any){
    this.file_image_one = event.target.files[0];
  }

  choose_file_image_two(event:any){
    this.file_image_two = event.target.files[0];
  }

  choose_file_image_three(event:any){
    this.file_image_three = event.target.files[0];
  }

  addData_image(file: File, fileName: string){

    const storageRef = ref(this.storage,`images/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on('state_changed',(snapshot) => {
      const progress = (snapshot.bytesTransferred) / snapshot.totalBytes;
      console.log('upload is' + progress + '% done');
    }, ()=>{
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL:any) => {
        console.log('File available at ', downloadURL);
      })
    });

  } // addData_image


  addData_pdf(file: File, fileName: string){

    const storageRef = ref(this.storage,`pdf/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on('state_changed',(snapshot) => {
      const progress = (snapshot.bytesTransferred) / snapshot.totalBytes;
      console.log('upload is' + progress + '% done');
    }, ()=>{
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL:any) => {
        console.log('File available at ', downloadURL);
      })
    });

  } // addData_pdf

  getAllProposals(){
    this.inputService.getProposalService(this.router.url).subscribe((response)=>{
      this.proposalDetails = response;

      if(this.proposalDetails){
      
        this.proposalDetailSelected = this.proposalDetails.filter((item:any) => {
  
          return item._id.includes(this.proposal_id);
    
        });
  
        this.event_project_title = this.proposalDetailSelected[0].project_title;
        this.event_sponsor_department = this.proposalDetailSelected[0].sponsor_department;
        this.event_venue = this.proposalDetailSelected[0].venue;
        this.event_beneficiaries = this.proposalDetailSelected[0].target_beneficiary;
  
      }

    })
  } // getAllProposals()

  



  onImplement() {

   

    this.implementationForm = this.fb.group({
      proposal_id: this.proposal_id,
      proposal_type: "proposal_document",
      user_id: this.userId,
      date_implemented: this.dateImplemented,
      time_implemented: this.timeImplemented,
      accomplished_objective: this.accomplishedObjective,
      brief_narrative: this.briefNarrative,
      project_topic: this.projectTopic,
      activity_speaker: this.activitySpeaker,
      project_volunteers: this.projectVolunteers,
      designation: this.designation,
      venue: this.event_venue,
      description: "",   
      participation_type: this.participationType,
      prep_start_time: this.prepStartTime,
      prep_end_time: this.prepEndTime,
      learnings: this.learnings,
      project_strengths: this.projectStrengths,
      project_weakness: this.projectWeakness,
      project_improvement: this.projectImprovement,
      project_counterpart: this.projectCounterpart,
      project_particulars: this.projectParticulars,
      project_amount: this.projectAmount,
      activity_category: this.activity_category,
      imageUpload: "", // Add this line for image upload
    });

    console.log(this.implementationForm.value);

    this.inputService
      .createImplementationService(this.implementationForm.value)
      .subscribe({
        next: (res) => {

          this.updateProposalDetailsForm = this.fb.group({

            _id: this.proposal_id,        
            status: "2"            
        
           });

           const today = this.datepipe.transform(new Date(),"yyyyMMdd_hhmmss");
           const today_string = String(today);

           this.addData_pdf(this.file,"PDF_"+this.proposal_id);
           this.addData_image(this.file_image_one,"IMAGE_1_"+this.proposal_id);
           this.addData_image(this.file_image_two,"IMAGE_2_"+this.proposal_id);
           this.addData_image(this.file_image_three,"IMAGE_3_"+this.proposal_id);

           
           
           this.inputService.updateProposalService(this.updateProposalDetailsForm.value).subscribe(response=>{

            Swal.fire('Successfully Submitted Implementation Report');
            //this.implementationForm.reset();
            this.router.navigate(['/document-reports']);
            
           });

       
        },
        error: (err) => {
          console.log(err);
          if (err.error.message == 'Token is expired') {
            localStorage.clear();
            window.location.reload();
          }
        },
      });
  }
}
