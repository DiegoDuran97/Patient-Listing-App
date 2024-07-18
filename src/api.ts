import axios from 'axios'
export const fhirBaseUrl = 'https://demo.kodjin.com/fhir'

export const fhirApi = axios.create({baseURL: fhirBaseUrl, headers: {
    'Cache-Control' : 'no-cache'
}})