/* eslint-disable @typescript-eslint/ban-ts-comment */
import axios from "axios"

export const API_URL = "http://174.138.46.27:5004"
type StringBool = "true" | "false"



export const requestServer = async (url:string, params:any) => {
    const nParams = {params:{id: localStorage.getItem("api_key"), ...params}}
    //@ts-ignore
    // nParams['id'] = 
    console.log(nParams)
    return await (await axios.get(API_URL + url, nParams)).data
}