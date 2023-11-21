let paso=1;
let pasoInicial=1;
let pasoFinal=3; 

const cita = {
    id:'',
    nombre: '',
    fecha: '',
    hora: '',
    servicios: [] 
}

document.addEventListener('DOMContentLoaded',function(){
    iniciarApp();
});

function iniciarApp(){
    mostrarSeccion(); // Muestra y oculta las secciones
    tabs(); //Cambia de seccion cuando se seleccionan los tabs
    botonesPaginador(); //agrega y oculta los botones del paginador
    paginaSiguiente();
    paginaAnterior();
    
    consultarAPI(); //consulta la API en el backend de php
    
    idCliente(); //
    nombreCliente();//añade nombre del cliente de cita
    seleccionarFecha();//añade la fecha de la cita en el objeto
    seleccionarHora();// añade la hora de la cita al objeto

    mostrarResumen(); //Muestra un resumen de la cita

}

function mostrarSeccion(){
    //Ocultar secciones 
    const seccionAnterior = document.querySelector('.mostrar');
    if(seccionAnterior){  
        seccionAnterior.classList.remove('mostrar');
    }


    //Selecciona la seccion con el paso
    const pasoSelector = `#paso-${paso}`;
    const seccion = document.querySelector(pasoSelector);
    seccion.classList.add('mostrar');    
    //Eliminar clase actual anterior 

    const tabAnterior = document.querySelector('.actual');
    if(tabAnterior){
        tabAnterior.classList.remove('actual');
    }

    //Resaltar tab actual

    const tab=document.querySelector(`[data-paso="${paso}"]`);
    tab.classList.add('actual');


}

function tabs(){
    const botones = document.querySelectorAll('.tabs button');
    
    botones.forEach( boton=> {
        boton.addEventListener('click',function(e){
            paso = parseInt(e.target.dataset.paso);
            mostrarSeccion();
            botonesPaginador();
        })
    } )

}

function botonesPaginador(){
    const paginaAnterior = document.querySelector('#anterior'); 
    const paginaSiguiente = document.querySelector('#siguiente');
    
    if(paso === 1){
        paginaAnterior.classList.add('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    }
    else if(paso === 3){
        paginaSiguiente.classList.add('ocultar');
        paginaAnterior.classList.remove('ocultar');

        mostrarResumen();

    }
    else{
        paginaSiguiente.classList.remove('ocultar');
        paginaAnterior.classList.remove('ocultar');
    }
    mostrarSeccion();
}

function paginaAnterior(){
    const paginaAnterior= document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', function(){
        if(paso<=pasoInicial) return;
        
        paso--;
        botonesPaginador();

    });
}

function paginaSiguiente(){
    const paginaAnterior= document.querySelector('#siguiente');
    paginaAnterior.addEventListener('click', function(){
        if(paso>=pasoFinal) return;
        
        paso++;
        botonesPaginador();

    });
}

async function consultarAPI(){

    try{
        const url = `/api/servicios`;
        const resultado = await fetch(url);
        const servicios = await resultado.json();
        mostrarServicios(servicios);
    } catch(error){
        console.log(error);
    }
}

function mostrarServicios(servicios){
    servicios.forEach(servicio =>{
        const {id , nombre , precio} = servicio;

        const nombreServicio = document.createElement('P');
        nombreServicio.classList.add('nombre-servicio');
        nombreServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.classList.add('precio-servicio');
        precioServicio.textContent = `$${precio}`;

        const servicioDiv = document.createElement('DIV');
        servicioDiv.classList.add('servicio');
        servicioDiv.dataset.idServicio = id;
        servicioDiv.onclick = function(){
            seleccionarServicio(servicio);
        }

        servicioDiv.appendChild(nombreServicio);
        servicioDiv.appendChild(precioServicio);

        document.querySelector('#servicios').appendChild(servicioDiv);

    });
}

function seleccionarServicio(servicio){
    const {id}=servicio; 
    const {servicios} = cita;
    //identifica el elemento seleccionado
    const divServicio = document.querySelector(`[data-id-servicio="${id}"]`);
    
    //Comprobar si el servicio fue agregado, sino eliminarlo
    if( servicios.some( agregado => agregado.id === id) ){
        cita.servicios = servicios.filter( agregado => agregado.id !== id );
        divServicio.classList.remove('seleccionado');
    }
    else{
        cita.servicios = [...servicios, servicio];
        //cita.servicios.push(servicio);
        divServicio.classList.add('seleccionado');
        
    }

    //console.log(servicio);

}

function idCliente(){
    cita.id= document.querySelector('#id').value;  

}

