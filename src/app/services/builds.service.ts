import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import { map, retry } from 'rxjs/operators';
import 'rxjs/Rx';
import 'rxjs/add/observable/interval';
@Injectable({
  providedIn: 'root'
})
export class BuildsService {
  allBuildsData: any = [];
  getGitCommitsCounts: any = [];
  modifiedData: any = [];
  constructor(private http: HttpClient) {
  }

  getSonarContent(): Observable<any[]> {
    const url = 'http://10.188.74.206:3030/sonarhtml';
    return this.http.get(url)
      .pipe(map((response: any) => response));
  }

  getAllJenkinsSonarBuilds(): any {
    const jenkinsUrl = '/jenkins/api/json?tree=jobs[name,color,builds[number,timestamp,result,color]]';
    // const sonarUrl = './assets/data/sonarHtml.json';
    const sonarUrl = 'http://10.188.74.206:3030/sonarhtml';
    const gitlabUrl = 'https://gitlab.blr.teksystems.com/api/v4/projects';
    const response1 = this.http.get(jenkinsUrl);
    const response2 = this.http.get(sonarUrl);
    const response3 = this.http.get(gitlabUrl, {
      params: {
        private_token: 'vyoZsJc6Bz_3xSMbzEb9'
      },
    });
    return Observable.forkJoin([response1, response2, response3]).pipe(
      map((response: any) => {
        const jenkinBuilds = response[0].jobs;
        const sonarContent = response[1];
        const gitlabProjects = response[2];
        const revalue = this.asyncApiCalls(jenkinBuilds, sonarContent, gitlabProjects);
        return revalue;

      }));
  }

  async asyncApiCalls(jenkinsBuilds, sonarContent, gitlabProjects) {
    const gitProjectsCommitCounts = await this.getAllGitCommits(gitlabProjects);
    const jenkinsHealth = await this.getAllJenkinsCloudsClasses(jenkinsBuilds);
    const otherJenkinsProjects = await this.getAllOtherJenkinsProjects();
    const jiraBugs = await this.getAllJiraBugs();
    return { jenkinsBuilds, sonarContent, gitProjectsCommitCounts, jenkinsHealth, otherJenkinsProjects, jiraBugs };
  }

  getAllJenkinsCloudsClasses(builds): Observable<any> {
    const observableBuildsBatch = [];
    builds.forEach((project) => {
      observableBuildsBatch.push(this.getJenkinsHealthReport(project.name).map((resp: Response) => resp));
    });
    return Observable.forkJoin(observableBuildsBatch);
  }

  getAllGitCommits(gitlabProjects): any {
    const observableBatch = [];
    gitlabProjects.forEach((project) => {
      observableBatch.push(this.getGitCommitsCount(project.id, project.name).map((res: Response) => res));
    });
    return Observable.forkJoin(observableBatch);
  }

  getGitCommitsCount(id: number, name: string): Observable<any> {
    const gitCountUrl = 'https://gitlab.blr.teksystems.com/api/v4/projects/' + id + '/repository/commits';
    return this.http.get(gitCountUrl, {
      params: {
        private_token: 'vyoZsJc6Bz_3xSMbzEb9',
        per_page: '300'
      },
    }).map((res: any) => {
      return { count: res.length, project_name: name, project_id: id };
    });
  }

  getJenkinsHealthReport(buildname: string): Observable<any> {
    const url = '/jenkins/job/' + buildname + '/api/json?tree=healthReport[iconClassName]';
    let healthClass: any = '';
    return this.http.get(url).map((res: any) => {
      healthClass = res.healthReport.length > 0 ? res.healthReport[0].iconClassName : '';
      return { 'jbuildName': buildname, 'healthClass': healthClass };
    });
  }

  getAllOtherJenkinsProjects(): Observable<any> {
    const url = '/otherjenkins/api/json?tree=jobs[name,color,builds[number,timestamp,result]]';
    return this.http.get(url).map((res: any) => {
      return res;
    });
  }

  getAllJiraBugs(): Observable<any> {
    const observableJirasBatch = [];
    const jiraProjects = [
      { 'type': 'FUL', 'name': 'FS13-Practice Master', 'buildName': 'Practice Master' },
      { 'type': '"IN"', 'name': 'FaceRecognition', 'buildName': 'face detection engine' },
      { 'type': '"IN"', 'name': 'SkillPortal', 'buildName': 'skill portal' },
      { 'type': '"IN"', 'name': 'WalkWithMe', 'buildName': 'Walk With Me' },
      { 'type': 'AP', 'name': 'TEKBaseFramework', 'buildName': 'Android Base Framework' }
    ];
    jiraProjects.forEach((jproject) => {
      observableJirasBatch.push(this.getJiraBugCount(jproject).map((resp: Response) => resp));
    });
    return Observable.forkJoin(observableJirasBatch);
  }
  getJiraBugCount(recObj): Observable<any> {
    const jUrl = encodeURI('https://jpt5.teksystems.com/rest/api/2/search?fields=self&jql=project =' + recObj.type +
    ' AND issuetype = Bug AND status in (Open, "In Progress") AND component = "' + recObj.name + '"');
    return this.http.get(jUrl).retry(2).map((res: any) => {
      return { 'jbuildName': recObj.buildName, 'jiraDetails': res };
    });

  }
}
