import axios from 'axios'
export const fhirBaseUrl = 'https://fhir-bootcamp.medblocks.com/fhir'

export const fhirApi = axios.create({baseURL: fhirBaseUrl})