import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable()
export class AuthenticationHeaders implements HttpInterceptor {
    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        const base64Credential: string = btoa('akapulak:133258c302a1ffcda392fc6d3475b5e4');
        const base64Credential2: string = btoa('Tek_Jenkin_admin:tek123456');
        const base64CredentialJira: string = btoa('AKAPULAK:TEKash@143');
        const jenkins = /jenkins/gi;
        const jenkins2 = /otherjenkins/gi;
        let duplicate;
        if (req.url.search(jenkins) === 1) {
            duplicate = req.clone({
                setHeaders: {
                    Authorization: 'Basic ' + base64Credential,
                    Accept: 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': 'true',
                }
            });
        } else if (req.url.search(jenkins2) === 1) {
            duplicate = req.clone({
                setHeaders: {
                    Authorization: 'Basic ' + base64Credential2,
                    Accept: 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': 'true',
                }
            });
        } else {
            const patt = new RegExp('jpt5.teksystems.com');
            const checkJira = patt.test(req.url);
            if (checkJira) {
                duplicate = req.clone({
                    setHeaders: {
                        Authorization: 'Basic ' + base64CredentialJira,
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                        'Access-Control-Allow-Headers': 'authorization'
                    }
                });
            } else {
                duplicate = req.clone({
                    setHeaders: {
                        //  'X-Frame-Options': 'SAMEORIGIN',
                        // 'X-Content-Security-Policy': "allow 'self'; options inline-script eval-script; frame-ancestors 'self'"
                    }
                });
            }

        }
        return next.handle(duplicate);
    }
}
