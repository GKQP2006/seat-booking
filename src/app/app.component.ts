import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Seat {
  booked: boolean;
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  seatMatrix: Seat[][] = [];
  numSeatsToReserve: number = 1;

  constructor(private http: HttpClient,
    private _snackBar: MatSnackBar) {}

  ngOnInit() {
    this.getSeatMatrix();
  }

  getSeatMatrix() {
    this.http.get<any>('https://train-seat-booking-api.onrender.com/seats').subscribe((data) => {
      this.seatMatrix = data.seatMatrix;
    });
  }
reserveSeats() {
      let msg = '';
      if(this.numSeatsToReserve < 1){
        msg = 'Please enter valid number of seats.'
        this._snackBar.open(msg, 'Close', {
          horizontalPosition : 'start',
          verticalPosition : 'top',
      })
      return
      }
      if(this.numSeatsToReserve > 7){
        msg = 'Only 7 seats can be booked at once'
        this._snackBar.open(msg, 'Close', {
          horizontalPosition : 'start',
          verticalPosition : 'top',
      })
      return
      }

      this.http.post<any>('https://train-seat-booking-api.onrender.com/reserve' , {numSeatsToReserve : this.numSeatsToReserve}).subscribe(
      {
        next : (response) =>{
          if(response.reservedSeats === 'Not enough available seats.'){
            msg = 'Enough seats not available, please reset and try again!'
            this._snackBar.open(msg, 'Close', {
              horizontalPosition : 'start',
              verticalPosition : 'top',
          })
          }
          else{
          let seatnumbers = '';
          for (let index = 0; index < response.reservedSeats.length; index++) {
            seatnumbers +=(response.reservedSeats[index].rowNumber -1)*7 + response.reservedSeats[index].seatNumber + ', '
            this.seatMatrix[response.reservedSeats[index].rowNumber - 1][response.reservedSeats[index].seatNumber - 1].booked = true;
            this.numSeatsToReserve--;
          }
          msg = 'Seat numbers ' + seatnumbers + 'are reserved' ;
          this._snackBar.open(msg, 'Close', {
            horizontalPosition : 'start',
            verticalPosition : 'top',
          
        })
      }
        }, error : (err) =>{
          if(err.status === 400){
            msg = 'Sorry cannot book more than 7 seats at once'
            this._snackBar.open(msg, 'Close', {
              horizontalPosition : 'start',
              verticalPosition : 'top',
          })
        }else{
            msg = 'Oops something went wrong!!'
            this._snackBar.open(msg, 'Close', {
              horizontalPosition : 'start',
              verticalPosition : 'top',
          })
          }
      }
      
  })
}

  resetSeats() {
    this.http.post<any>('https://train-seat-booking-api.onrender.com/reset' , {}).subscribe((response)=>{});
    this.getSeatMatrix();
  }
}
