import axios from 'axios';


const BASE_URL = "http://localhost:3000";
class Savour {
    constructor (token = null) {
        this.token = token;
    }
    /**
     * request
     * Makes a request.
     * Arguments: method, url, data, params, headers
     * const data = { username: "b" };
     * request("post", "/users/register", data) =>
     * user object returned from route.
    */
    static async request (method, url, data = {}, params = {}, headers = {}) {
        console.log("REQ ARGS", method, url, data, params, headers);
        const req = await axios({
            method,
            url: `${BASE_URL}${url}`,
            data,
            params,
            headers
          });
        console.log("req", req);
        return req;
    }
}

export default Savour;