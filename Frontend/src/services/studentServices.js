import {apiRequest } from './api'
export function getStudents(){
return apiRequest ('/students')
}
