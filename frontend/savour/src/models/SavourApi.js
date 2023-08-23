import axios from 'axios';

const BASE_URL = "http://localhost:3000";
const jsonHeader = { "Content-Type": "application/json" };


class Savour {
    constructor (token = null) {
        this.token = token;
    }
    /**
     * 
    */
    static async request (method, url, data = {}, params = {}, headers = {}) {
        console.log("REQ ARGS", method, url, data, params, headers);
        // const jsonData = JSON.stringify(data);
        const req = await axios({
            method,
            url: `${BASE_URL}${url}`,
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
    // static async register({username, password, first_name, last_name, email, phone}) {

    //     const reqs = await this.request(
    //         {
    //             endpoint: "auth/register",
    //             method: "post",
    //             data: {
    //                 username, password,
    //                 first_name, last_name,
    //                 email, phone
    //             }
    //         }
    //     );
    //     return reqs;
    // }
}

export default Savour;