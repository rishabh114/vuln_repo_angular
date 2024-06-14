import { AfterViewInit, Component, OnInit, Inject, ViewChild } from '@angular/core';
import { ApiService } from '../api.service';
import { UntypedFormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  //imports: [],
  selector: 'app-dialog-cve',
  templateUrl: './dialog-cve.component.html',
  styleUrls: ['./dialog-cve.component.scss']
})

export class DialogCveComponent implements OnInit, AfterViewInit {
  err_msg: string;
  show = false;
  results: any;
  gbug: any;
  mycve = new UntypedFormControl();

  displayedColumns: string[] = ['name', 'description', 'source'];
  dataSource = new MatTableDataSource([]);

  displayedColumns2: string[] = ['url'];
  dataSource2 = new MatTableDataSource([]);

  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('paginator2') paginator2: MatPaginator;

  ngAfterViewInit() {
    setTimeout(() => this.dataSource.paginator = this.paginator);
    setTimeout(() => this.dataSource2.paginator = this.paginator2);
  }


  constructor(private apiService: ApiService,
    public dialogRef: MatDialogRef<DialogCveComponent>, @Inject(MAT_DIALOG_DATA) public data: any,public router: Router,) {
        this.mycve.setValue(this.data.cve);
     }

  ngOnInit(): void {
  }

  searchCVE() {
    this.show = false;
    this.results = null;
    this.err_msg = '';
    const data = this.mycve.value;
    if (data !== '' && data !== null) {

      const reg = new RegExp(/^CVE-\d{4}-\d{4,7}$/, 'i');
      if (reg.test(data)) {

        this.show = true;
        this.apiService.getCVE(data).then(resp => {

          if (resp !== null && resp !== undefined) {
            // if everything OK

            if (resp.vulnerabilities[0].cve.id) {
                this.results = resp.vulnerabilities[0].cve;
                this.show = false;
                this.gbug = resp.githubpoc;
                
                this.dataSource = new MatTableDataSource(this.gbug.items);
                setTimeout(() => this.dataSource.paginator = this.paginator);

                this.results.references = [...this.results.references];

                this.dataSource2 = new MatTableDataSource(this.results.references);
                setTimeout(() => this.dataSource2.paginator = this.paginator2);

            } else {

              this.results = resp.vulnerabilities[0].cve;
              this.show = false;
              this.gbug = resp.githubpoc;
              this.dataSource = new MatTableDataSource(this.gbug.items);
              setTimeout(() => this.dataSource.paginator = this.paginator);

            }

            if (resp.error) {
              this.err_msg = resp.error;
              this.show = false;
            }

          } else {
            this.show = false;
            this.err_msg = 'CVE not found.';
          }

        });

      } else {
        this.show = false;
        this.err_msg = 'CVE format error.';
      }
    }

  }


  saveCVE() {
    const cve = this.mycve.value;
    this.data.cve = cve.toUpperCase();
    this.dialogRef.close(this.data);
  }

  openInNewWindow() {
    // Converts the route into a string that can be used 
    // with the window.open() function
    const url = this.router.serializeUrl(
      this.router.createUrlTree([`/cve-search`])
    );
  
    window.open(url, '_blank');
  }

}
