const appointment = require("../models/Appointment");
const mongoose = require("mongoose");
const AppointmentFactory = require("../factories/AppointmentFactory");
const mailer = require("nodemailer");

const Appointment = mongoose.model("Appointment", appointment);

class AppointmentService {
    async Create(name, email, description, cpf, date, time) {
        let newAppointment = new Appointment({
            name,
            email,
            description,
            cpf,
            date,
            time,
            finished: false,
            notified: false
        });

        try {
            await newAppointment.save();
            return true;
        } catch(error) {
            console.log(error);
            return false;
        }
    }

    async GetAll(showFinished) {
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

    async Search(query) {
        try {
            let apptmnt = await Appointment.find().or([{ email: query }, { cpf: query }]);
            return apptmnt;
        } catch(error) {
            console.log(error);
            return [];
        }
    }

    async SendNotification() {
        let apptmnts = await this.GetAll(false);

        let transporter = mailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 25,
            auth: {
                user: "53b2f3927a0b08",
                pass: "e8752681d6dd9d"
            }
        });

        apptmnts.forEach(async app => {
            let date = app.start.getTime();
            let hour = 1000 * 60 * 60;
            let gap = date - Date.now();

            if(gap <= hour) {
                if(!app.notified) {

                    await Appointment.findByIdAndUpdate(app.id, {notified: true});

                    transporter.sendMail({
                        from: '"Marcelo Rocha Ferreira 👻" <marceloengecomp@gmail.com>',
                        to: "marceloengecomp@gmail.com",
                        subject: "Sua consulta está marcada para daqui a 1hora",
                        text: "Compareça dentro de 1h para o local confirmado para a sua consulta."
                    }).then(() => {

                    }).catch(error => {

                    })
                }
            }
        })
    }
}

module.exports = new AppointmentService();