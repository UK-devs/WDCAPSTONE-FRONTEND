import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputService } from '../../../services/input.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import {Storage, ref, uploadBytesResumable, getDownloadURL} from '@angular/fire/storage';


@Component({
  selector: 'app-implementation-report-student',
  templateUrl: './implementation-report-student.component.html',
  styleUrl: './implementation-report-student.component.scss'
})
export class ImplementationReportStudentComponent {

  implementationForm!: FormGroup;
  proposalDetails!:any;
  proposalDetailSelected!:any;

  FileUploadForm!:any;

  proposalIntakes!:any;
  proposalIntakeForm!:any;
  proposalIntakeDetails:any;
  updateProposalIntakeDetailsForm!:any;

  proposal_id: string = "";

  event_project_title: string = "";
  event_venue: string = "";
  event_sponsor_department: string = "";
  event_beneficiaries: string = "";

  activity_category_collections: string[] = ['Education','Finance and Business Management','ICT','Micro-Infrastracture, Engineering, and Architectural Works','Values and Spiritual Formation','SNAMS','HRM Related Skills Traning'];

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
  activity_category: string = "";
  description: string = "";

  dataString: any;
  role_name: string = "";
  userId: string = "";

  minDate: string = "";
  maxDate: string = "";
  
  public file: any = {};
  public file_image_one: any = {};
  public file_image_two: any = {};
  public file_image_three: any = {};

  file_pdf_string: string = "";
  file_image_string_one: string = "";
  file_image_string_two: string = "";
  file_image_string_three: string = "";

  error_message: string[] = [];
  error_count: number = 0;

  allowedImagesExtensions = ['jpg', 'jpeg', 'png','bmp','webp','JPG','JPEG','PNG','BMP','WEBP'];
  allowedPDFExtensions = ['pdf','PDF'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private inputService: InputService,
    private actRoute: ActivatedRoute,
    private datepipe: DatePipe,
    private storage: Storage
  ) {

    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.maxDate = String(this.datepipe.transform(today.setFullYear(today.getFullYear() + 2),'yyyy-MM-dd'));

  }

  ngOnInit(): void {

    const id = this.actRoute.snapshot.paramMap.get('id');

    if(id){

      this.proposal_id = id;

      this.getAllProposalIntakes(this.proposal_id);
   
      
    } // if id exist

    this.dataString = localStorage.getItem('localData');
    
    if(this.dataString){
      const jsonString = JSON.parse(this.dataString);   
      this.role_name = jsonString.role;
      this.userId = jsonString._id;  // account logged in userId value


    }else{
      this.router.navigate(['/login']);
    }

   
  } // ngOnInit()

  
  chooseFile(event:any){

    const file = event.target.files[0];
    const extension = file.name.split('.').pop().toLowerCase();

    if (!this.allowedPDFExtensions.includes(extension)) {
      event.target.value = ''; // Clear file selection
    } else {
      // Handle valid file (e.g., send to server)
      this.file = file;

    }

  }

  choose_file_image_one(event:any){
    const file = event.target.files[0];
    const extension = file.name.split('.').pop().toLowerCase();



    if (!this.allowedImagesExtensions.includes(extension)) {
        
        event.target.value = ''; // Clear file selection
    } else {
      // Handle valid file (e.g., send to server)
      this.file_image_one = file;

    }
  }

  choose_file_image_two(event:any){
    const file = event.target.files[0];
    const extension = file.name.split('.').pop().toLowerCase();

    if (!this.allowedImagesExtensions.includes(extension)) {
    
      event.target.value = ''; // Clear file selection
    } else {
      // Handle valid file (e.g., send to server)
      this.file_image_two = file;

    }
  }

  choose_file_image_three(event:any){
  
   
      const file = event.target.files[0];
      const extension = file.name.split('.').pop().toLowerCase();
  
      if (!this.allowedImagesExtensions.includes(extension)) {
      
        event.target.value = ''; // Clear file selection
      } else {
        // Handle valid file (e.g., send to server)
        this.file_image_three = file;

      }
    
  }

