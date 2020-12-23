const appointment = require("../models/Appointment");
const mongoose = require("mongoose");
const AppointmentFactory = require("../factories/AppointmentFactory");
const mailer = require("nodemailer");
require("dotenv").config();

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
            host: process.env.HOST,
            port: process.env.PORT,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS
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
                        to: app.email,
                        subject: app.title,
                        text: "Sua consulta está marcada para daqui a 1 hora. Compareça dentro do prazo especificado no local confirmado para a sua consulta."
                    }).then(() => {
                        console.log("E-mail enviado!")
                    }).catch(error => {
                        console.log(error)
                    })
                }
            }
        })
    }
}

module.exports = new AppointmentService();