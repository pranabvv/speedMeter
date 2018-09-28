import { Component, AfterViewInit, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AmChartsService, AmChart } from '@amcharts/amcharts3-angular';
import { Router, ActivatedRoute } from '@angular/router';
import { interval } from 'rxjs';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { fromEvent, Observable, forkJoin, combineLatest, merge } from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy, OnInit, AfterViewInit {
  dataSource: Object;
  speedNeedle = 0.0;
  rpmNeedle = 0.0;
  gearCount = 0;
  needleSmooth = 35;
  private chart: AmChart;
  rpmMin = 2.2;
  rpmMax = 5.2;
  clutchBtnStatus = false;
  digitalSpeed: any;
  digitalKm1 = 0;
  digitalKm2 = 0;
  modalReference: any;
  gearBtnStatus = false;
  rpmNeedleMoveForwardInterval: any;
  rpmNeedleMoveBackwardInterval: any;
  gearLimitFlag = false;
  speedNeedleMoveinterval: any;
  rpmNeedleSpeed = 30;
  rpmNeedleStartShake: any;
  rpmNeedleEndShake: any;
  speedNeedleShakeInterval: any;
  rpmTimeoutFlag = false;
  clutchFun: any;
  gearFun: any;
  rpmNeedleStartPoint = true;
  speedNeedleIntervalEndFlag = false;
  speedWaitInterval: any;
  gameStartFlag = false;
  touch1: Observable<any>;
  touch2: Observable<any>;
  @ViewChild('gameRule') private modal;
  @ViewChild('clBtn') private clBtnElement;
  @ViewChild('gearBtn') private gearBtnElement;
  clutchBtnShakeEffect = false;
  gearBtnShakeEffect = false;
  constructor(private AmCharts: AmChartsService, private router: Router,
    private activatedRoute: ActivatedRoute, private modalService: NgbModal) {
    this.dataSource = {
      'chart': {
        'caption': 'Customer Satisfaction Score',
        'subcaption': 'Los Angeles Topanga',
        'plotToolText': 'Current Score: $value',
        'theme': 'fint',
        'chartBottomMargin': '50',
        'showValue': '1'
      },
      'colorRange': {
        'color': [{
          'minValue': '0',
          'maxValue': '40.5',
          'code': '#e44a00'
        }, {
          'minValue': '40.5',
          'maxValue': '70.5',
          'code': '#f8bd19'
        }, {
          'minValue': '70.5',
          'maxValue': '100',
          'code': '#6baa01'
        }]
      },
      'dials': {
        'dial': [{
          'value': '8.9'
        }]
      },
    }; // end of this.dataSource

  } // end of constructor

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.clutchFun = this.clutch.bind(this, 'btnPressed');
    this.gearFun = this.gear.bind(this, 'btnPressed');
    this.clBtnElement.nativeElement.addEventListener('click', this.clutchFun, true);
    this.gearBtnElement.nativeElement.addEventListener('click', this.gearFun, true);
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false
    };
    setTimeout(() => {
      this.modalReference = this.modalService.open(this.modal, ngbModalOptions);
    }, 0);
    this.chart = this.AmCharts.makeChart('chartdiv', {
      'type': 'gauge',
      'theme': 'light',
      'dataProvider': [],
      'axes': [{
        'axisColor': 'transparent',
        'color': '#fff',
        'endValue': 7,
        'gridInside': true,
        'inside': true,
        'radius': '100%',
        'valueInterval': 1,
        'tickColor': '#fff',
        'pivotRadius': '0%',
        'id': 'axes1',
        'topText': 'RPM',
        'topTextFontSize': 9,
        'topTextYOffset': -20,
        'topTextColor': '#fff',
        'bottomTextYOffset': -3,
        'bottomTextColor': '#fff',
        'minorTickLength': 16,
        'tickLength': 22,
        'tickThickness': 2,
        'labelOffset': 5,
        'bands': [{
          'color': '#f91f1f',
          'endValue': 7,
          'innerRadius': '87%',
          'startValue': 5
        },
        {
          'color': '#e60000',
          'endValue': 0,
          'startValue': 0,
          'alpha': 0.3,
          'radius': '100%',
          'innerRadius': '15%',
        },
        {
          'color': '#e60000',
          'endValue': 0,
          'startValue': 0,
          'alpha': 0.6,
          'radius': '100%',
          'innerRadius': '15%',
        },
        ]
      }, {
        'axisColor': '#fff',
        'color': 'black',
        'axisThickness': 3,
        'endValue': 140,
        'radius': '45%',
        'valueInterval': 20,
        'tickColor': 'black',
        'axisAlpha': '0',
        'bottomText': 'km/h',
        'bottomTextFontSize': 9,
        'bottomTextYOffset': -15,
        'bottomTextColor': 'black',
        'labelOffset': 2,
        'tickThickness': 1.2,
        'bands': [{
          'color': '#fff',
          'alpha': 1,
          'startValue': 0,
          'endValue': 220,
          'radius': '100%',
          'innerRadius': '0'
        }]
      }],
      'arrows': [{
        'color': '#ff0000',
        'innerRadius': '6.3%',
        'radius': '40%',
        'startWidth': 3,
        'value': 0,
      }, {
        'color': '#ff0000',
        'innerRadius': '46%',
        'radius': '90%',
        'startWidth': 8,
        'value': 0
      },
      {
        'color': '#111',
        'innerRadius': '7%',
        'radius': '0',
        'startWidth': 0,
        'value': 0,
        'nailAlpha': 1,
        'nailRadius': 10
      }
      ],
      'export': {
        'enabled': true
      }
    });
  }

 // clutch button method
  clutch(val) {
    if (val === 'btnPressed') {
      this.clutchBtnShakeEffect = true;
    } else {
      this.clutchBtnShakeEffect = false;
    }
    /* console.log('clutch');*/
    setTimeout(() => {
      this.clutchBtnStatus = false;
      this.clutchBtnShakeEffect = false;
      this.gearBtnShakeEffect = false;
    }, 500);
    if (this.rpmNeedleStartShake) {
      clearInterval(this.rpmNeedleStartShake);
    }
    if (this.rpmNeedleEndShake) {
      clearInterval(this.rpmNeedleEndShake);
    }
    this.clutchBtnStatus = true;
    this.clBtnElement.nativeElement.removeEventListener('click', this.clutchFun, true);
    if (!this.gearLimitFlag) {
      // console.log('gear btn status', this.gearBtnStatus);
      this.rpmNeedleMoveForwardInterval = setInterval(() => {
        if (this.rpmNeedle < 5) {
          this.chart.axes[0].bands[1].setEndValue(this.rpmNeedle);
          this.chart.axes[0].bands[2].setStartValue(0);
          this.chart.axes[0].bands[2].setEndValue(0);
        } else {
          this.chart.axes[0].bands[2].setStartValue(5);
          this.chart.axes[0].bands[2].setEndValue(this.rpmNeedle);
        }
        if (!this.rpmTimeoutFlag) {
          this.rpmNeedle += 1 / this.needleSmooth;
          this.chart.arrows[1].setValue(this.rpmNeedle);
          if (this.gearBtnStatus) {
            /* console.log('gear count', this.gearCount);*/
            if (this.rpmNeedleStartPoint) {
              this.rpmNeedleStartPoint = false;
              this.speedNeedleMoveFunc();
            }
            if (this.rpmNeedle >= this.rpmMax) {
              clearInterval(this.rpmNeedleMoveForwardInterval);
              this.gearBtnStatus = false;
              this.clutchBtnStatus = false;
              this.gearLimitFlag = true;
              if (this.gearCount !== 5) {
                this.rpmEndShakeFunc();
                this.clBtnElement.nativeElement.addEventListener('click', this.clutchFun, true);
                this.gearBtnElement.nativeElement.addEventListener('click', this.gearFun, true);
              }
            }
          } else if (this.rpmNeedle >= 4.4) {
            this.gearBtnStatus = false;
            this.clutchBtnStatus = false;
            this.rpmTimeoutFlag = true;
          }
        } else {
          this.rpmNeedle -= 1 / this.needleSmooth;
          this.chart.arrows[1].setValue(this.rpmNeedle);
          if (this.rpmNeedle <= this.rpmMin) {
            clearInterval(this.rpmNeedleMoveForwardInterval);
            this.rpmStartShakeFunc();
            this.rpmTimeoutFlag = false;
            this.clBtnElement.nativeElement.addEventListener('click', this.clutchFun, true);
          }
        }
      }, 15);
    } else {
      // this.gearBtnElement.nativeElement.addEventListener('click', this.gearFun, true);
      this.rpmNeedleMoveBackwardInterval = setInterval(() => {
        if (this.rpmNeedle < 5) {
          this.chart.axes[0].bands[1].setEndValue(this.rpmNeedle);
          this.chart.axes[0].bands[2].setStartValue(0);
          this.chart.axes[0].bands[2].setEndValue(0);
        } else {
          this.chart.axes[0].bands[2].setStartValue(5);
          this.chart.axes[0].bands[2].setEndValue(this.rpmNeedle);
        }
        this.rpmNeedle -= 1 / this.needleSmooth;
        this.chart.arrows[1].setValue(this.rpmNeedle);
        if (this.gearBtnStatus) {
          if (this.rpmNeedle <= this.rpmMin) {
            // console.log('gear changed');
            clearInterval(this.rpmNeedleMoveBackwardInterval);
            this.gearLimitFlag = false;
            this.rpmNeedleStartPoint = true;
            this.clutch('btnFuncall');
          }
        } else {
          if (this.rpmNeedle <= this.rpmMin) {
            // console.log('rpm reset');
            clearInterval(this.rpmNeedleMoveBackwardInterval);
            this.rpmStartShakeFunc();
            this.gearLimitFlag = false;
            this.gearBtnStatus = false;
            this.clutchBtnStatus = false;
            this.rpmNeedleStartPoint = true;
            this.clBtnElement.nativeElement.addEventListener('click', this.clutchFun, true);
          }
        }
      }, 10);
    }
  }

  // gear button method
  gear(val) {
    /* console.log('gear');*/
    if (this.clutchBtnStatus) {
      if (val === 'btnPressed') {
        this.gearBtnShakeEffect = true;
      } else {
        this.gearBtnShakeEffect = false;
      }
      this.clutchBtnStatus = false;
      this.gearCount++;
      switch (this.gearCount) {
        case 1:
          this.rpmMin = 2.2;
          this.rpmMax = 5.3;
        break;
        case 2:
          this.rpmMin = 2.3;
          this.rpmMax = 5.4;
        break;
        case 3:
          this.rpmMin = 2.5;
          this.rpmMax = 5.5;
        break;
        case 4:
          this.rpmMin = 2.6;
          this.rpmMax = 5.6;
        break;
        case 5:
          this.rpmMin = 2.8;
          this.rpmMax = 5.8;
        break;
      }
      // console.log('gear count in gear', this.gearCount);
      this.gearBtnElement.nativeElement.removeEventListener('click', this.gearFun, true);
      this.gearBtnStatus = true;
    }
  }
  ngOnDestroy() {
    if (this.chart) {
      this.AmCharts.destroyChart(this.chart);
    }
  }

  // method for closing modal
  closeModal() {
    this.modalReference.close();
    this.paramAppend('started');
    if (this.chart) {
      if (this.chart.arrows) {
        const digitalText = interval(4000);
        let timeTracker = 0;
        this.digitalSpeed = digitalText.subscribe(() => {
          timeTracker += 1;
          if (timeTracker <= 9) {
            this.digitalKm1 += 1;
          } else if (timeTracker <= 99) {
            if (timeTracker % 10 === 0) {
              this.digitalKm1 = 0;
              this.digitalKm2 += 1;
            } else {
              this.digitalKm1 += 1;
            }
          }
        });
        this.clutch('btnFuncall');
        this.gear('btnFuncall');
        setTimeout(() => {
          this.gameStopFunc();
          this.paramAppend('timeout');
        }, 180000);
      }
    }
  }

  // parameters appending
  paramAppend(gameStatus) {
    this.router.navigate(['.'], {
      relativeTo: this.activatedRoute,
      queryParams: {
        status: gameStatus
      }
    });
  }

  // method for speedneedle movement
  speedNeedleMoveFunc() {
    // console.log('speed needle wait func');
    const speedneedleRatio = (1.4 / (this.rpmMax - this.rpmMin) / this.needleSmooth);
    if (this.gearCount < 6) {
      if (!this.speedNeedleIntervalEndFlag) {
        if (this.speedNeedleShakeInterval) {
          clearInterval(this.speedNeedleShakeInterval);
        }
        this.speedNeedleMoveinterval = setInterval(() => {
          this.speedNeedleIntervalEndFlag = true;
          this.speedNeedle += speedneedleRatio;
          this.chart.arrows[0].setValue(this.speedNeedle);
          // console.log('speedneedle', this.speedNeedle);
          if (this.speedNeedle >= this.gearCount * 1.4) {
            // console.log('cleared speed interval');
            clearInterval(this.speedNeedleMoveinterval);
            if (this.speedNeedle <= 7) {
              this.speedNeedleShake();
            }
            if (this.speedNeedle >= 7) {
              this.gameStopFunc();
              this.paramAppend('finished');
            }
            this.speedNeedleIntervalEndFlag = false;
          }
        }, 15);
      } else {
        this.speedWaitInterval = setInterval(() => {
          if (!this.speedNeedleIntervalEndFlag) {
            clearInterval(this.speedWaitInterval);
            this.speedNeedleMoveFunc();
          }
        }, 15);
      }
    }

  }

  // method for rpmneedlestartshake
  rpmStartShakeFunc() {
    let rpmNeedleStartShakeFlag = false;
    this.rpmNeedleStartShake = setInterval(() => {
      if (this.rpmNeedle <= 2.2) {
        rpmNeedleStartShakeFlag = false;
      } else if (this.rpmNeedle >= 2.7) {
        rpmNeedleStartShakeFlag = true;
      }
      if (!rpmNeedleStartShakeFlag) {
        this.rpmNeedle += 1 / this.needleSmooth;
        this.chart.axes[0].bands[1].setEndValue(this.rpmNeedle);
        this.chart.axes[0].bands[2].setStartValue(0);
        this.chart.axes[0].bands[2].setEndValue(0);
        this.chart.arrows[1].setValue(this.rpmNeedle);
      } else {
        this.rpmNeedle -= 1 / this.needleSmooth;
        this.chart.axes[0].bands[1].setEndValue(this.rpmNeedle);
        this.chart.axes[0].bands[2].setStartValue(0);
        this.chart.axes[0].bands[2].setEndValue(0);
        this.chart.arrows[1].setValue(this.rpmNeedle);
      }
    }, 17);
  }

   // method for rpmneedleendshake
   rpmEndShakeFunc() {
    let rpmNeedleEndShakeFlag = false;
    this.rpmNeedleEndShake = setInterval(() => {
      if (this.rpmNeedle <= 5.2) {
        rpmNeedleEndShakeFlag = false;
      } else if (this.rpmNeedle >= 5.8) {
        rpmNeedleEndShakeFlag = true;
      }
      if (!rpmNeedleEndShakeFlag) {
        this.rpmNeedle += 1 / this.needleSmooth;
        this.chart.axes[0].bands[2].setStartValue(5);
        this.chart.axes[0].bands[2].setEndValue(this.rpmNeedle);
        this.chart.arrows[1].setValue(this.rpmNeedle);
      } else {
        this.rpmNeedle -= 1 / this.needleSmooth;
        this.chart.axes[0].bands[2].setStartValue(5);
        this.chart.axes[0].bands[2].setEndValue(this.rpmNeedle);
        this.chart.arrows[1].setValue(this.rpmNeedle);
      }
    }, 17);
  }

  // method for speedneedleshake
  speedNeedleShake() {
    let speedNeedleShakeFlag = false;
    const speedneedleRatio = (1.4 / (this.rpmMax - this.rpmMin) / this.needleSmooth);
    const speedIntervalBoundary = this.speedNeedle - 0.4;
    // console.log('speedIntervalBoundary', speedIntervalBoundary);
    this.speedNeedleShakeInterval = setInterval(() => {
        if (this.speedNeedle <= speedIntervalBoundary) {
          speedNeedleShakeFlag = false;
        } else if (this.speedNeedle >= 1.4 * this.gearCount) {
          speedNeedleShakeFlag = true;
        }
        if (!speedNeedleShakeFlag) {
          this.speedNeedle += speedneedleRatio;
          this.chart.arrows[0].setValue(this.speedNeedle);
        } else {
          this.speedNeedle -= speedneedleRatio;
          this.chart.arrows[0].setValue(this.speedNeedle);
        }
    }, 17);
  }

 // method to stop the game when timeout or maximum gearlimit reached
  gameStopFunc() {
    if (this.rpmNeedleMoveForwardInterval) {
      clearInterval(this.rpmNeedleMoveForwardInterval);
      // console.log('rpm needle interval cleared');
    }
    if (this.speedWaitInterval) {
      clearInterval(this.speedWaitInterval);
      // console.log('speed wait interval cleared');
    }
    if (this.speedNeedleMoveinterval) {
      clearInterval(this.speedNeedleMoveinterval);
      // console.log('speed move interval cleared');
    }
    if (this.rpmNeedleStartShake) {
      clearInterval(this.rpmNeedleStartShake);
      // console.log('rpm needle start shake interval cleared');
    }
    if (this.rpmNeedleEndShake) {
      clearInterval(this.rpmNeedleEndShake);
      // console.log('rpm needle end shake interval cleared');
    }
    if (this.speedNeedleShakeInterval) {
      clearInterval(this.speedNeedleShakeInterval);
      // console.log('speed needle shake interval cleared');
    }
    if (this.digitalSpeed) {
      this.digitalSpeed.unsubscribe();
      // console.log('digital speed interval cleared');
    }
    this.clBtnElement.nativeElement.removeEventListener('click', this.clutchFun, true);
    this.gearBtnElement.nativeElement.removeEventListener('click', this.gearFun, true);
  }
} // end of class AppComponent
