import {Object} from './object.js'
import { Ship } from './ship.js';
import { Asteroid } from './asteroid.js';
import { Label } from './label.js';
import { Enemy } from './enemy.js';
import { Star } from './star.js';
//este es el script principal, aqui se ejecuta todo y 
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const spritesheet = document.getElementById("spritesheet");
const font = window.getComputedStyle(document.body).fontFamily;
const fontWeight =  window.getComputedStyle(document.body).fontWeight;
const menu = document.querySelector(".menu");
const score = document.querySelector(".score");
const btnMenu = document.querySelector(".play-game");
canvas.width = 900;
canvas.height = 600;
let hitBox = false;
let menuStatus = true;
let play = false;
let scoreCount = 0;

const ship = new Ship(ctx,spritesheet,canvas);
const asteroids = [];
const labels = [];
const enemys = [];
const projectilesEnemys = [];
const stars = [];

btnMenu.addEventListener("click",()=>{
    init();
});
function gameOver(){//funcion para acabar
    const puntuacion = score;
    const nombre = prompt("Has perdido. Introduce tu nombre de usuario:");

    hitBox = true;
    play = false;
    setTimeout(()=>{
        menu.style.display = "flex";
        menuStatus = true;
    },1500);
}
function init(){//funcion inicio de juego
    hitBox = false;
    asteroids.length = 0;
    labels.length = 0;
    enemys.length = 0;
    projectilesEnemys.length = 0;
    ship.position = {x:200,y:200};
    ship.projectiles.length = 0;
    ship.angle = 0;
    ship.speed = 0;
    menu.style.display = "none";
    menuStatus = false;
    play = true;
    scoreCount =0;
    score.innerHTML = scoreCount;
}
function createStars(){ //genera las estrellas del fondo
    for(let i = 0; i<5; i++){
        let star = new Star(
            ctx,
            canvas,
            {
                x:Math.random() * (canvas.width),
                y:Math.random() * (canvas.height)
            },
            Math.random() * (1.5 - 1) + 1,
            1
        );
        stars.push(star);
    }
    for(let i = 0; i<45; i++){
        let star = new Star(
            ctx,
            canvas,
            {
                x:Math.random() * (canvas.width),
                y:Math.random() * (canvas.height)
            },
            Math.random() * (1.5 - 1) + 1,
            2
        );
        stars.push(star);
    }
}
function generateEnemys(){//genera enemigos
    setInterval(()=>{
        let enemy = new Enemy(ctx,spritesheet,canvas,ship);
        enemy.generatePosition(canvas);
        enemys.push(enemy);
        setTimeout(()=>{
            enemy.death = true;
        },3000);
    },7000);
}
function collision(object1,object2){//funcion que controla las colisiones
    let v1 = object1.position;
    let v2 = object2.position;

    let v3 = {
        x:v1.x-v2.x,
        y:v1.y-v2.y
    }

    let distance = Math.sqrt(v3.x*v3.x + v3.y*v3.y);

    if(distance < object1.image.radio + object2.image.radio){
        return true;
    }
    return false;
}
function createMeteors(position){ //crea meteoritos
    let count = Math.floor(Math.random() * (5 - 3 + 1)) + 3;
    for(let i=0; i< count; i++){
        let meteor = new Asteroid(ctx,spritesheet,position,3);
        meteor.death = true;
        asteroids.push(meteor);
    }
}
function collisionObjects(){//funcion que controla las las colisiones con entre varios objetos 
    for(let j = 0; j < asteroids.length ; j++){
        if( collision(asteroids[j],ship)){
            gameOver();
        }
    }
    for(let i = 0; i< enemys.length;i++){
        if( collision(enemys[i],ship)){
            gameOver();
        }
    }
    for(let i = 0; i< projectilesEnemys.length; i++){
        if( collision(projectilesEnemys[i],ship) ){
            gameOver();
        }
    }
    loop1:
    for(let i = 0; i< ship.projectiles.length; i++){
        for(let j = 0; j < enemys.length; j++){
            if(collision(ship.projectiles[i],enemys[j])){
                setTimeout(()=>{
                    let text = new Label(ctx,enemys[j].position,"+20 SCORE","#36AAE9",font,fontWeight);
                    labels.push(text);
                    ship.projectiles.splice(i,1);
                    enemys.splice(j,1);
                    scoreCount += 20;
                    score.innerHTML = scoreCount;
                },0);
                break loop1;
            }
        }
    }
    loop2:
    for(let i = 0; i< ship.projectiles.length; i++){
        for(let j = 0; j < asteroids.length ; j++){
            if( collision(ship.projectiles[i],asteroids[j]) ){
                setTimeout(()=>{
                    if(asteroids[j].type === 1){
                        let text = new Label(ctx,asteroids[j].position,"+10 SCORE","#5CCB5F",font,fontWeight);
                        labels.push(text);
                        ship.projectiles.splice(i,1);
                        asteroids.splice(j,1);
                        scoreCount += 10;
                        score.innerHTML = scoreCount;
                    }
                    else if(asteroids[j].type === 2){
                        createMeteors(asteroids[j].position);
                        ship.projectiles.splice(i,1);
                        asteroids.splice(j,1);
                    }
                    else{
                        let text = new Label(ctx,asteroids[j].position,"+5 SCORE","white",font,fontWeight);
                        labels.push(text);
                        ship.projectiles.splice(i,1);
                        asteroids.splice(j,1);
                        scoreCount += 5;
                        score.innerHTML = scoreCount;
                    }
                   
                },0);
                break loop2;
            }
        }
    }
}
function generateAsteroids(){//genera esteroides
    setInterval(()=>{
        let type = Math.floor(Math.random() * (2)) + 1;
        let asteroid = new Asteroid(ctx,spritesheet,{x:0,y:0},type);
        asteroid.generatePosition(canvas);
        asteroids.push(asteroid);
        setTimeout(()=>{
            asteroid.death = true;
        },3000);
    },500);
}
function background(){//funcion del fondo 
    ctx.fillStyle = "#130000";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    stars.forEach((star)=>{
        star.update();
    });
}
function updateObjects(){
    ship.update(hitBox);
    asteroids.forEach((asteroid,i)=>{
        asteroid.update(hitBox);
        if(asteroid.collision(canvas)){
            setTimeout(()=>{
                asteroids.splice(i,1);
            },0);     
        }
    });
    labels.forEach((label,i)=>{
        label.update();
        if(label.opacity<=0){
            labels.splice(i,1);
        }
    });

    projectilesEnemys.forEach((projectile)=>{
        projectile.update(hitBox);
    });
    enemys.forEach((enemy,i)=>{
        enemy.update(hitBox);
        enemy.createProjectile(projectilesEnemys);
        if( enemy.collision(canvas)){
            setTimeout(()=>{
                enemys.splice(i,1);
            },0);
        }
    });
}
function update(){
    
    if(menuStatus){
        background();
    }
    else if(play){
        background();
        collisionObjects();
        updateObjects();
    }
    requestAnimationFrame(update);
}


