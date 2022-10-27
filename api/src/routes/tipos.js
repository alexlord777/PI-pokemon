let express = require('express');
let router = express.Router();
const { Tipo } = require('../db');
const fetch = require('node-fetch');


const tipos = async () => {
    let pokeTipos = await fetch('https://pokeapi.co/api/v2/type');
    let poke = await pokeTipos.json();

    let tipo = await poke.results.map((e,i) => {
        return {
            id:i,
            name: e.name
        }
    });

    return tipo;
}


router.get('/', async (req, res) => {
    try {
        const y = await Tipo.findAll();
        if (y.length > 0) {
            console.log('ya tiene data la bs');
            res.status(201).json(y);
        } else {
            const data = await tipos();
            Tipo.bulkCreate(data);
            const r = await Tipo.findAll();
            res.status(201).json(r);
        }

    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;