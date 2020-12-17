const appointment = require("../models/Appointment");
const mongoose = require("mongoose");

const Appointment = mongoose.model("Appointmente", appointment);

class AppointmentService {
    async Create(name, email, description, cpf, date, time) {
        let newAppointment = new Appointment({
            name,
            email,
            description,
            cpf,
            date,
            time,
            finished: false
        });

        try {
            await newAppointment.save();
            return true;
        } catch(error) {
            console.log(error);
            return false;
        }
    }
}

module.exports = new AppointmentService();