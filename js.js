$(function(){
    const LISTO =1,
        EJECUCION = 2,
        ESPERA = 3,
        TERMINADO = 4,
        TXT_LISTO = '<span class="badge badge-primary">LISTO</span>',
        TXT_EJECUCION = '<span class="badge badge-success">EJECUTANDO</span>',
        TXT_ESPERA = '<span class="badge badge-warning">ESPERA</span>',
        TXT_TERMINADO = '<span class="badge badge-dark">TERMINADO</span>',
        FCFS = 1,
        SJFNO = 2,
        SJF =3,
        TIEMPO = 1;
        TIPO=1,
        TIPODATOS=1,
        ALETORIO=1,
        PERSONALIZADO=2;
    let ProCounter1 = 0;
    let ProCounter2 = 0;
    let estadoSimu = 0; //0:No iniciado,1:Iniciado,2:detenido,3:finalizado

    let tiempo=0;
    let procesos = new Array();
    let id=1;
    repFinalizar='';
    /******  Realizado por Franz Gualambo ********/
    
    $("#procesoInte").attr("disabled",true);
    limpiar = function(){
        enabledInputs();
        
        $("#tbody").html("");
        $("#listos").html("");
        $("#todos").html("");
       
        estadoSimu=0;
        clearInterval(repFinalizar)
        clearInterval(repetir);
        id=1;
        tiempo=0;
        $("#iniciar").removeClass("btn-warning").addClass("btn-success");
        $("#iniciar").html('<i class="fas fa-play"></i> Iniciar');
    }
    $("#limpiarPromedios").click(function(){
        $("#promedios tbody").html("");
    });

    $(".tipoDatos").click(function(){
        if($(this).val()==ALETORIO){
         
            $("#agregarProceso").css("display","none");
            $("#tablaPerso").css("display","none");
        }else if($(this).val()==PERSONALIZADO){
          
            //limpiar();
            $("#tablaPerso").css("display","table");
            $("#agregarProceso").css("display","inline-block");
            agregarFila();
        }
    });

    $("#detener").click(function(){
        clearInterval(repetir);
    });

    $("#limpiar").click(function(){
        limpiar();
    });

    agregarFila = function(){
        let fila="<tr>";

        fila+='<td><input type="text" class="form-control tInicio"></td>';
        fila+='<td><input type="text" class="form-control tDuracion"></td>';
        fila+="</tr>";
        $("#tablaPerso tbody").append(fila);
    }
    $("#agregarProceso").click(function(){
        agregarFila();
    });

    $(".tipoAlgoritmo").click(function(){
  
        TIPO=$(this).val();
    });

    disabledInputs = function(){
        $("input:radio").attr("disabled",true);
    }

    enabledInputs = function(){
        $("input:radio").attr("disabled",false);
    }

    $("#iniciar").click(function(){ 
        if(estadoSimu==3){
            limpiar();
            estadoSimu = 0;
        }
        if(estadoSimu==0){//No iniciado de 0
            disabledInputs();
            $(this).removeClass("btn-success").addClass("btn-warning");
            $(this).html('<i class="far fa-hand-paper"></i> Detener');
            clearInterval(repFinalizar); 
            $("#procesoInte").attr("disabled",false);
            if($(".tipoDatos:checked").val()==ALETORIO){
                
                crearProcesos(parseInt(Math.random()*6 + 1));
                puntoTiempo();
                iniciarTiempo();
            }else if($(".tipoDatos:checked").val()==PERSONALIZADO){
                let inicios = [],
                    duraciones = [];
    
                $(".tinicio").each(function(index,value){
                    let inicio = $(this).val();
                    let duracion = $(".tDuracion").eq(index).val();

                    if(inicio!="" && duracion!=""){
                        inicios.push(inicio);
                        duraciones.push(duracion);
                    }
                });
    
                
    
                crearProcesosPerso(inicios,duraciones);
        
                puntoTiempo();
                iniciarTiempo();
            }
    
            revisarFin();
            estadoSimu = 1;
        }else if(estadoSimu==1){//iniciado para detener
            $(this).removeClass("btn-warning").addClass("btn-success");
            $(this).html('<i class="fas fa-play"></i> Continuar');
            detenerTiempo();
            clearInterval(repFinalizar);
            estadoSimu=2;
        }else if(estadoSimu==2){//detenido para iniciar de nuevo
            $(this).removeClass("btn-success").addClass("btn-warning");
            $(this).html('<i class="far fa-hand-paper"></i> Detener');
            clearInterval(repFinalizar); 
            $("#procesoInte").attr("disabled",false);
            if($(".tipoDatos:checked").val()==ALETORIO){
               
                iniciarTiempo();
            }else if($(".tipoDatos:checked").val()==PERSONALIZADO){
                iniciarTiempo();
            }
    
            revisarFin();
            estadoSimu=1;
        }

            
       
        
    });

    revisarFin = function(){
        repFinalizar = setInterval(function(){
            console.log(repFinalizar)
            let ver = 0,
                num=0,
                sumEspera = 0;
            for(let ind in procesos){
                sumEspera+=procesos[ind].espera;
                if(procesos[ind].estado!=4){
                    ver=1;
                    num++;
                }else if(procesos[ind].estado==4){
                    num++;
                }
            }

            if(ver==0){
                //FIN DE TODOS LOS PROCESOS
                enabledInputs();
                estadoSimu=3;
                $("#iniciar").removeClass("btn-warning").addClass("btn-success");
                $("#iniciar").html('<i class="fas fa-play"></i> Iniciar');
                $("#procesoInte").attr("disabled",true);
                // $("#promEspera").text((sumEspera/num).toFixed(2));
                let fila = '<tr><td>'+convierteTipo(TIPO)+'</td><td>'+(sumEspera/num).toFixed(2)+'</td></tr>';
                $("#promedios tbody").append(fila);
                clearInterval(repFinalizar);
                detenerTiempo();
                return;
            }
        },1000);
    }

    proceso = function(id=0,inicio=0,duracion=0,estado=LISTO,ejecutado=0,espera=-1){
        this.id = id
        this.inicio = inicio;
        this.duracion = duracion;
        this.estado = estado; // 1 : Listo
        this.ejecutado = ejecutado;
        this.espera = espera;
        this.instrucciones = [];
        this.idPadre = '';
        this.pid=id;
    }

    instruccion = function(duracion,idProceso){
        this.id = parseInt(Math.random()*1000000+1);
        this.duracion = duracion;
        this.idProceso = idProceso;
    }

    creaFilaPro = function(proceso){
        console.log(proceso);
        let fila = "<tr id='"+proceso.id+"'>";
        fila += "<td class='proceso' id='pcb"+proceso.id+"'>"+proceso.id+"</td>";     
        fila += "<td class='inicio'>"+proceso.inicio+"</td>";     
        fila += "<td class='duracion'>"+proceso.duracion+"</td>";     
        fila += "<td class='estado'>"+proceso.estado+"</td>";     
        fila += "<td class='idPadre'>"+proceso.idPadre+"</td>";     
        fila += "<td class='ejecutado'>"+proceso.ejecutado+"</td>";     
        fila += "<td class='programCounter'>-</td>";     
        fila += "<td class='espera'>-</td>";     
        
        return fila;
    }

    pintarColas = function(procesos){
        let filas = '<tr>';
        for(let ind in procesos){
            filas += '<td>P' + procesos[ind].id + '</td>';
        }
        filas+="</tr>";
        $("#todos").html(filas);

        filas = '<tr>';
        for(let ind in procesos){
            if(procesos[ind].estado==LISTO)
                filas += '<td>P' + procesos[ind].id + '</td>';
        }
        filas+="</tr>";
        $("#listos").html(filas);
    }

    crearProcesos = function(cant){
        procesos=new Array();
        let idAnterior = 0;
        for(i=0;i<cant;i++){
            
            let inicio = 0,
                duracion = parseInt(Math.random()*8 + 1),
                id=parseInt(Math.random()*1000 + 2);

            if(id==1){
                inicio=0;
            }else{
                inicio = parseInt(Math.random()*3 + 1);
            }
           
            
            let pro = creaProceso(id,inicio,duracion);

            procesos[id] = pro;
            
            //Viendo si se convierte en hijo
            let ruleta = parseInt(Math.random()*2 + 1);
            let idPadre=0;
            

            if(ruleta==1){//convierte a hijo
                for(let ind in procesos){
                    if(idAnterior==procesos[ind].id){
                        procesos[id].idPadre = idAnterior
                    }
                }
            }
            idAnterior = id;

            //pintando tabla
            $("#tbody").append(creaFilaPro(pro));

            let miTabla = '<table class="table table-bordered">';
            miTabla += '<tr><th>ID Inst</th><th>ID Pro</th><th>Tiempo</th></tr>';
            for(let ind in pro.instrucciones){
                miTabla += '<tr><td>'+pro.instrucciones[ind].id+'</td><td>'+pro.instrucciones[ind].idProceso+'</td><td>'+pro.instrucciones[ind].duracion+'</td></tr>'; 
            } 
            miTabla += '</table>';
           
            $("#pcb"+id).popover({
                html:true,
                placement:'left',
                title : 'Datos del Proceso',
                sanitize : false,
                trigger: 'hover',
                content: function(){
                   return miTabla;
                }
              });
              id++;
        }

        console.log(procesos);
    }
    creaProceso = function(miId,inicio,duracion){
        let proce = new proceso();
        proce.inicio=inicio;
        proce.estado=1;
        proce.duracion = duracion;
        proce.id = miId;

        
        
        proce.instrucciones = creaInstrucciones(duracion,miId);
        return proce;
    }

    crearProcesosPerso = function(inicios,duraciones){
        //limpiar();
        procesos=[];
        for(i=0;i<inicios.length;i++){
            let miId = parseInt(Math.random()*1000 + 2);
            let pro = creaProceso(miId,inicios[i],duraciones[i]);

            procesos[miId] = pro;
            
           
            //pintando tabla
            $("#tbody").append(creaFilaPro(pro));
            let miTabla = '<table class="table table-bordered">';
            miTabla += '<tr><th>ID Instruccion</th><th>ID Proceso</th><th>Tiempo Inst</th></tr>';
            for(let ind in pro.instrucciones){
                miTabla += '<tr><td>'+pro.instrucciones[ind].id+'</td><td>'+pro.instrucciones[ind].idProceso+'</td><td>'+pro.instrucciones[ind].duracion+'</td></tr>'; 
            } 
            miTabla += '</table>';
            console.log("#pcb"+miId,miTabla);
            $("#pcb"+miId).popover({
                html:true,
                placement:'left',
                title : 'Datos del proceso',
                sanitize : false,
                trigger: 'hover',
                content: function(){
                   return miTabla;
                }
              });
              id++;
        }
    }

    creaInstrucciones = function(duracion,idProceso){
        let duracionesInst = 0; 
        let instrucciones = [];
        while(duracionesInst<duracion){
            let duracionCreada = parseInt(Math.random()*2 + 1)/2;
            let miInstruccion = new instruccion(duracionCreada,idProceso);
            
            instrucciones.push(miInstruccion);
            duracionesInst += duracionCreada; 
            
        }
        return instrucciones;
    }

    repetir = '';
    iniciarTiempo = function(){
        repetir = setInterval(function(){
            console.log('repetir');
            puntoTiempo();
        },1000*TIEMPO);
    }

    detenerTiempo = function(){
        clearInterval(repetir)
    }
    
    puntoTiempo = function(){
        for(let ind in procesos){
            if(procesos[ind].duracion==procesos[ind].ejecutado) {
                procesos[ind].estado = TERMINADO;
            }
        }

        $("#tiempo").text(tiempo);

        let idMenor = planificador();
        despachador(idMenor);
        pintarEstados();
        pintarColas(procesos);
        tiempo = tiempo + TIEMPO;
    }

    planificador = function(){
        let menor=-1,idMenor=0;

        if(TIPO==FCFS){
            for(let ind in procesos){
                if(tiempo>=procesos[ind].inicio){

                    if(procesos[ind].estado!=4 ){   
                        if(menor==-1 || procesos[ind].inicio<menor){
                            menor=procesos[ind].inicio;
                            idMenor = procesos[ind].id;
                        }
                    }
                }
            }
        }

        if(TIPO==SJFNO){
            for(let ind in procesos){
                if(procesos[ind].estado!=TERMINADO ){   
                    
                    if(tiempo>=procesos[ind].inicio){
                        
                        if(procesos[ind].estado==2){
                            menor=procesos[ind].duracion;
                            idMenor = procesos[ind].id;
                            break;
                        }else if(menor==-1 || procesos[ind].duracion<menor){
                            menor=procesos[ind].duracion;
                            idMenor = procesos[ind].id;
                        }
                    }
                }
            }
        }

        if(TIPO==SJF){
            for(let ind in procesos){
                if(procesos[ind].estado!=TERMINADO ){   
                    if(tiempo>=procesos[ind].inicio){
                        if(menor==-1 || procesos[ind].duracion<menor){
                            menor=procesos[ind].duracion;
                            idMenor = procesos[ind].id;
                        }
                    }
                }                       
            }
        }
        return idMenor;
    }

    despachador = function(id){
        if(id!=0){
            $("#"+id).find(".estado").text(TXT_EJECUCION);
            procesos[id].estado = EJECUCION;
            
            for(let ind in procesos){
                if(ind!=id && procesos[ind].estado!=TERMINADO) {
                    procesos[ind].estado=LISTO;
                }
            }
        }
        for(let ind in procesos){
            if(procesos[ind].estado==EJECUCION) {
                procesos[ind].ejecutado = procesos[ind].ejecutado+ TIEMPO;
            }
        }
    }
    pintarEstados = function(){
        for(let ind in procesos){
            if(procesos[ind].estado==LISTO) {
                $("#"+ind).find(".estado").html(TXT_LISTO);
            }
            if(procesos[ind].estado==TERMINADO) {
                $("#"+ind).find(".estado").html(TXT_TERMINADO);
                if($("#"+ind).find(".espera").html()=='-'){
                    procesos[ind].espera = tiempo - procesos[ind].inicio - procesos[ind].duracion
                    $("#"+ind).find(".espera").html(tiempo - procesos[ind].inicio - procesos[ind].duracion);
                }
            }
            if(procesos[ind].estado==EJECUCION) {
                $("#"+ind).find(".estado").html(TXT_EJECUCION);

                let sumaD = 0,
                    indice = 0;
                while(sumaD<procesos[ind].ejecutado){
                    sumaD += procesos[ind].instrucciones[indice].duracion;
                   
                    indice++;
                    
                }
                
                let programCounter =  procesos[ind].instrucciones[indice] || '-';

                if(programCounter!='-'){
                    $("#"+ind).find(".programCounter").html(programCounter.id);
                }else{
                    $("#"+ind).find(".programCounter").html('-');
                }

                $("#pc"+ProCounter1+ProCounter2).html(procesos[ind].id);
                ProCounter1 = procesos[ind].id;
                ProCounter2 = procesos[ind].ejecutado;

                let ul = '<tr>';
                ul += '<td>'+procesos[ind].id+'</td>';
                ul += '<td id="pc'+procesos[ind].id+procesos[ind].ejecutado+'"></td>';
                // ul += '<td>'+convierteEstado(procesos[ind].estado)+'</td>';
                ul += '<td>'+procesos[ind].ejecutado+'</td>';
                ul += '</tr>';
                
                $("#divProcesos table tbody").append(ul);
                //if(ind != 1)
                //$('#pc'+(procesos[ind-1].id)).text(procesos[ind].id);
            }
            $("#"+ind).find(".ejecutado").html(procesos[ind].ejecutado);
        }
    }
    convierteEstado = function(estado){
        switch (estado) {
            case EJECUCION:
                return TXT_EJECUCION
            case LISTO:
                return TXT_LISTO
            case ESPERA:
                return TXT_ESPERA
            case TERMINADO:
                return TXT_TERMINADO
            
        }
    }

    convierteTipo = function(estado){
        console.log(estado);
        console.log(TIPO);
        switch (estado) {
            case '1':
                return "FCFS"
            case '2':
                return "SJFNO"
            case '3':
                return "SJF"
          
        }
    }

    $("#procesoInte").click(function(){
        let duraProceso = $("#duraProceso").val();
        let proce = new proceso();
        
        let id= parseInt(Math.random()*1000 + 2);
        proce.inicio = tiempo+1;
        proce.estado=1;
        proce.duracion = duraProceso;
        proce.id = id;
        procesos[id] = proce;
        $("#tbody").append(creaFilaPro(proce));
        $("#duraProceso").val("");
    });
   // pintarColas(procesos);
});