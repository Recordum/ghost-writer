export const HttpClientToken = 'HttpClientToken';
export interface IHttpClient {
  get(): this;
  post(): this;
  // 여기는 빌더 패턴으로 가져간다?
  // 그리고 axios, got 등을 일단 만들어 둔다.
}

export const HttpClientVer2Token = 'HttpClientVer2Token';
export interface IHttpClientVer2 {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, body: any): Promise<T>;
  put<T>(url: string, body: any): Promise<T>;
  patch<T>(url: string, body: any): Promise<T>;
  delete<T>(url: string): Promise<T>;
  options<T>(url: string): Promise<T>;
  head<T>(url: string): Promise<T>;
  request<T>(url: string, method: string, body: any): Promise<T>;
}

// Interface화를 해서 구현을 할 지 말지 고민 중
// Builder 패턴을 따라서 다 구현을 해두고 의존성 주입을한다.?
