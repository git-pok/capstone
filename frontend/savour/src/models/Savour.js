import axios from 'axios';

const BASE_URL = "http://localhost:3000";


class Savour {
    constructor (token = null) {
        this.token = token;
    }
    /**
     * 
    */
    static async request (method, url, data = {}, params = {}, headers = {}) {
        const req = await axios({
            method,
            url,
            data,
            params,
            headers
          });
        console.log("req", req);
    }
    /** 
     * register.
     * 
    */
    static async register({username, password, first_name, last_name, email, phone}) {

        const reqs = await this.request(
            {
                endpoint: "auth/register",
                method: "post",
                data: {
                    username, password,
                    first_name, last_name,
                    email, phone
                }
            }
        );
        return reqs;
    }
}