  addData_image(file: File, fileName: string, proposalID:string){

    const storageRef = ref(this.storage,`images/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on('state_changed',(snapshot) => {
      const progress = (snapshot.bytesTransferred) / snapshot.totalBytes;
      console.log('upload is' + progress + '% done');
    }, (error) => {},
      ()=>{
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL:any) => {
        console.log('File available at ', downloadURL);
        this.createRecordForFileUpload(proposalID, downloadURL,"image");
      })
    });

  } // addData_image


  addData_pdf(file: File, fileName: string, proposalID: string){

    const storageRef = ref(this.storage,`pdf/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on('state_changed',(snapshot) => {
      const progress = (snapshot.bytesTransferred) / snapshot.totalBytes;
      console.log('upload is' + progress + '% done');
    }, (error)=>{

    },()=>{
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL:any) => {
        console.log('File available at ', downloadURL);
        this.createRecordForFileUpload(proposalID, downloadURL,"pdf");

      })
    });

  } // addData_pdf

  createRecordForFileUpload(proposalID:string, cloud_file_path:string, fileType: string){

    const today = new Date();
    let date_time_string = String(this.datepipe.transform(today,"yyyy-MM-dd hh:mm:ss"))

    this.FileUploadForm = this.fb.group({

      proposal_id: proposalID,
      uploader_id: this.userId,
      file_type: fileType,
      cloud_file_path: cloud_file_path,
      action_date_time: date_time_string 

    });
  
    this.inputService.createFileUploadService(this.FileUploadForm.value).subscribe((response:any)=>{
      console.log("File Uploaded! URL: "+cloud_file_path);
    });

  } // createRecordForFileUpload

  getAllProposalIntakes(proposalID: string){
    this.inputService.getIntakeFormService(this.router.url).subscribe((response)=>{

      this.proposalIntakes = response;


      if(this.proposalIntakes){

        this.proposalIntakeDetails = this.proposalIntakes.filter((item:any) => {
  
            return item._id.includes(proposalID);
    
        });
  
        this.event_project_title = this.proposalIntakeDetails[0].project_title;
        this.event_sponsor_department =this.proposalIntakeDetails[0].departments;
        this.event_venue = this.proposalIntakeDetails[0].target_area;
        this.event_beneficiaries = this.proposalIntakeDetails[0].target_beneficiary;
  
      }

    });
  }



  

  onImplement() {


    this.implementationForm = this.fb.group({
      proposal_id: this.proposal_id,
      proposal_type: "proposal_intake",
      date_implemented: this.dateImplemented,
      time_implemented: this.timeImplemented,
      user_id: this.userId,
      accomplished_objective: this.accomplishedObjective,
      brief_narrative: this.briefNarrative,
      project_topic: this.projectTopic,
      activity_speaker: this.activitySpeaker,
      project_volunteers: this.projectVolunteers,
      designation: this.designation,
      description: this.description,
      venue: this.event_venue,
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

  
    this.error_message = [];
    this.error_count = 0;
 
    if(this.file_pdf_string === ""){
      this.error_message.push("Please specify a PDF File to upload");
    }

    if(this.file_image_string_one === "" || this.file_image_string_two === "" || this.file_image_string_three === ""){      
      this.error_message.push("Please complete the required 3 image uploads");
    }

  
    

    if(this.error_message){
      this.error_count = Object.keys(this.error_message).length;
    }

    if(this.error_count < 1){

    this.inputService
      .createImplementationService(this.implementationForm.value)
      .subscribe({
        next: (res) => {

          this.updateProposalIntakeDetailsForm = this.fb.group({

            _id: this.proposal_id,        
            status: "2"            
        
           });

           this.inputService.updateIntakeFormService(this.updateProposalIntakeDetailsForm.value).subscribe(response=>{

            this.addData_pdf(this.file,"PDF_"+this.proposal_id, this.proposal_id);
            this.addData_image(this.file_image_one,"IMAGE_1_"+this.proposal_id, this.proposal_id);
            this.addData_image(this.file_image_two,"IMAGE_2_"+this.proposal_id, this.proposal_id);
            this.addData_image(this.file_image_three,"IMAGE_3_"+this.proposal_id, this.proposal_id);

          
            Swal.fire('Successfully Submitted Implementation Report');          
            this.router.navigate(['/student-reports']);
            
           });

        },
        error: (err) => {
          console.log(err);
          if (err.error.message == 'Token is expired') {
            localStorage.clear();
            window.location.reload();
          }
        },
      }); // inputService.createImplementationService

    } else{
      
    

      window.scrollTo({top:0, behavior:'smooth'});

    } // error handlling on validation

  

  } // onImplement()
  
}
