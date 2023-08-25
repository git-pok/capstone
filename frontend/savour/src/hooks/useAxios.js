import { useState, useEffect } from 'react';
import SavourApi from '../models/SavourApi.js';

const useAxios = (resource, optionsObj) => {
  const [ reqData, setReqData ] = useState(null);
  console.log("useAxios RAN");
  const { method = null, url = null, data = null, params = null, headers = null } = optionsObj;
  console.log("useAxios HOOK ARGS", method, url, data, params, headers);
  useEffect(() => {
    const axiosReq = async (method, url, data, params, headers) => {
      console.log("useAxios FNC ARGS", method, url, data, params, headers);
      const req = await SavourApi.request(method, url, data, params, headers);
      setReqData(() => req.data);
      // console.log("req console", req);
    }

    axiosReq(method, url, data, params, headers);
  }, [resource]);

  return [reqData];
}

export default useAxios;