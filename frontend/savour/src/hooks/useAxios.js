import { useState } from 'react';
import SavourApi from './models/SavourApi.js';

const useAxios = (stateData, method, url, data = {}, params = {}, headers = {}) => {
  console.log("useAxios RAN");
  console.log("HOOK ARGS", stateData, method, url, data, params, headers);
  const [ reqData, setReqData ] = useState(null);
  useEffect(() => {
    const axiosReq = async (stateData, method, url, data, params, headers) => {
      console.log("FNC ARGS", stateData, method, url, data, params, headers);
      const req = await SavourApi.request(method, url, data, params, headers);
      console.log("req", req);
    }
  }, [url]);

  return [reqData, setReqData];
}

export default useAxios;