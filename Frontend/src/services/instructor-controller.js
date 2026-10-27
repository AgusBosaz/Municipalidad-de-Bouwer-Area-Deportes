import { apiRequest } from './api'
export function getInstructors() {
return apiRequest('/instructorController')
}

export function getInstructorById(id)
{
    return apiRequest(`/instructorController/${id}`)
}

export function CreateInstructor(instructor)
{
    return apiRequest('/instructorController', {
        method: 'POST',
        body: JSON.stringify(instructor)
    })
}

export function UpdateInstructor(id, instructor)
{
    return apiRequest('/instructorController/'+id, {
        method: 'PUT',
        body: JSON.stringify(instructor)
    })
}