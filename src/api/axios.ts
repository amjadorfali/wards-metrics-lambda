import axios from 'axios';
import {HealthCheck} from "../model/HealthCheck";
import {getAssertionFunc} from "../service/AssertionService";


export const sendRequest = async (task: HealthCheck) => {
  try {
    let headers
    if (task.headers) {
      headers = task.headers.reduce(
        (obj, header) => Object.assign(obj, {[header.type]: header.value}), {});
    }

    return await axios({
      method: task.method,
      url: task.url,
      headers: headers,
      timeout: task.timeout
    })
  } catch (err) {

  }


}

