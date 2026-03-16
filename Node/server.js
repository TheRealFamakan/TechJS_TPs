const http = require("http");  // creation dyal server 
const fs = require("fs");      // hadi pour lire le fichier html

const server = http.createServer((req, res) => {

    if (req.url === "/home") {  // uniquement via ce chemin 

        fs.readFile("index.html", (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end("Erreur serveur");
                return;
            }

            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
        });

    } else { // error pour les autres chemin

        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 - Page not found");

    }

});

server.listen(3000, () => { // mon derver ecoute sur le port 3000
    console.log("Server running on http://localhost:3000");
});