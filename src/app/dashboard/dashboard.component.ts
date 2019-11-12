import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ViewChildren, QueryList, Inject } from '@angular/core';
import { BuildsService } from '../services/builds.service';
import { Subscription, Observable } from 'rxjs';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/timer';
import { DOCUMENT } from '@angular/common';
import { LOCAL_STORAGE, WebStorageService } from 'angular-webstorage-service';
import { isNumber } from 'util';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  preloader = true;
  buildDetails: any = [];
  apiError: any = [];
  private getBuildsApi: Subscription;
  private getLastBuildsStatusApi: Subscription;

  private alive: boolean;
  scrollStart = 0;
  scrollStyles = {
    mheight: '100vh'
  };
  scrollHeight: number;
  scrollableHeight: number;
  buildsVisibleHeight: number;
  public storageLastBuildData: any = [];
  public lastFailureBuilds: any = [];
  public lastShowedInModal: any = [];
  jenGit = [
    { gitid: 43, jenkinsName: 'allegisiosdev' },
    { gitid: 44, jenkinsName: 'allegisandroiddev' },
    { gitid: 42, jenkinsName: 'allegisframework' },
    { gitid: 19, jenkinsName: 'androidbaseframework' },
    { gitid: 12, jenkinsName: 'facedetectionengine' },
    { gitid: 5, jenkinsName: 'genericbackendservices' },
    { gitid: 46, jenkinsName: 'practicemaster' },
    { gitid: 3, jenkinsName: 'skillportal' },
    { gitid: 1, jenkinsName: 'walkwithme' }
  ];

  @ViewChild('buildsection')
  elementScroll: ElementRef;
  @ViewChildren('builds')
  allBuilds: QueryList<any>;

  constructor(
    @Inject(DOCUMENT) private document: any,
    @Inject(LOCAL_STORAGE) private storage: WebStorageService,
    private apiServices: BuildsService,
    private ele: ElementRef
  ) {
    this.alive = true;
  }

  ngOnInit() {
    this.callJenkinsSonarApi('firstcall');
    IntervalObservable.create(1 * 60 * 1000) // 5 mins interval call for builds api call
      .takeWhile(() => this.alive)
      .subscribe(() => {
        this.callJenkinsSonarApi('intervalcall');
      });
  }

  ngOnDestroy() {
    this.getBuildsApi.unsubscribe();
    this.getLastBuildsStatusApi.unsubscribe();
    this.alive = false;
  }

  callJenkinsSonarApi(apiCall): void {
    this.getBuildsApi = this.apiServices.getAllJenkinsSonarBuilds().subscribe(
      responseList => {
        this.apiError.response = true;
        responseList.then(data => {
          const jenkinAllBuilds = data.jenkinsBuilds;
          const sonarContent = data.sonarContent;
          let jiraProjectsBug = [];
          data.jiraBugs.subscribe(jira => {
            jiraProjectsBug = jira;
          });
          data.otherJenkinsProjects.subscribe(otherProjects => {
            const otherProjectsArr = otherProjects.jobs;
            otherProjectsArr.forEach(projects => {
              jenkinAllBuilds.push(projects);
            });
          });

          data.jenkinsHealth.subscribe(jhealth => {
            data.gitProjectsCommitCounts.subscribe(allProjectsGitCommits => {
              jenkinAllBuilds.forEach((allBuilds, index) => {
                let htmlContent = '';
                let lastBuildNo = 0;
                let lastBuildtime = 0;
                if (allBuilds.builds.length > 0) {
                  lastBuildNo = allBuilds.builds[0].number;
                  lastBuildtime = allBuilds.builds[0].timestamp;
                }
                let buildHappened = '';
                if (lastBuildtime !== 0) {
                  buildHappened = this.getTimeDifference(lastBuildtime);
                }
                const jenkinBuildName = allBuilds.name
                  .toLowerCase()
                  .trim()
                  .replace(/\s/g, '')
                  .replace(/_/g, '')
                  .replace(/-/g, '');
                const findNameWithSonar = 'teksystems:' + jenkinBuildName;
                const sonarBuildIndex = sonarContent
                  .map(sonarbuilds => {
                    return sonarbuilds.key
                      .toLowerCase()
                      .replace(/\s/g, '')
                      .replace(/-/g, '');
                  })
                  .indexOf(findNameWithSonar);
                let gitCommitsCount = '';
                let gitlabIndex;
                this.jenGit.forEach(gitC => {
                  if (jenkinBuildName === gitC.jenkinsName) {
                    console.log(gitC.gitid);
                    gitlabIndex =  gitC.gitid;
                  }
                });

                allProjectsGitCommits.forEach(git => {
                  if (gitlabIndex === git.project_id) {
                    console.log(git.count);
                    gitCommitsCount = git.count;
                  }
                });

                if (sonarBuildIndex > -1) {
                  htmlContent = sonarContent[sonarBuildIndex].html;
                }

                const jiraProjectIndex = jiraProjectsBug
                  .map(jiraProject => {
                    return jiraProject.jbuildName
                      .toLowerCase()
                      .replace(/\s/g, '')
                      .replace(/-/g, '');
                  })
                  .indexOf(jenkinBuildName);

                if (jiraProjectIndex > -1) {
                  allBuilds.jira =
                    jiraProjectsBug[jiraProjectIndex].jiraDetails;
                } else {
                  allBuilds.jira = { issues: [] };
                }

                allBuilds.buildNo = lastBuildNo;
                allBuilds.buildAt = buildHappened;
                allBuilds.htmlcontent = htmlContent;
                allBuilds.gitCount = gitCommitsCount;

                const jenkinHealthIndex = jhealth
                  .map(jh => {
                    return jh.jbuildName;
                  })
                  .indexOf(allBuilds.name);
                if (jenkinHealthIndex > -1) {
                  allBuilds.healthClass = jhealth[index].healthClass;
                } else {
                  allBuilds.healthClass = '';
                }
              });
              this.buildDetails = jenkinAllBuilds;
              this.preloader = false;

              if (apiCall === 'intervalcall') {
                this.callApiLastBuildStatus();
              } else {
                setTimeout(() => {
                  this.contentSetHeight();
                }, 500);
              }
            });
          });
        });
        // this.buildDetails = responseList;
      },
      err => {
        this.preloader = false;
        if (apiCall === 'firstcall') {
          this.apiError.response = false;
        }
        this.apiError.status = err.status;
        this.apiError.statusText = err.statusText;
      }
    );
  }

  callApiLastBuildStatus(): void {
    this.storageLastBuildData = [];
    const allProjects = this.buildDetails;
    let name: string;
    let lastBuildNo: number;
    allProjects.forEach((project, index) => {
      name = project.name;
      lastBuildNo = project.buildNo;
      const lastBuilds = project.builds.slice(0, 2);
      const lastBuildTimeDiff =
        lastBuilds.length > 0
          ? this.getTimeDifference(lastBuilds[0].timestamp)
          : '';
      const createObj: Object = {
        name: name,
        buildTimeDiff: lastBuildTimeDiff,
        lastBuildNo: lastBuildNo,
        previousBuildStatus: lastBuilds.length > 1 ? lastBuilds[1].result : '',
        lastBuildStatus: lastBuilds.length > 0 ? lastBuilds[0].result : '',
        lastBuilds: lastBuilds
      };
      this.storageLastBuildData.push(createObj);
    });
    this.storage.set('lastBuildsStatus', this.storageLastBuildData);
    const getLocalData = this.storageLastBuildData;
    const failureBuilds = getLocalData.filter(build => {
      return (
        build.lastBuildStatus === 'FAILURE' &&
        build.previousBuildStatus === 'SUCCESS'
      );
    });

    let passPreviousData = this.lastShowedInModal;
    if (passPreviousData.length === 0) {
      passPreviousData = this.storage.get('lastShowedInModal');
    }
    this.lastFailureBuilds = this.getFilterFailureBuilds(
      passPreviousData,
      failureBuilds
    );
  }

  getFilterFailureBuilds(previousData, currentData) {
    if (previousData === null || previousData.length === 0) {
      this.storage.set('lastShowedInModal', currentData);
      this.lastShowedInModal = currentData;
      return currentData;
    } else {
      const newArr: any = [];
      currentData.forEach((cdata, ind1) => {
        if (
          cdata.previousBuildStatus === 'SUCCESS' &&
          cdata.lastBuildStatus === 'FAILURE'
        ) {
          const bname1: string = cdata.name;
          previousData.forEach((pdata, ind2) => {
            const bname2: string = pdata.name;
            if (
              pdata.previousBuildStatus === 'SUCCESS' &&
              pdata.lastBuildStatus === 'FAILURE'
            ) {
              if (bname1 !== bname2) {
                const findIndex = newArr
                  .map(function(arr) {
                    return arr.name;
                  })
                  .indexOf(bname2);
                if (findIndex > -1) {
                  newArr.push(cdata);
                }
              }
            }
          });
        }
      });
      if (newArr.length !== 0) {
        this.storage.set('lastShowedInModal', newArr);
        this.lastShowedInModal = newArr;
      }
      return newArr;
    }
  }

  contentSetHeight(): void {
    this.scrollHeight = this.elementScroll.nativeElement.scrollHeight;
    this.scrollStyles['mheight'] = '84vh';
    this.scrollableHeight = this.allBuilds.toArray()[0].nativeElement.scrollHeight; // add card row height
    const w = window,
      e = this.document.documentElement,
      g = this.ele.nativeElement.closest('body'),
      y = w.innerHeight || e.clientHeight || g.clientHeight;
    this.buildsVisibleHeight = (y * 84) / 100; // 84vh to pixels
    this.contentScroll();
  }

  contentScroll(): void {
    Observable.interval(0.5 * 10000).subscribe(x => {
      let startWith: number = this.scrollStart + 3 * this.scrollableHeight; // 3 rows scroll  3 * row height
      this.scrollStart = startWith;
      if (startWith > this.scrollHeight) {
        this.scrollStart = 0;
        startWith = this.scrollStart;
      }
      const elem: Element = this.elementScroll.nativeElement;
      if (document.hidden === false) {
        this.scrollTo(elem, startWith, 2000);
      }
    });
  }

  scrollTo(element, to, duration): void {
    const start = element.scrollTop,
      change = to - start,
      increment = 20;
    let currentTime = 0;
    const animateScroll = () => {
      currentTime += increment;
      const val = this.easeInOutQuad(currentTime, start, change, duration);
      element.scrollTop = val;
      if (currentTime < duration) {
        setTimeout(animateScroll, increment);
      }
    };
    animateScroll();
  }

  easeInOutQuad(t, b, c, d): void {
    t /= d / 2;
    if (t < 1) {
      return (c / 2) * t * t + b;
    }
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  getTimeDifference(gtime): any {
    const current_time = new Date().getTime();
    const seconds = Math.floor((current_time - gtime) / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    hours = hours - days * 24;
    minutes = minutes - days * 24 * 60 - hours * 60;
    let datetime_diff;
    datetime_diff = hours + 'h ' + minutes + 'mins ago';
    if (hours < 24) {
      if (hours === 0 && minutes !== 0) {
        datetime_diff = minutes + 'mins ago';
      }
      if (minutes === 0 && hours > 0) {
        datetime_diff = hours + 'h ago';
      }
      if (hours === 0 && minutes === 0) {
        datetime_diff = 'now';
      }
    } else {
      datetime_diff = hours / 24 + 'd ago';
    }
    return datetime_diff;
  }
}
