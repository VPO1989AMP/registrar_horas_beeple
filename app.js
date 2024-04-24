const express = require("express");
const axios = require("axios");
const TOKEN = require('./token.js'); // Asegúrate de que token.js exporte el token correctamente
const app = express();
const port = process.env.PORT || 5555;

// Configuración del servidor estático
app.use(express.static("public", {
    index: "index.html"
}));

// Variables de configuración de la API
const API_TOKEN = TOKEN;
const endpoint = 'https://people.grupoconstant.com';
const apiurl = '/api/v1/admin/collaborators/worked_hours?filter[period][period_start_at]=2024-04-15&filter[period][period_end_at]=2024-04-16&filter[status]=report_now&page_items=500'

// Cabeceras para las solicitudes HTTP
const headers = {
    "Content-Type": "application/json",
    "Token": API_TOKEN
};

// Cuerpo de la solicitud PATCH
const body = {
    "state_change: `start_work`": "planned",
    "worked_hour_attributes": {
      "choice_made": "planned",
      "confirmed": true
    }
  }
  

// Función para retrasar las solicitudes
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});

// Ruta para manejar las solicitudes POST a /horas
app.post("/horas", async (req, res) => {
    try {
        // Obtener datos de horas trabajadas desde la API
        const response = await axios.get(`${endpoint}${apiurl}`, { headers });
        const worked_hours = response.data.worked_hours;

        // Iterar sobre las horas trabajadas y aprobar cada una
        for (const item of worked_hours) {
            try {
                // Aprobar el turno usando PATCH
                const response = await axios.patch(`${endpoint}/api/v1/admin/collaborators/worked_hours/${item.id}`, body, { headers });
                console.log("Turno aprobado:", item.id, item.shift.start_datetime, item.enrolment.collaborator.name);
                // Esperar un tiempo antes de la siguiente solicitud
                await delay(350); 
            } catch (error2) {
                // Manejar errores específicos de la solicitud PATCH
                console.error("Error al aprobar el turno:", error2);
            }
        }
        // Enviar respuesta de éxito al cliente
        res.status(200).json({ message: "Turnos aprobados exitosamente." });
    } catch (error) {
        // Manejar errores generales de la solicitud GET
        console.error("Error al obtener los datos de horas trabajadas:", error.response.data);
        res.status(500).json({ error: "Error al realizar la consulta." });
    }
});
