# Diagrama UML - Área de Deportes

```mermaid
classDiagram
    direction TB

    class User {
        <<abstract>>
        +id: int
        +firstName: string
        +lastName: string
        +dni: string
        +gender: string
        +phoneNumber: string
        +address: string
        +birthDate: date
        +createdAt: date
        +updatedAt: date
        +isActive: bool
        +passwordHash: string?
        +login(identifier, password) bool
        +logout() void
        +viewActivitySchedule() Activity[]
    }

    class Role {
        +id: int
        +name: string
        +description: string
    }

    class Permission {
        +id: int
        +name: string
        +description: string
    }

    class Instructor {
        +specialty: string
        +enrollStudent(student, activity) Enrollment
        +uploadDocumentation(student, document) void
        +viewMedicalRecord(student) MedicalRecord
        +recordAttendance(activity, date) Attendance
    }

    class Coordinator {
        +createActivity(activity) void
        +updateActivity(activity) void
        +deleteActivity(id) void
        +listActivities() Activity[]
        +createInstructor(instructor) void
        +updateInstructor(instructor) void
        +deleteInstructor(id) void
        +assignActivityToInstructor(instructor, activity) void
        +enrollStudent(student, activity) Enrollment
        +uploadDocumentation(student, document) void
        +viewMedicalRecord(student) MedicalRecord
    }

    class Activity {
        +id: int
        +name: string
        +category: AgeCategory
        +startTime: time
        +endTime: time
        +maximumCapacity: int
    }

    class InstructorActivity {
        +id: int
        +instructorId: int
        +activityId: int
    }

    class StudentActivity {
        +id: int
        +studentId: int
        +activityId: int
    }

    class AgeCategory {
        <<enumeration>>
        Children
        Teenagers
        OlderAdults
    }

    class Student {
        +emergencyContactName: string
        +emergencyContactPhoneNumber: string
    }

    class Enrollment {
        +id: int
        +studentActivityId: int
        +enrollmentDate: date
        +status: string
    }

    class Documentation {
        +id: int
        +studentId: int
        +type: string
        +fileUrl: string
        +uploadedAt: date
    }

    class MedicalRecord {
        +id: int
        +studentId: int
        +diseases: string
        +cus: string
        +observations: string
    }

    class StudentAttendance {
        +id: int
        +studentActivityId: int
        +date: date
        +isPresent: bool
    }

    class InstructorAttendance {
        +id: int
        +instructorActivityId: int
        +date: date
        +isPresent: bool
    }

    User <|-- Student
    User <|-- Instructor
    User <|-- Coordinator
    User "*" --> "*" Role : has
    Role "*" --> "*" Permission : grants

    Coordinator "1" --> "*" Instructor : manages
    Coordinator "1" --> "*" Activity : manages
    Coordinator "1" --> "*" InstructorActivity : assigns
    Instructor "1" --> "*" InstructorActivity : referenced by
    Activity "1" --> "*" InstructorActivity : referenced by
    Activity --> AgeCategory : classified by

    Student "1" --> "*" Documentation : owns
    Student "1" --> "1" MedicalRecord : owns
    Student "1" --> "*" StudentActivity : participates
    Activity "1" --> "*" StudentActivity : receives
    StudentActivity "1" --> "*" Enrollment : records
    StudentActivity "1" --> "*" StudentAttendance : records
    InstructorActivity "1" --> "*" InstructorAttendance : records
```
