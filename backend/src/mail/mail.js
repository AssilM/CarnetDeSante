//fichier pour l'envoie de mail avec Nodemailer
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'carnetdesantevirtuel@gmail.com',
    pass: 'vddv xivs rssc bdai'
  }
});
const mailOptions = {
  from: 'carnetdesantevirtuel@gmail.com',
  to: 'Jeremy1perbost@gmail.com',
  subject: 'Inscription carnet de santé virtuel',
  text: 'Bonjour ceci est un mail de test pour l\'inscription au carnet de santé virtuel.'
};
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('Erreur lors de l envoie du mail:', error);
  } else {
    console.log('Email envoyé : ' + info.response);
  }
});

//nom de l'application :                    carnetdesante
//mot de passe de l'application :           vddv xivs rssc bdai
