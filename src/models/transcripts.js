import mongoose from "mongoose";

const costumerschema = mongoose.Schema(
    {
        "costumerId": Number,
        "costumerName": String,
        "costumerEmail": String,
        "costumerPhone": Number,

    }, { _id: false }
)


const academicTranscriptsSchema = mongoose.Schema(
    {
        "studentEmail": String,
        "studentName": String,
        "academicHistory": [academicHistorySchema],
        "summary": {
            "totalCreditsEarned": Number,
            "averageGrade": Number
        }
    }, { _id: false }
)

export const AcademicTranscripts = mongoose.model(
    "academicTranscripts",
    academicTranscriptsSchema
)