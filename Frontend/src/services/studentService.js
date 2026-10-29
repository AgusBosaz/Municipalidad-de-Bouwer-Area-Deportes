import {apiRequest} from './api'

export function getStudent(){
    return apiRequest('/Students')
}