const guardarEnXML = (user, scoreCount) => {
    let xml = localStorage.getItem("dataBase.xml");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");

    const usuariosNodo = xmlDoc.getElementsByTagName("usuarios")[0];
    const usuarios = Array.from(usuariosNodo.getElementsByTagName("usuario"));

    let esNuevoRecord = false;

    // Obtener la fecha y hora actual
    const fechaActual = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD
    const horaActual = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); // Formato HH:MM:SS

    // Verificar si el usuario ya existe
    const usuarioExistente = usuarios.find(usuario =>
        usuario.getElementsByTagName("user")[0]?.textContent === user
    );

    if (usuarioExistente) {
        // Si el usuario existe, comprobar la puntuación
        const puntuacionExistente = parseInt(usuarioExistente.getElementsByTagName("puntos")[0]?.textContent, 10);
        if (puntuacion > puntuacionExistente) {
            // Sobrescribir los datos si la nueva puntuación es mayor
            usuarioExistente.getElementsByTagName("puntos")[0].textContent = puntuacion;
            usuarioExistente.getElementsByTagName("tiempo")[0].textContent = tiempo;
            usuarioExistente.getElementsByTagName("reinicio")[0].textContent = reinicio;
            usuarioExistente.getElementsByTagName("movimientos")[0].textContent = movimientos;
            usuarioExistente.getElementsByTagName("fecha")[0].textContent = fechaActual; // Actualizar la fecha
            usuarioExistente.getElementsByTagName("hora")[0].textContent = horaActual; // Actualizar la hora
            console.log(`Puntuación actualizada para el alias: ${alias}`);
            esNuevoRecord = true;
        } else {
            console.log(`La puntuación no es mayor. No se actualizó el alias: ${alias}`);
        }
    } else {
        // Si el alias no existe y hay menos de 10 usuarios, agregar un nuevo usuario
        if (usuarios.length < 10) {
            const nuevoUsuario = xmlDoc.createElement("usuario");
            nuevoUsuario.innerHTML = `
                <alias>${alias}</alias>
                <puntos>${puntuacion}</puntos>
                <tiempo>${tiempo}</tiempo>
                <reinicio>${reinicio}</reinicio>
                <movimientos>${movimientos}</movimientos>
                <fecha>${fechaActual}</fecha>
                <hora>${horaActual}</hora>
            `;
            usuariosNodo.appendChild(nuevoUsuario);
            esNuevoRecord = true;
        } else {
            // Si hay 10 usuarios, verificar si el nuevo usuario puede reemplazar al último
            const usuariosOrdenados = usuarios.sort((a, b) => {
                const puntosA = parseInt(a.getElementsByTagName("puntos")[0]?.textContent, 10);
                const puntosB = parseInt(b.getElementsByTagName("puntos")[0]?.textContent, 10);
                if (puntosA === puntosB) {
                    const reiniciosA = parseInt(a.getElementsByTagName("reinicio")[0]?.textContent, 10);
                    const reiniciosB = parseInt(b.getElementsByTagName("reinicio")[0]?.textContent, 10);
                    return reiniciosA - reiniciosB; // Ordenar por menos reinicios en caso de empate
                }
                return puntosB - puntosA; // Ordenar por puntuación de mayor a menor
            });

            const ultimoUsuario = usuariosOrdenados[usuariosOrdenados.length - 1];
            const puntosUltimo = parseInt(ultimoUsuario.getElementsByTagName("puntos")[0]?.textContent, 10);
            const reiniciosUltimo = parseInt(ultimoUsuario.getElementsByTagName("reinicio")[0]?.textContent, 10);

            if (
                puntuacion > puntosUltimo ||
                (puntuacion === puntosUltimo && reinicio < reiniciosUltimo)
            ) {
                // Reemplazar al último usuario
                usuariosNodo.removeChild(ultimoUsuario);

                const nuevoUsuario = xmlDoc.createElement("usuario");
                nuevoUsuario.innerHTML = `
                    <alias>${alias}</alias>
                    <puntos>${puntuacion}</puntos>
                    <tiempo>${tiempo}</tiempo>
                    <reinicio>${reinicio}</reinicio>
                    <movimientos>${movimientos}</movimientos>
                    <fecha>${fechaActual}</fecha>
                    <hora>${horaActual}</hora>
                `;
                usuariosNodo.appendChild(nuevoUsuario);
                esNuevoRecord = true;
                console.log(`El usuario ${alias} reemplazó al último usuario en la base de datos.`);
            } else {
                console.log(`El usuario ${alias} no tiene mejor puntuación o menos reinicios que el último usuario.`);
            }
        }
    }

    // Limitar la base de datos a los 10 mejores usuarios
    const usuariosActualizados = Array.from(usuariosNodo.getElementsByTagName("usuario"))
        .sort((a, b) => {
            const puntosA = parseInt(a.getElementsByTagName("puntos")[0]?.textContent, 10);
            const puntosB = parseInt(b.getElementsByTagName("puntos")[0]?.textContent, 10);
            if (puntosA === puntosB) {
                const reiniciosA = parseInt(a.getElementsByTagName("reinicio")[0]?.textContent, 10);
                const reiniciosB = parseInt(b.getElementsByTagName("reinicio")[0]?.textContent, 10);
                return reiniciosA - reiniciosB; // Ordenar por menos reinicios en caso de empate
            }
            return puntosB - puntosA; // Ordenar por puntuación de mayor a menor
        })
        .slice(0, 10);

    // Limpiar los usuarios existentes y agregar los actualizados
    usuariosNodo.innerHTML = "";
    usuariosActualizados.forEach(usuario => usuariosNodo.appendChild(usuario));

    // Guardar los datos actualizados en localStorage
    const serializer = new XMLSerializer();
    localStorage.setItem("EstadisticasXML", serializer.serializeToString(xmlDoc));
    console.log("Datos guardados en EstadisticasXML:", serializer.serializeToString(xmlDoc));

    return esNuevoRecord;
};
update();
generateAsteroids();
generateEnemys();
createStars();
