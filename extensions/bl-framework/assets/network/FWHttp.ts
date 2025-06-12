export class FWFormData {
    static textEncoder = new TextEncoder();
    /**form-data 数据信息 */
    public infos: any[] = []
    /**boundary值，必须与请求头对应->setRequestHeader(`Content-Type`, `multipart/form-data; boundary=${boundary}` */
    public boundary_key: string = `customformdata`
    /**参数的boundary */
    public boundary: string = `--${this.boundary_key}`
    /**结尾的boundary */
    public end_boundary: string = `${this.boundary}--`
    /**添加一个参数 */
    public append(key: string, value: any, filename?: string) {
        this.infos.push(`\r\n`);
        this.infos.push(`${this.boundary}\r\n`);
        if (filename) {
            this.infos.push(`Content-Disposition: form-data; name="${key}"; filename="${filename}"\r\n`);
            this.infos.push(`Content-Type: image/png\r\n\r\n`);
        } else {
            this.infos.push(`Content-Disposition: form-data; name="${key}"\r\n\r\n`);
        }
        this.infos.push(value);
    }
    /**添加参数（为了和浏览器FormData格式一致） */
    public set(key: string, value: any, filename?: string) {
        this.append(key, value, filename);
    }
    /**转ArrayBuffer */
    public get arrayBuffer(): ArrayBuffer {
        let bytes: number[][] = [];
        this.infos.push(`\r\n${this.end_boundary}`);
        this.infos.forEach(element => {
            if (typeof element == `string`) {
                bytes.push(Array.prototype.slice.call(FWFormData.textEncoder.encode(element)));
                // bytes.push(app.func.stringToUtf8(element));
            } else if (element instanceof ArrayBuffer) {
                bytes.push(Array.prototype.slice.call(new Uint8Array(element)));
            } else if (element instanceof Uint8Array) {
                let array: number[] = [];
                for (let i = 0; i < element.length; i++) {
                    array.push(element[i]);
                }
                bytes.push(array);
            }
        });
        let data: number[] = [];
        for (let v of bytes) {
            for (let n of v) {
                data.push(n);
            }
        }
        return new Uint8Array(data).buffer;
    }
}

type AnyKeyType = string | number | symbol
type AnyObjectType = { [key: AnyKeyType]: any }

export class FWHttp {
    xhr:XMLHttpRequest;
    url:string;
    body: Document | XMLHttpRequestBodyInit | null = null;
    params: AnyObjectType | null = null;

    onComplete:(error: Error, response?: any) => void;
    constructor(url:string) {
        this.url = url;
        this.xhr = new XMLHttpRequest();
        this.xhr.onload = this.onload.bind(this);
        this.xhr.onerror = this.onerror.bind(this);
        this.xhr.ontimeout = this.ontimeout.bind(this);
        this.xhr.onabort = this.onabort.bind(this);
        this.xhr.withCredentials = false;
        this.xhr.responseType = "json";
        this.xhr.timeout = 8000;
        this.xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded")
    }

    private onload() {
        if (this.xhr.status === 200 || this.xhr.status === 0) {
            this.onComplete?.(null, this.xhr.response);
        } else { 
            this.onFail("no response"); 
        }
    }

    private onerror() {
        this.onFail("error"); 
    }

    private ontimeout() {
        this.onFail("time out"); 
    }

    private onabort() {
        this.onFail("abort"); 
    }

    private onFail(msg:string) {
        this.onComplete?.(new Error(`${this.errInfo}${this.xhr.status}(${msg})`));
    }

    get errInfo() {
        return `post failed: ${this.url}, status: `;
    }

    post() {
        this.xhr.open("POST", this.url, true);
        this.xhr.send(this.body)
    }

    get() {
        this.xhr.open("GET", this.url, true);
        this.xhr.send()
    }


    static splicingParams(params): string {
        return Object.keys(params).sort().map((element, index) => {
            return `${element}=${params[element]}`;
        }).join('&');
    }
}