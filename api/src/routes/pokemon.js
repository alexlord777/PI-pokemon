let express = require('express');
let router = express.Router();
const fetch = require('node-fetch');

const {Pokemon,Tipo,Pokemon_tipo}= require('../db');
//Traemos los datos 

//con Todos los poquemon 
const datosPokemonApi = async () => {

    let array = []
    for (let i = 1; i <= 20; i++) {
        const da = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}/`);
        const dats = await da.json();

        let k = {
            name: dats.name,
            id: dats.id,
            image: dats.sprites.front_default,
            type: dats.types.map(e => e.type.name)
        }

        array.push(k);
    }


    return array;
}

const DBtipos = async (id) => {
    let tipos = [];

    let dat = await Pokemon_tipo.findAll({ where: { pokemonId: id } });

  
    for (let i = 0; i < dat.length; i++) {
      let  tipo= await Tipo.findOne({ where: { id: dat[i].tipoId } })
      tipos.push(tipo.name)
    }
  
    return tipos;
  }

const datosPokemonBD=async()=>{
    let pokeDb= await Pokemon.findAll();
    
    let pokemon=pokeDb.map(e=>{
        return{
            id:e.id,
            name: e.name,
        }
    });

    let tipos=[];

    for(let i=0;i<pokemon.length;i++){
       let tipo=await DBtipos(pokemon[i].id);
       tipos.push(tipo);
    }

    for(let i=0;i<pokemon.length;i++){
        pokemon[i].tipo=tipos[i];
     }

     return pokemon;
}

       //All data
const alldata=async()=>{
    let api=await datosPokemonApi();
    let db=await datosPokemonBD();

    let total = api.concat(db);

    return total;
}

//poquemon solo
const datoPokemonApiId = async (id) => {

    const data = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
    const dataJson = await data.json();

    let k = {
        name: dataJson.name,
        id: dataJson.id,
        image: dataJson.sprites.front_default,
        type: dataJson.types.map(e => e.type.name),
        stats:{
            hp:dataJson.stats[0].base_stat,
            attack:dataJson.stats[1].base_stat,
            defense:dataJson.stats[2].base_stat,
            speed:dataJson.stats[5].base_stat,
        },
        weight:dataJson.weight,
        height:dataJson.height,
    }

    return k;
}

//rutas

router.get('/', async (req, res) => {
    try {
        let name = req.query.name;
        if(name){

          res.status(200).json(await datoPokemonApiId(name))
        }else{
            let data = await alldata();

            res.status(200).json(data);
        }
    } catch (error) {
        res.status(401).json(error);
    }
})

router.get('/:id',async (req, res) => {
     try {
        const {id}= req.params;
        if(!id) throw new Error();
   
        let data =await datoPokemonApiId(id);

        res.status(201).json(data);
        
     } catch (error) {
        res.status(401).json({error:error})
     }
})

router.post('/',async(req,res)=>{
  try {
    let {name,life,atack, deffens,speed,height,weigth,tipo}= req.body;

    const newPokemon= await Pokemon.create({
        name:name,
        life:life,
        atack:atack,
        deffens:deffens,
        speed:speed,
        height:height,
        weigth:weigth});

        
        
    for (let i = 0; i < tipo.length; i++) {

        let tip = await Tipo.findOne({ where: { id: tipo[i] } });

        newPokemon.addTipo([tip]);
      }

      res.status(201).json(newPokemon);

  } catch (error) {
      res.status(400).send(error)
  }
})

module.exports = router;