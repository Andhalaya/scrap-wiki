const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const app = express();

const urlCategorias = 'https://es.wikipedia.org';
const url = `${urlCategorias}/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap`;

app.get('/', async (req, res) => {
    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);

            const linksPagina = [];
        
            $('#mw-pages a').each((index, element) => {
                const urlPagina = $(element).attr('href');
                linksPagina.push(`${urlCategorias}${urlPagina}`);
            });

            const datosCompletos = [];

            for (const link of linksPagina) {
                const respuestaPagina = await axios.get(link);
                const html = respuestaPagina.data;
                const $ = cheerio.load(html);

                const pageTitle = $('title').text();
                const texts = $('p').map((index, element) => $(element).text()).get();
                const imgs = $('img').map((index, element) => $(element).attr('src')).get();

                datosCompletos.push({
                    pageTitle,
                    texts,
                    imgs,
                });
            }

            res.send(`
                <h1>Datos Completos</h1>
                ${datosCompletos.map(data => `
                    <div>
                        <h2>${data.pageTitle}</h2>
                        <ul>${data.texts.map(text => `<li>${text}</li>`).join('')}</ul>
                        <h3>Imagenes</h3>
                        <ul>${data.imgs.map(img => `<li><a href="${urlCategorias}/${img}">${img}</a></li>`).join('')}</ul>
                    </div>
                `).join('')}
            `);
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Error en el servidor');
    }
});

app.listen(3000, () => {
    console.log('Express está escuchando en el puerto http://localhost:3000');
});
