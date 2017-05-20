import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable as $ } from 'rxjs/Observable';

export class GithubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: Repo[]
}

@Injectable()
export class GithubService {
  private baseUrl: string = 'https://api.github.com/';

  constructor(private http: Http) { }

  searchRepos(q: string) {
    return this.http.get(`${this.baseUrl}search/repositories`, {params: {q}})
      .map(response => response.json()) as $<GithubSearchResponse>;
  }
}

export class Repo {
  id: number;
  full_name: string;
  stargazers_count?: number;
  watchers_count?: number;
  forks_count?: number;
}
