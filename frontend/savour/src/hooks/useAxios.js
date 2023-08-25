import { useState, useEffect } from 'react';
import SavourApi from '../models/SavourApi.js';

const useAxios = (url, optionsObj) => {
  // console.log("useAxios RAN");
  // const { method = null, data = null, params = null, headers = null } = optionsObj;
  // console.log("HOOK ARGS", method, url, data, params, headers);
  // const [ reqData, setReqData ] = useState(url);
  // useEffect(() => {
  //   const axiosReq = async (method, url, data, params, headers) => {
  //     console.log("FNC ARGS", method, url, data, params, headers);
  //     const req = await SavourApi.request(method, url, data, params, headers);
  //     setReqData(() => req);
  //     console.log("req", req);
  //   }
  // }, [url]);

  // return [reqData];
}

export default useAxios;