const appointment = require("../models/Appointment");
const mongoose = require("mongoose");
const AppointmentFactory = require("../factories/AppointmentFactory");

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

    async getAll(showFinished) {
        if(showFinished) {
            return await Appointment.find();
        } else {
            let apptmnts = await Appointment.find({ 'finished': false });
            let appointments = [];

            apptmnts.forEach(appointment => {
                if(appointment.date !== undefined) {
                    appointments.push(AppointmentFactory.Build(appointment));
                }
            });

            return appointments;
        }
    }

    async GetById(id) {
        try {
            let event = await Appointment.findOne({ _id: id });
            return event;
        } catch(error) {
            console.log(error);
        }
    }

    async Finish(id) {
        try {
            await Appointment.findByIdAndUpdate(id, { finished: true });
            return true;
        } catch(error) {
            console.log(error);
            return false;
        }
    }
}

module.exports = new AppointmentService();