function nombreCliente(){
    cita.nombre = document.querySelector('#nombre').value;  
}

function seleccionarFecha(){
    const inputFecha = document.querySelector('#fecha');
    inputFecha.addEventListener('input',function(e){
        const dia = new Date(e.target.value).getUTCDay();
        if([6, 0].includes(dia)){
            e.target.value = '';
            mostrarAlerta('Fines de semana no hábiles', 'error','.formulario');
        }
        else{
            cita.fecha = e.target.value;
        }
    })
}

function mostrarAlerta(mensaje, tipo, elemento, desaparece = true){
    //Previene la ejecucion del los mensajes alerta mas de una vez
    //Scripting de la alerta
    const alertaPrevia = document.querySelector('.alerta');
    if(alertaPrevia){
        alertaPrevia.remove();
    }
    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');
    alerta.classList.add(tipo);
    const referencia = document.querySelector(elemento);
    referencia.appendChild(alerta);
    if(desaparece){
        //Remueve alerta luego de 3 segundos
        setTimeout(() => {
        alerta.remove();
    }, 3000);
    }
}

function seleccionarHora(){
    const inputHora = document.querySelector('#hora');
    inputHora.addEventListener('input',function(e){
        const horaCita = e.target.value;
        const hora = horaCita.split(":")[0];
        if (hora<10 || hora>19){
            e.target.value = '';
            mostrarAlerta('Hora no Valida','error','.formulario');
        }else{
            cita.hora = e.target.value;
        }
    })
}

function mostrarResumen(){
    const resumen = document.querySelector('.contenido-resumen');
    
    //Limpiar contenido Resumen
    while(resumen.firstChild){
        resumen.removeChild(resumen.firstChild);
    }

    if(Object.values(cita).includes('') || cita.servicios.length === 0){
        mostrarAlerta('Faltan datos de servicio, fecha u hora','error','.contenido-resumen', false);  
        return;
    }
    // Formatear el div de resumen
    const {nombre, fecha, hora, servicios} = cita;

    const nombreCliente = document.createElement('P');
    nombreCliente.innerHTML = `<span>Nombre: </span> ${nombre}`;

    //Formatear fecha 

    const fechaObj = new Date(fecha);
    const mes = fechaObj.getMonth();
    const dia = fechaObj.getDate();
    const year = fechaObj.getFullYear();

    const fechaUTC = new Date( Date.UTC(year,mes,dia));

    const opciones = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    
    const fechaFormateada = fechaUTC.toLocaleDateString('es-AR',opciones);

    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha: </span> ${fechaFormateada}`;
    
    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora: </span> ${hora} Horas`;
    
    //Heading servicios en Resumen
    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de Servicios';
    resumen.appendChild(headingServicios);

    //Muestra los servicios seleccionados
    servicios.forEach(servicio =>{
        const {id,precio,nombre} = servicio;
        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio'); 
        
        const textoServicio = document.createElement('P');
        textoServicio.textContent =  nombre;
        
        const precioServicio = document.createElement('P');
        precioServicio.innerHTML = `<span>Precio: </span> $${precio}`;
        
        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);
        
        resumen.appendChild(contenedorServicio);
    })

    const headingCita = document.createElement('H3');
    headingCita.textContent = 'Resumen de Cita';
    resumen.appendChild(headingCita);

    //Boton para crear una cita
    const botonReservar = document.createElement('BUTTON');
    botonReservar.classList.add('boton');
    botonReservar.textContent = 'Reservar Cita';
    botonReservar.onclick = reservarCita;

    resumen.appendChild(nombreCliente);
    resumen.appendChild(fechaCita);
    resumen.appendChild(horaCita);
    resumen.appendChild(botonReservar);
}   

async function reservarCita(){
    const {nombre,fecha,hora, servicios, id} = cita;
    const idServicios = servicios.map(servicio => servicio.id);
    console.log(idServicios);
    const datos = new FormData();
    datos.append('usuarioId',id);
    datos.append('fecha',fecha);
    datos.append('hora',hora);
    datos.append('servicios',idServicios);
    try{
        //Peticion a la API
        const url='/api/citas'

        const respuesta = await fetch(url, {
            method: 'POST',
            body: datos
    });
    const resultado = await respuesta.json();
    if(resultado.resultado){
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Cita Creada',
            text: 'Cita Creada Correctamente',
            button: 'OK'
          }).then(()=>{
            setTimeout(()=>{
                window.location.reload();
            },3000);
        })
    }
    }catch(error){
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al guardar la cita'
          })
    }
    
}
