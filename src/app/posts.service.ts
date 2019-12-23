import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpEventType
} from "@angular/common/http";
import { Post } from "./post.model";
import { map, catchError, tap } from "rxjs/operators";
import { Subject, throwError } from "rxjs";

@Injectable({ providedIn: "root" })
export class PostsService {
  error = new Subject<string>();

  constructor(private http: HttpClient) {}

  createAndStorePost(title: string, content: string) {
    const postData: Post = { title: title, content: content };
    this.http
      .post<{ name: string }>(
        "https://angular-http-request-e3e1e.firebaseio.com/posts.json",
        postData,
        {
          observe: "response"
        }
      )
      .subscribe(
        responseData => {
          console.log(responseData);
        },
        error => {
          this.error.next = error.message;
        }
      );
  }

  fetchPosts() {
    //For multiple params
    let searchParams = new HttpParams();
    searchParams = searchParams.append("print", "pretty");
    searchParams = searchParams.append("Custom", "key");

    return this.http
      .get(
        // .get<{ [key: string]: Post }>(
        "https://angular-http-request-e3e1e.firebaseio.com/posts.json",
        {
          headers: new HttpHeaders({
            "Custom-Header": "Hello",
            AditionalHeader: "Another header",
            ThirdHeader: "Third"
          }),
          params: searchParams, //Multiple params
          //params: new HttpParams().set('print', 'pretty') - SINGLE PARAMS
          responseType: "json"
        }
      )
      .pipe(
        map(responsedata => {
          const postsArray: Post[] = [];
          for (const key in responsedata) {
            if (responsedata.hasOwnProperty(key)) {
              postsArray.push({ ...responsedata[key], id: key });
            }
          }
          return postsArray;
        }),
        catchError(errorRes => {
          // Send to analytics server
          return throwError(errorRes);
        })
      );
  }

  deletePosts() {
    return this.http
      .delete("https://angular-http-request-e3e1e.firebaseio.com/posts.json", {
        observe: "events",
        responseType: "text" //text, blob(files),json
      })
      .pipe(
        tap(event => {
          console.log(event);
          if (event.type === HttpEventType.Sent) {
            // ...
          }
          if (event.type === HttpEventType.Response) {
            console.log(event.body);
          }
        })
      );
  }
}
