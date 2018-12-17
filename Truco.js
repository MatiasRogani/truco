

//https://www.draw.io/#G16IjIZLnzijXtSWJygGJ03zpISkE-r3rZ

//https://www.playspace.com/es-es/pagina/reglas-del-truco.

//Terminos:
// Baza = "Ronda"


//Faltan dos cosas Principales
//- Trabajar con flor
//- cantar truco y te lo interrumpan con un envido. que despues continue el truco



class Baraja {
	
	//cartas: Arreglo de cartas
	constructor (cartas){
		this._cartas = [];
		var cartasRestantes = cartas.slice(0);
		
		while (cartasRestantes.length > 0){
			var cartaElegida = Math.floor( Math.random() * cartasRestantes.length);
			this._cartas.push(cartasRestantes[cartaElegida]);
			cartasRestantes.splice(cartaElegida, 1);
		}
	}
	
	RepartirCarta(){
		return this._cartas.pop();
	}
	RepartirCartas(cantidad){
		let cartas = [];
		for (let i = 0; i < cantidad; i++){
			cartas.push(this.RepartirCarta());
		}
		return cartas;
	}
	
};


class Juego {
	constructor (nombreJugador1,nombreJugador2, conFlor){
		
		this.jugadores = [new Jugador(nombreJugador1), new Jugador(nombreJugador2)];
		
		this._iJugadorGanador;
		this._conFlor = conFlor;
		
		console.clear();
		console.log('');
		console.log('Para jugar, tiene disponibles los siguientes comandos:');
		console.log(' juego.Ver() -> Permite ver todo');
		console.log(' juego.TirarCarta(*numero de carta*)');
		console.log(' juego.CantarApuesta("lance que se quiere hacer(tiene que ser exacto)")');
		console.log(' juego.MeVoyAlMaso()');
		console.log(' juego.VerPuntajes()()');
		console.log(' juego.VerMesa()');
		console.log(' juego.VerMano()');
		console.log(' juego.VerApuestas()');
		console.log(' juego.VerJugadorEnTurno()');
		console.log(' juego.VerSugerencias()');

		console.log('');
		
		console.log("Inicia Juego...");
		
		this.nextMano();
		
	}
	
	nextMano(){
		

		
		//¿Gano alguien? (¿llego algun jugador al puntaje para ganar?)
		let iJugadorGanador = null;
		for (let i = 0; i < this.jugadores.length; i++){
			if (this.jugadores[i].puntajeBuenas >= PUNTOS_BUENAS) {
				iJugadorGanador = i;
				break;
			}
		}
		
		//Si nadie ganó, se genera una nueva Mano del juego.
		if (iJugadorGanador == null){
			
			//Se cambia el jugador mano en el arreglo jugadores
			var jugadoresEnNuevaPosicion = [];
			for (let i = 0, j = 1; i < this.jugadores.length; i++, j++ ){
				if (j == this.jugadores.length) j = 0;
				jugadoresEnNuevaPosicion[i] = this.jugadores[j];
			}
			this.jugadores = jugadoresEnNuevaPosicion;			
			
			let nuevaMano = new Mano(this.jugadores, new Baraja(cartas), this._conFlor, this.nextMano.bind(this));
			
			this._mano = nuevaMano; //Para fines de testeo
			
			this.VerMesa = nuevaMano.VerMesa.bind(nuevaMano);
			this.VerMano = nuevaMano.VerMano.bind(nuevaMano);
			this.VerApuestas = nuevaMano.VerApuestas.bind(nuevaMano);
			this.VerJugadorEnTurno = nuevaMano.VerJugadorEnTurno.bind(nuevaMano);
			this.TirarCarta = nuevaMano.TirarCarta.bind(nuevaMano);
			this.CantarApuesta = nuevaMano.CantarApuesta.bind(nuevaMano);
			this.MeVoyAlMaso = nuevaMano.MeVoyAlMaso.bind(nuevaMano);
			this.Ver =  nuevaMano.Ver.bind(nuevaMano);
			this.VerSugerencias = nuevaMano.VerSugerencias.bind(nuevaMano);
	
		}
		else{
			
			this._JugadorGanador = this.jugadores[iJugadorGanador];
			
			this.VerApuestas = function(){console.log = "El partido a terminado";};
			this.VerJugadorEnTurno = function(){console.log = "El partido a terminado";};
			this.TirarCarta = function(){console.log = "El partido a terminado";};
			this.CantarApuesta = function(){console.log = "El partido a terminado";};
			this.MeVoyAlMaso = function(){console.log = "El partido a terminado";};
			
			console.log(`Ganó el Partido el jugador ${this._JugadorGanador.nombre}`)
		}

	}
	


	
}

class Mano {
	constructor (jugadores, baraja, conFlor, conQueContinuo){
		
		//¿Que debe hacerse cuando termina esta mano?
		this.conQueContinuo = conQueContinuo;
		
		this.cantidadRondas = 3; 
		this.cantidadCartasPorJugador = 3;
		
		this.jugadores = jugadores;
		
		this._conFlor = conFlor;
		
		//Repartida de cartas entre jugadores
		this.jugadores.forEach(j => j.cartas = baraja.RepartirCartas(this.cantidadCartasPorJugador));
		
		//cartasEnMesa[Ronda][Jugador]
		this.cartasEnMesa = [];
		for (let i = 0; i < this.cantidadRondas; i++){
			this.cartasEnMesa[i] = [];
		}
		
		this.iJugadorInicioRonda = 0;
		this.iJugadorActual = 0;
		this.iRondaActual = 0;
		this.iApuestaActual = 0;
		
		this.bDisputaFlor = false;
		this.bYaSeDisputoEnvidoFlor = false;
		this.apuestasEnvido = [0];
		this.iIniciadorEnvido = null;
		
		this.bDisputaTruco = false;
		this.apuestasTruco = [0];
		this.iIniciadorTruco = null;
		this.iIniciadorTrucoParcial = null;
		
		
		console.log("Inicia Mano...");
		
		this.IniciarTurno();
		
	}
	
	IniciarTurno(){
		
		if (this.iJugadorActual == null) return;
		
		console.log(`Es el turno de ${this.jugadores[this.iJugadorActual].nombre}.`);
		
		//?
		this.Ver();
		
		//Si se juega con flor, y es la ronda 0 se lanza automaticamente la flor
		if (this._conFlor && this.iRondaActual == 0 && !this.bDisputaFlor && !this.bYaSeDisputoEnvidoFlor){
			if (this._tieneFlor(this.iJugadorActual)) this.CantarApuesta("flor");
			return;
		}

	}
	
	
	NextRonda(){

		//Si nadie Gano-Perdio, Se debe seguir con la siguiente ronda
			//Cambio de iJugadorActual
			//Cambio de iRondaActual
		
		let resultado = this.ResultadoFinal();
		
		if (resultado == null){ //No hay resultado aun -> Ir a siguiene ronda
			
			// La ronda siguiente la comienza el jugador que ganó la ronda.
			let jugadoresMayorPuntaje = iJugadoresConCartaMayorPuntaje(this.cartasEnMesa[this.iRondaActual]);
			
			let ResultadoRondaMano = this.Resultado(this.iRondaActual);
			
			switch (ResultadoRondaMano){
				case eResultado.PERDIO:
					this.iJugadorActual = 1;
					break;
				case eResultado.GANO:
					this.iJugadorActual = 0;
					break;
				case eResultado.EMPATE:
					this.iJugadorActual = 0;
					break;
			}					
			
			this.iJugadorInicioRonda = this.iJugadorActual;
			
			this.iRondaActual++;
			if (this.iRondaActual == this.cantidadRondas) this.iRondaActual = 0;
			this.IniciarTurno();
		}
		else{ //Se obtuvo un resultado para la mano
		
			this.iJugadorActual = null; //Recoradr que resultado es relativo al jugador mano.
			
			let puntaje = 0;
			
			switch (resultado){
				case eFinal.GANO:
					
					if (this.apuestasTruco.length < 2) //Para evitar que si no se canto ninguna apuesta (length = 0) la matriz no asigne puntaje
						puntaje = 1;
					else
						puntaje = this._getPuntajeApuestas(this.apuestasTruco);

					this.jugadores[0].agregarPuntaje(puntaje);
					console.log(`Ganó la mano el equipo del jugador ${this.jugadores[0].nombre}`);
				break;
				case eFinal.PERDIO:
					if (this.apuestasTruco.length < 2) //Para evitar que si no se canto ninguna apuesta (length = 0) la matriz no asigne puntaje
						puntaje = 1;
					else
						puntaje = this._getPuntajeApuestas(this.apuestasTruco);
					
					this.jugadores[1].agregarPuntaje(puntaje);
					console.log(`Ganó la mano el equipo del jugador ${this.jugadores[1].nombre}`);
				break;
			}
			
			console.log('***************************************************************************');
			console.log('***************************************************************************');
			
			this.conQueContinuo();
			
		}
			
	}
	
	//() -> (eFinal)
	//Devuelve null si no hay final del juego
	ResultadoFinal(){
		
		//		Se basa en buscar en la matrizResultados[ResultadoPrimerRonda][ResultadoSegundaRonda][ResultadoTerceraRonda]
		// 		de forma secuencial hasta la Ronda Actual. Si no se devolvio un eResultado (number, ya que puede obtenerse tambien un Arreglo y una excepcion)
		//Por cada ronda que se jugó voy probando si hay resultado
		let matriz = matrizResultados;
		for (let iRonda = 0; iRonda <= this.iRondaActual; iRonda++){
			
			let resultadoRonda = this.Resultado(iRonda);
			if (resultadoRonda == null) return null; //No se jugo o completo esa ronda
			
			let resultadoFinal = matriz[resultadoRonda];
			if ( typeof resultadoFinal == 'number' ){ 
				return resultadoFinal;
			}
			else if (resultadoFinal instanceof Array) { //Si es un Array, es que la partida tiene que seguir para determinar un ganador
				matriz = resultadoFinal;
			}
		}
		
		return null

	}
	
	//(Ronda) -> (eResultado)
	//Se Devuelve siempre en funcion del jugador Mano (iJugador = 0) o Equipo del Jugador Mano, 
	// si no se tiraron cartas o no esta completa la ronda, devuelve null
	Resultado(iRonda){
		
		//De las cartas en la mesa que corresponden a Ronda, se busca la carta de mayor power
		// A partir del indice puedo saber que jugador fue el que la tiró.
		
		//Verificar que hayan jugado todos los jugadores
		if (this.cartasEnMesa[iRonda].length < this.jugadores.length) return null;
		
		
		let jugadoresMayorPuntaje = iJugadoresConCartaMayorPuntaje(this.cartasEnMesa[iRonda]);

		if (jugadoresMayorPuntaje.length == 1){
			if (jugadoresMayorPuntaje[0]%2 == 0) return eResultado.GANO;
			else return eResultado.PERDIO;
		}
		else {
			return eResultado.EMPATE;
		}
		
		
	}
	
	mostrarInstrucciones(){
		console.log('Para jugar, tiene disponibles los siguientes comandos:');
		console.log(' juego.Ver() -> Permite ver todo');
		console.log(' juego.TirarCarta(*numero de carta*)');
		console.log(' juego.CantarApuesta("lance que se quiere hacer(tiene que ser exacto)")');
		console.log(' juego.MeVoyAlMaso()');
		console.log(' juego.VerPuntajes()()');
		console.log(' juego.VerMesa()');
		console.log(' juego.VerMano()');
		console.log(' juego.VerApuestas()');
		console.log(' juego.VerJugadorEnTurno()');
		console.log(' juego.VerSugerencias()');
		console.log('');		
	}

	
	imprimirResultado(resultado){
			//Imprime el resultado
		switch (resultado.resultado){
			case eResultado.EMPATE:

				//Armando el string
				let jugadoresEmpatados;
				for (let i = 0; i < resultado.jugadores.length; i++){
					if (i == 0){
						jugadoresEmpatados = this.jugadores[resultado.jugadores[i]].getNombre();
					}
					else if (i == resultado.jugadores.length - 1){
						jugadoresEmpatados = jugadoresEmpatados + " y " + this.jugadores[resultado.jugadores[i]].getNombre();
					}
					else{
						jugadoresEmpatados = jugadoresEmpatados + ", " + this.jugadores[resultado.jugadores[i]].getNombre();
					}
				}
				console.log("Han empatado los jugadores " + jugadoresEmpatados);
				break;
			case eRespuestas.NOEMPATE:

				console.log("Ha ganado el jugador " + this.jugadores(resultado.jugadores[i]).getNombre());
				break;
		}		
	}

	
	Ver(){
		console.log('**** Puntos ****');
		this.VerPuntajes();
		console.log('**** Cartas en la Mesa ****');
		this.VerMesa();
		console.log('**** Cartas en Mano ****');
		this.VerMano();
		console.log('**** Lances disponibles ****');
		this.VerApuestas();
		console.log('Indique que desea hacer:');
	}
	
	VerPuntajes(){
		console.log(`Puntaje de ${this.jugadores[0].nombre}: ${this.jugadores[0].puntajeMalas} Malas - ${this.jugadores[0].puntajeBuenas} Buenas`);
		console.log(`Puntaje de ${this.jugadores[1].nombre}: ${this.jugadores[1].puntajeMalas} Malas - ${this.jugadores[1].puntajeBuenas} Buenas`);
	}
	
	VerMesa(){
		console.log(this.jugadores.map(j => j.nombre));
		this.cartasEnMesa.forEach(a => console.log(a.map(c => c.toTexto())));
	}
	VerMano(){
		
		if (this.iJugadorActual == null) return;
		
		console.log(this.jugadores[this.iJugadorActual].cartas.map(c => c.toTexto()));
	}
	VerApuestas(){
		this._getApuestasDisponibles().forEach(a => console.log(a.descripcion));
	}
	VerJugadorEnTurno(){
		
		if (this.iJugadorActual == null){
			console.log("No es el turno de ningun jugador. El juego termino.");
		}
		else{
			console.log(this.jugadores[this.iJugadorActual].nombre)
		}
	}
	VerSugerencias(){
		
		if (this.iJugadorActual == null) return;
		
		// Cantar “truco” durante la disputa de la tercera baza, si la probabilidad de ganar es mayor que 0,7.
		if (this.iRondaActual == 2 && this._probabilidadDeGanarTruco() > 0.7) console.log("Le recomiendo cantar TRUCO!");
		
		// Cantar “falta envido”, si la probabilidad de ganarla es mayor que 0,6.
		if (this.iRondaActual == 0 && this._probabilidadDeGanarEnvido() > 0.7) console.log("Le recomiendo cantar FALTA ENVIDO!");
		
		// Perder la primera baza, con el objeto de “confundir” al adversario, si la probabilidad de ganar el truco es mayor que 0,8.
		if (this.iRondaActual == 0 && this._probabilidadDeGanarTruco() > 0.8) console.log("Le recomiendo PERDER LA PRIMER BAZA PARA CONFUNDIR!");
		
	}
	
	TirarCarta(nroCarta){
		
		if (this.iJugadorActual == null) return;
		if (this.bDisputaEnvido || this.bDisputaTruco){
			console.log("Hay un lance esperando respuesta.");
			return;
		}
		
		//Validacion de Entrada
		if (nroCarta < 1 || nroCarta > this.jugadores[this.iJugadorActual].cartas.length ){
			console.log("No se indicó una carta válida (debe ser un numero del 1 al " + this.jugadores[this.iJugadorActual].cartas.length + "). ");
			return;
		}
		
		//El jugador tira la carta (delete)
		let carta = this.jugadores[this.iJugadorActual].cartas.splice(nroCarta-1, 1).pop();
		
		//Se coloca en la mesa
		this.cartasEnMesa[this.iRondaActual][this.iJugadorActual] = carta;
		
		console.clear();
		this.mostrarInstrucciones();
		
		console.log(`El jugador ${this.jugadores[this.iJugadorActual].nombre} tiró la carta ${carta.toTexto()}.`);
		
		//Cambio de jugador 
		this.iJugadorActual++;
		if (this.iJugadorActual == this.jugadores.length){
			this.iJugadorActual = 0;
		}
		//Si volvemos al comienzo de la Ronda, pasamos a la proxima Ronda
		if (this.iJugadorActual == this.iJugadorInicioRonda)
			this.NextRonda();
		else 
			this.IniciarTurno();

	}
	
	CantarApuesta(sApuesta){
		let apuesta = this._getApuestasDisponibles(this.rondaActual).find(a => a.descripcion.toUpperCase() == sApuesta.toUpperCase());
		
		if (apuesta == null) {
			console.log("Apuesta Inválida.");
			return;
		}
		
		console.clear();
		this.mostrarInstrucciones();
		console.log(`El jugador ${this.jugadores[this.iJugadorActual].nombre} cantó ${apuesta.descripcion}.`);
		
		this.iApuestaActual = apuesta.codigo;
		
		switch (apuesta.opciones.tipo){
			case eTipoApuesta.ENVIDO:
				
				this.apuestasEnvido.push(apuesta.codigo);
				
				if (!this.bDisputaEnvido){
					this.iIniciadorEnvido = this.iJugadorActual;
				}
				
				//Si no espera respuesta en envido, es porque termino la disputa del envido
				if (apuesta.opciones.esperaRespuesta){
					this.bDisputaEnvido = true;
					
					this.iJugadorActual ++;
					if (this.iJugadorActual == this.jugadores.length) this.iJugadorActual = 0;
				}
				else
				{
					
					let equipoGanador = 0;
					if (apuesta.opciones.dadoPorVencido){
						equipoGanador = (this.iJugadorActual % 2) + 1;
						if (equipoGanador >= 2) equipoGanador = 0;
					}
					else {
						equipoGanador = this._ganadorEnvido() % 2;
					}

					this.bDisputaEnvido = false;
					this.bYaSeDisputoEnvidoFlor = true;
					this.iJugadorActual = this.iIniciadorEnvido;					
					
					let gano = this.jugadores[equipoGanador].agregarPuntaje(this._getPuntajeApuestas(this.apuestasEnvido));
					//No espera a qu termine la Baza (ronda) para asignar puntajes. Se verifica si alguien gano ahora.
					if (gano) this.conQueContinuo();
					
					if (this.bDisputaTruco) { //Alguien habia iniciado el truco antes de cantar envido
						this.apuestasTruco.pop(); //Se elimina el canto de truco y se recanta
						this.iJugadorActual = this.iIniciadorTruco;
						this.CantarApuesta("Truco");
						return;
					}
					
				}
				break;
			case eTipoApuesta.FLOR:
				
				this.apuestasEnvido.push(apuesta.codigo);
				
				if (!this.bDisputaEnvido){
					this.iIniciadorEnvido = this.iJugadorActual;
				}
				
				//Cambio con respeco al envido
				//Si el jugador conrtario no posee flor entonces gana automaticamente
				let iProximoJugador = this.iJugadorActual + 1;
				if (iProximoJugador == this.jugadores.length) iProximoJugador = 0;
				if (! this._tieneFlor(iProximoJugador)){
					
					this.iJugadorActual ++;
					if (this.iJugadorActual == this.jugadores.length) this.iJugadorActual = 0;
					this.iApuestaActual = 20; //Equivale a un No Quiero del otro, pero sin que lo cante
					apuesta = ColeccionApuestas['20'];
				}				
				
				
				//Si no espera respuesta en envido, es porque termino la disputa del envido
				if (apuesta.opciones.esperaRespuesta){
					this.bDisputaEnvido = true;
					this.bDisputaFlor = true;
					
					this.iJugadorActual ++;
					if (this.iJugadorActual == this.jugadores.length) this.iJugadorActual = 0;	
					
				}
				else
				{
					
					let equipoGanador = 0;
					if (apuesta.opciones.dadoPorVencido){
						equipoGanador = (this.iJugadorActual % 2) + 1;
						if (equipoGanador >= 2) equipoGanador = 0;
					}
					else {
						equipoGanador = this._ganadorFlor() % 2;
					}

					this.bDisputaEnvido = false;
					this.bDisputaFlor = false;
					this.bYaSeDisputoEnvidoFlor = true;
					this.iJugadorActual = this.iIniciadorEnvido;					
					
					let gano = this.jugadores[equipoGanador].agregarPuntaje(this._getPuntajeApuestas(this.apuestasEnvido));
					//No espera a qu termine la Baza (ronda) para asignar puntajes. Se verifica si alguien gano ahora.
					if (gano) this.conQueContinuo();
					
					if (this.bDisputaTruco) { //Alguien habia iniciado el truco antes de cantar envido
						this.apuestasTruco.pop(); //Se elimina el canto de truco y se recanta
						this.iJugadorActual = this.iIniciadorTruco;
						this.CantarApuesta("Truco");
						return;
					}
					
				}
				break;				
			case eTipoApuesta.TRUCO:
				
				this.apuestasTruco.push(apuesta.codigo);
				
				if (this.iIniciadorTruco == null){
					this.iIniciadorTruco = this.iJugadorActual;
				}
				
				if (!this.bDisputaTruco){
					this.iIniciadorTrucoParcial = this.iJugadorActual;
				}
				
				//Si no espera respuesta en truco, habilitamos el tirar cartas
				if (apuesta.opciones.esperaRespuesta){
					this.bDisputaTruco = true;
					
					this.iJugadorActual ++;
					if (this.iJugadorActual == this.jugadores.length) this.iJugadorActual = 0;
				}
				else 
				{

					this.bDisputaTruco = false;
					
					// No espera respuesta, Puede ser que haya dado por vencido o continue
					if (apuesta.opciones.dadoPorVencido){
					
						let equipoGanador = (this.iJugadorActual % 2) + 1;
						if (equipoGanador >= 2) equipoGanador = 0;
						
						this.jugadores[equipoGanador].agregarPuntaje(this._getPuntajeApuestas(this.apuestasTruco));
						
						console.log(`Ganó la mano el equipo del jugador ${this.jugadores[equipoGanador].nombre}`);
						
						this.conQueContinuo();

					}
					else
						this.iJugadorActual = this.iIniciadorTrucoParcial;	
					
				}
				break;
				
		}
		
		this.IniciarTurno();
		
		
	}
	
	MeVoyAlMaso(){

		let equipoGanador = (this.iJugadorActual % 2) + 1;
		if (equipoGanador >= 2) equipoGanador = 0;
		
		//Para que si se va al mazo sin cantar, se le sumen dos puntos.
		let puntaje;
		if (this.apuestasTruco.length < 2)
			puntaje = 1;
		else
			puntaje = this._getPuntajeApuestas(this.apuestasTruco);

		if (this.iRondaActual == 0 && this.iJugadorActual == 0 && puntaje < 2) puntaje = 2;
		
		this.jugadores[equipoGanador].agregarPuntaje(puntaje);
		
		console.log(`Ganó la mano el equipo del jugador ${this.jugadores[equipoGanador].nombre}`);
		
		this.conQueContinuo();
	
	}
	
	_probabilidadDeGanarEnvido(){
		
		let cartas;
		if (this.cartasEnMesa[this.iRondaActual][this.iJugadorActual] == null)
			cartas = this.jugadores[this.iJugadorActual].cartas
		else
			cartas = this.jugadores[this.iJugadorActual].cartas.concat(this.cartasEnMesa[this.iRondaActual][this.iJugadorActual])
		
		let valor = this._valorEnvido(cartas);
		return valor / 33;
		
	}
	_probabilidadDeGanarTruco(){
		
		let probabilidad = 1;
		
		//Tomamos las dos cartas mas altas
		let cartasOrdenadas = this.jugadores[this.iJugadorActual].cartas.slice(0).sort(function(a, b) { return a.power - b.power});
		cartasOrdenadas.shift(); //Elimina al primero (el mas bajo)
		
		
		for (let i = 0; i < cartasOrdenadas.length; i++){
			
			let power = cartasOrdenadas[i].power;
			
			let cartasTotales = cartas.length;
			
			let cartasMenores = 0;
			for (let j = 0; j < cartas.length; j++){
				if (cartas[j].power <= power) cartasMenores++;
			}
			
			probabilidad = probabilidad * cartasMenores / cartasTotales
			
		}

		return probabilidad;
		
	}
	
	_tieneFlor(iJugador){
		let cartasMismoPalo = true;
		let palo;
		for (let i = 0; i < this.jugadores[iJugador].cartas.length; i++){
			if (palo == null) 
				palo = this.jugadores[iJugador].cartas[i].palo;
			else
				if (palo !=  this.jugadores[iJugador].cartas[i].palo) cartasMismoPalo = false;
		}
		return cartasMismoPalo;

	}

	_ganadorFlor(){
		
		let puntajeMasAlto = 0;
		let jugadorPuntajMasAlto = 0;
		for (let i = 0, j = this.iIniciadorEnvido; i < this.jugadores.length; i++, j++){
			
			if (j >= this.jugadores.length) j = 0;
			
			//Calculo del envido con cartas en mano y en mesa
			let cartas;
			if (this.cartasEnMesa[0][j] == null)
				cartas = this.jugadores[j].cartas
			else
				cartas = this.jugadores[j].cartas.concat(this.cartasEnMesa[0][j]);
			
			let puntaje = this._valorFlor(cartas);
			if (puntaje > puntajeMasAlto){
				console.log(`${this.jugadores[j].nombre} canta: ${puntaje}.`);
				puntajeMasAlto = puntaje;
				jugadorPuntajMasAlto = j;
			}
			else{
				console.log(`${this.jugadores[j].nombre} canta: Son Buenas.`);
			}
		}
		
		return jugadorPuntajMasAlto;
		
	}
	
	_ganadorEnvido(){
		
		let puntajeMasAlto = 0;
		let jugadorPuntajMasAlto = 0;
		for (let i = 0, j = this.iIniciadorEnvido; i < this.jugadores.length; i++, j++){
			
			if (j >= this.jugadores.length) j = 0;
			
			//Calculo del envido con cartas en mano y en mesa
			let cartas = this.jugadores[j].cartas.concat(this.cartasEnMesa[0][j]);
			
			let puntaje = this._valorEnvido(cartas);
			if (puntaje > puntajeMasAlto){
				console.log(`${this.jugadores[j].nombre} canta: ${puntaje}.`);
				puntajeMasAlto = puntaje;
				jugadorPuntajMasAlto = j;
			}
			else{
				console.log(`${this.jugadores[j].nombre} canta: Son Buenas.`);
			}
		}
		
		return jugadorPuntajMasAlto;
		
	}
	_valorFlor(cartasJugador){
		
		let puntaje = 0;
		for (let i = 0; i < cartasJugador.length; i++){
			puntaje += cartasJugador[i].valorEnvido();
		}
		puntaje += 20;
		
		return puntaje;
	}
		
	_valorEnvido(cartasJugador){
		
		let cartasMismoPalo = [];
		if (cartasJugador[0].palo == cartasJugador[1].palo) {
			cartasMismoPalo.push(cartasJugador[0]);
			cartasMismoPalo.push(cartasJugador[1]);
			if (cartasJugador[0].palo == cartasJugador[2].palo){
				cartasMismoPalo.push(cartasJugador[2]);
			}
		}
		else if (cartasJugador[0].palo == cartasJugador[2].palo){
			cartasMismoPalo.push(cartasJugador[0]);
			cartasMismoPalo.push(cartasJugador[2]);
		}
		else if (cartasJugador[1].palo == cartasJugador[2].palo){
			cartasMismoPalo.push(cartasJugador[1]);
			cartasMismoPalo.push(cartasJugador[2]);
		}		
		else{
			//Buscamos la carta de valor mas alta.
			let iCartaMasAlta;
			let valorMasAlto = 0;
			for (let i = 0; i < cartasJugador.length; i++){
				if (cartasJugador[i].valorEnvido() > valorMasAlto){
					valorMasAlto = cartasJugador[i].valorEnvido();
					iCartaMasAlta = i;
				}
			}
			cartasMismoPalo.push(cartasJugador[iCartaMasAlta]);
		}
		
		
		//Si tenia flor y no canto, evito que sume mal los puntos del envido
		if (cartasMismoPalo.length > 2) {
			cartasMismoPalo = cartasMismoPalo.sort(function(a, b) { return a.valorEnvido() - b.valorEnvido()});
			cartasMismoPalo.shift(); 
		}
		
		let puntaje = 0;
		for (let i = 0; i < cartasMismoPalo.length; i++){
			puntaje += cartasMismoPalo[i].valorEnvido();
		}
		if (cartasMismoPalo.length > 1) puntaje += 20;
		
		return puntaje;
	}
	
	_getApuestasDisponibles(){
		
		let apuestas = [];
		for (let i = 0; i < matrizApuestas[this.iApuestaActual].length; i++){
			if (! (matrizApuestas[this.iApuestaActual][i] === '')){
				
				let apuesta = ColeccionApuestas[i];
				
				if (apuesta.opciones.tipo == eTipoApuesta.ENVIDO && this.iRondaActual != '') continue; //Solo puede cantarse envido en la primer ronda
				if (apuesta.opciones.tipo == eTipoApuesta.ENVIDO && this.bYaSeDisputoEnvidoFlor) continue; //No puede cantarse envido si ya se jugo
				if (apuesta.codigo == 10 && (this.iIniciadorTruco%2 == this.iJugadorActual%2)) continue; //Si es el que inicio el truco no puede cantar el siguiente
				if (apuesta.codigo == 11 && (this.iIniciadorTruco%2 != this.iJugadorActual%2)) continue;
				if (apuesta.opciones.tipo == eTipoApuesta.FLOR && !this._tieneFlor(this.iJugadorActual)) continue; //Si no se juega con flor, no estan disponibles las opciones, y si ya tiro una carta no puede cantar flor
				if (apuesta.opciones.tipo == eTipoApuesta.FLOR && this.bYaSeDisputoEnvidoFlor) continue; //No puede cantarse envido si ya se jugo
				if (apuesta.opciones.tipo == eTipoApuesta.FLOR && !this._conFlor) continue; //Si no se juega con flor, no se puede cantar
				
				
				apuestas.push(apuesta);
			}
		}
		
		return apuestas;
		
	}
	
	_getPuntajeApuestas(apuestas){
		
		let puntaje = 0;
		
		//Tratamiento de la falta
		for (let i = 0; i < apuestas.length - 1; i++){
			if ((apuestas[i] == 4 && apuestas[i + 1] == 6) || ((apuestas[i] == 18 && apuestas[i + 1] == 19))){ //Se cantó la falta
				
				let iJugadorMayoPuntaje;
				let mayorPuntaje = 0;
				for (let j = 0; j < this.jugadores.length; j++){ // Buscamos el jugador con mas puntaje
					let puntaje = this.jugadores[j].puntajeMalas + this.jugadores[j].puntajeBuenas;
					if (puntaje > mayorPuntaje) {
						mayorPuntaje = puntaje;
						iJugadorMayoPuntaje = j;
					}
				}
				if (mayorPuntaje > PUNTOS_MALAS) { //Si un jugador esta en buenas
					puntaje = PUNTOS_BUENAS - ( mayorPuntaje - PUNTOS_MALAS);
				}
				else{
					puntaje = PUNTOS_MALAS + PUNTOS_BUENAS;
				}
				return puntaje;
			}
		}
		
		
		
		for (let i = 0; i < apuestas.length - 1; i++){
			puntaje += matrizApuestas[apuestas[i]][apuestas[i + 1]];
		}
		return puntaje;
		
	}	
	
	
}

	// Funcion Recursiva
	// [ArrayCartas] -> [IndiceJugadorMayorCarta]
	// (array) -> ([int])
function iJugadoresConCartaMayorPuntaje(arrayCartas, iJugadorAnalizado){
		
	//Valores por defecto
	if (iJugadorAnalizado == null) iJugadorAnalizado = 0;
	
	
	let respuesta;
	
	if (iJugadorAnalizado == arrayCartas.length - 1){ //Caso Base
		respuesta = [iJugadorAnalizado];
	}
	else{
	
		let jugadoresConMayorPuntaje = iJugadoresConCartaMayorPuntaje(arrayCartas, iJugadorAnalizado + 1);
		
		if (arrayCartas[iJugadorAnalizado].power > arrayCartas[jugadoresConMayorPuntaje[0]].power){
			respuesta = [iJugadorAnalizado];
		}
		else if (arrayCartas[iJugadorAnalizado].power == arrayCartas[jugadoresConMayorPuntaje[0]].power){
			jugadoresConMayorPuntaje.push(iJugadorAnalizado);
			respuesta = jugadoresConMayorPuntaje;
		}
		else{
			respuesta = jugadoresConMayorPuntaje;
		}
		
	}
	
	return respuesta;
		
};
	

class Jugador {
	constructor (nombre){
		this.nombre = nombre;
		this.cartas = [];
		this.puntajeBuenas = 0;
		this.puntajeMalas = 0;
	}
	
	agregarPuntaje(puntaje){
		this.puntajeMalas += puntaje;
		if (this.puntajeMalas > PUNTOS_MALAS) {
			this.puntajeBuenas += (this.puntajeMalas - PUNTOS_MALAS);
			this.puntajeMalas = 15;
		}
		if (this.puntajeBuenas >= PUNTOS_BUENAS) return true;
	}
	
}


var ePalos = {
	ESPADAS: 1,
	BASTOS: 2,
	COPAS: 3,
	OROS: 4,
	getText: function(ePalo){
		switch (ePalo){
			case ePalos.ESPADAS:
				return "Espadas";
				break;
			case ePalos.BASTOS:
				return "Bastos";
				break;
			case ePalos.COPAS:
				return "Copas";
				break;
			case ePalos.OROS:
				return "Oros";
				break;
		}
	}
}

//Funcion de cartas
var getCartaDescription = function (){
	return this.number + " de " + ePalos.getText(this.palo);
}
//Funcion de cartas
var getCartaValorParaEnvido = function(){
	let valor = 0;
	if (this.number < 10){
		valor = this.number;
	}
	return valor;
}


var cartas = [
{number: 1, palo: ePalos.ESPADAS, power: 20, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},
{number: 1, palo: ePalos.BASTOS, power: 19, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},
{number: 7, palo: ePalos.ESPADAS, power: 18, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},
{number: 7, palo: ePalos.OROS, power: 17, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},
{number: 3, palo: ePalos.OROS, power: 16, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 3, palo: ePalos.COPAS, power: 16, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 3, palo: ePalos.BASTOS, power: 16, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 3, palo: ePalos.ESPADAS, power: 16, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},
{number: 2, palo: ePalos.OROS, power: 15, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 2, palo: ePalos.COPAS, power: 15, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 2, palo: ePalos.BASTOS, power: 15, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 2, palo: ePalos.ESPADAS, power: 15, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},
{number: 1, palo: ePalos.OROS, power: 14, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 1, palo: ePalos.COPAS, power: 14, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},
{number: 12, palo: ePalos.OROS, power: 13, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 12, palo: ePalos.COPAS, power: 13, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 12, palo: ePalos.BASTOS, power: 13, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 12, palo: ePalos.ESPADAS, power: 13, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},
{number: 11, palo: ePalos.OROS, power: 12, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 11, palo: ePalos.COPAS, power: 12, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 11, palo: ePalos.BASTOS, power: 12, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 11, palo: ePalos.ESPADAS, power: 12, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},
{number: 10, palo: ePalos.OROS, power: 11, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 10, palo: ePalos.COPAS, power: 11, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 10, palo: ePalos.BASTOS, power: 11, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 10, palo: ePalos.ESPADAS, power: 11, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},
{number: 7, palo: ePalos.BASTOS, power: 10, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 7, palo: ePalos.COPAS, power: 10, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},
{number: 6, palo: ePalos.OROS, power: 9, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 6, palo: ePalos.COPAS, power: 9, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 6, palo: ePalos.BASTOS, power: 9, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 6, palo: ePalos.ESPADAS, power: 9, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},
{number: 5, palo: ePalos.OROS, power: 8, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 5, palo: ePalos.COPAS, power: 8, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 5, palo: ePalos.BASTOS, power: 8, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 5, palo: ePalos.ESPADAS, power: 8, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},
{number: 4, palo: ePalos.OROS, power: 7, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 4, palo: ePalos.COPAS, power: 7, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 4, palo: ePalos.BASTOS, power: 7, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido},{number: 4, palo: ePalos.ESPADAS, power: 7, toTexto: getCartaDescription, valorEnvido: getCartaValorParaEnvido}
];

var eFinal = {
	PERDIO:0,
	GANO:1	
}

var eResultado = {
	PERDIO: 0,
	GANO: 1,
	EMPATE: 2
};

var matrizResultados = [];
for (let i = 0; i < 3; i++){
	matrizResultados[i] = [];
	for (let j = 0; j < 3; j++){
		matrizResultados[i][j] = [];
		for (let k = 0; k < 3; k++){
			matrizResultados[i][j][k] = [];
		}
	}
}
matrizResultados[eResultado.GANO][eResultado.GANO] = eFinal.GANO;	
matrizResultados[eResultado.GANO][eResultado.EMPATE] = eFinal.GANO;	
matrizResultados[eResultado.GANO][eResultado.PERDIO][eResultado.GANO] = eFinal.GANO;
matrizResultados[eResultado.GANO][eResultado.PERDIO][eResultado.EMPATE] = eFinal.GANO;
matrizResultados[eResultado.GANO][eResultado.PERDIO][eResultado.PERDIO] = eFinal.PERDIO;
matrizResultados[eResultado.EMPATE][eResultado.GANO] = eFinal.GANO;
matrizResultados[eResultado.EMPATE][eResultado.EMPATE][eResultado.GANO] = eFinal.GANO;
matrizResultados[eResultado.EMPATE][eResultado.EMPATE][eResultado.EMPATE] = eFinal.GANO;
matrizResultados[eResultado.EMPATE][eResultado.EMPATE][eResultado.PERDIO] = eFinal.PERDIO;
matrizResultados[eResultado.EMPATE][eResultado.PERDIO] = eFinal.PERDIO;
matrizResultados[eResultado.PERDIO][eResultado.GANO][eResultado.GANO] = eFinal.GANO;
matrizResultados[eResultado.PERDIO][eResultado.GANO][eResultado.EMPATE] = eFinal.PERDIO;
matrizResultados[eResultado.PERDIO][eResultado.GANO][eResultado.PERDIO] = eFinal.PERDIO;
matrizResultados[eResultado.PERDIO][eResultado.EMPATE] = eFinal.PERDIO;
matrizResultados[eResultado.PERDIO][eResultado.PERDIO] = eFinal.PERDIO;


PUNTOS_MALAS = 15;
PUNTOS_BUENAS = 15;

class Apuesta {
	constructor (codigo, descripcion, opciones){
		this.codigo = codigo;
		this.descripcion = descripcion;
		this.opciones = opciones;
	}
}

var eTipoApuesta = {
	TRUCO: 1,
	ENVIDO: 2,
	FLOR: 3
}

class OpcionesApuestas {
	constructor (tipo, esperaRespuesta, dadoPorVencido){
		this.tipo = tipo;
		this.esperaRespuesta = esperaRespuesta;
		this.dadoPorVencido = dadoPorVencido;
	}
}
var opcionesEnvido = new OpcionesApuestas(eTipoApuesta.ENVIDO, true, false);
var opcionesTruco = new OpcionesApuestas(eTipoApuesta.TRUCO, true, false);
var opcionesFlor = new OpcionesApuestas(eTipoApuesta.FLOR, true, false);

var ColeccionApuestas = {
	'1': new Apuesta(1,'Envido', opcionesEnvido),
	'2': new Apuesta(2,'Envido', opcionesEnvido), //El segundo canto de envido
	'3': new Apuesta(3,'Real Envido', opcionesEnvido),
	'4': new Apuesta(4,'Falta Envido', opcionesEnvido),
	'5': new Apuesta(5,'No Quiero', new OpcionesApuestas(eTipoApuesta.ENVIDO, false, true)),// del envido
	'6': new Apuesta(6,'Quiero', new OpcionesApuestas(eTipoApuesta.ENVIDO, false, false)),// del envido
	'7': new Apuesta(7,'Son Buenas', opcionesEnvido),
	'8': new Apuesta(8,'Son Mejores', opcionesEnvido),
	'9': new Apuesta(9,'Truco', opcionesTruco),
	'10': new Apuesta(10,'Retruco', opcionesTruco),
	'11': new Apuesta(11,'Vale Cuatro', opcionesTruco),
	'12': new Apuesta(12,'Quiero', new OpcionesApuestas(eTipoApuesta.TRUCO, false, false)),// Truco
	'13': new Apuesta(13,'Quiero', new OpcionesApuestas(eTipoApuesta.TRUCO, false, false)),// Retruco
	'14': new Apuesta(14,'Quiero', new OpcionesApuestas(eTipoApuesta.TRUCO, false, false)),// Vale Cuatro
	'15': new Apuesta(15,'No Quiero', new OpcionesApuestas(eTipoApuesta.TRUCO, false, true)), //
	'16': new Apuesta(16,'Flor', opcionesFlor),
	'17': new Apuesta(17,'Contraflor', opcionesFlor),
	'18': new Apuesta(18,'Contraflor al resto', opcionesFlor),
	'19': new Apuesta(19,'Quiero', new OpcionesApuestas(eTipoApuesta.FLOR, false, false)),
	'20': new Apuesta(20,'No Quiero', new OpcionesApuestas(eTipoApuesta.FLOR, false, true))
}

//Carga de matriz de adyacencias
var matrizApuestas = [];
//						0	1	2	3	4	5	6	7	8	9	10	11	12	13	14	15	16	17	18	19	20
matrizApuestas[0] = [	'',	1,	'',	1,	1,	'',	'',	'',	'',	1,	'',	'',	'',	'',	'',	'',	3,	'',	'',	'',	''];
matrizApuestas[1] = [	'',	'',	1,	1,	1,	0,	1,	'',	'',	'',	'',	'',	'',	'',	'',	'',	2,	'',	'',	'',	''];
matrizApuestas[2] = [	'',	'',	'',	2,	2,	0,	2,	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	''];
matrizApuestas[3] = [	'',	'',	'',	'',	3,	0,	3,	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	''];
matrizApuestas[4] = [	'',	'',	'',	'',	'',	0,	5,	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	''];
matrizApuestas[5] = [	'',	'',	'',	'',	'',	'',	'',	'',	'',	1,	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	''];
matrizApuestas[6] = [	'',	'',	'',	'',	'',	'',	'',	'',	'',	1,	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	''];
matrizApuestas[7] = [	'',	'',	'',	'',	'',	'',	'',	'',	'',	1,	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	''];
matrizApuestas[8] = [	'',	'',	'',	'',	'',	'',	'',	'',	'',	1,	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	''];
matrizApuestas[9] = [	'',	1,	'',	1,	1,	'',	'',	'',	'',	'',	1,	'',	1,	'',	'',	0,	3,	'',	'',	'',	''];
matrizApuestas[10] = [	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	1,	'',	1,	'',	0,	'',	'',	'',	'',	''];
matrizApuestas[11] = [	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	1,	0,	'',	'',	'',	'',	''];
matrizApuestas[12] = [	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	0,	'',	'',	'',	'',	'',	'',	'',	'',	'',	''];
matrizApuestas[13] = [	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	0,	'',	'',	'',	'',	'',	'',	'',	'',	''];
matrizApuestas[14] = [	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	''];
matrizApuestas[15] = [	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	''];
matrizApuestas[16] = [	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	1,	1,	1,	0];
matrizApuestas[17] = [	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	2,	2,	0];
matrizApuestas[18] = [	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	5,	0];
matrizApuestas[19] = [	'',	'',	'',	'',	'',	'',	'',	'',	'',	1,	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	''];
matrizApuestas[20] = [	'',	'',	'',	'',	'',	'',	'',	'',	'',	1,	'',	'',	'',	'',	'',	'',	'',	'',	'',	'',	''];

var _jugadores = [];
var juego;
var _iniciadoJuego = false;
var _jugarConFlor = false;

function IngresarJugador(mailJugador){
	
	if (_iniciadoJuego) return;
	
	if (_jugadores.length == 2) {
		console.log('No se permiten mas jugadores.');
	}
	if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(mailJugador)){
		_jugadores.push(mailJugador.replace(/@.*/,''));
		console.log('Jugador ingresado correctamente');
	}
	else {
		console.log('No es una direccion de email válida, ingrese nuevamente.');
	}
	if (_jugadores.length == 1) console.log("Ahora falta solo un jugador.");
	
	if (_jugadores.length == 2) {
		juego = new Juego(_jugadores[0], _jugadores[1]);
		_iniciadoJuego = true;
	}
}

function JugarConFlor(){
	
	if (_iniciadoJuego) return;
	
	_jugarConFlor = true;
	console.log("Jugando con Flor");
	console.log("");
	console.log('Para poder jugar, necesito ingreses el mail de los dos jugadores, para poder identificarlos.');
	console.log('');
	console.log('Para ingresar los jugadores utiliza el metodo \'IngresarJugador()\'');
}

function JugarSinFlor(){
	
	if (_iniciadoJuego) return;
	
	_jugarConFlor = false;
	console.log("Jugando con Flor");
	console.log("");
	console.log('Para poder jugar, necesito ingreses el mail de los dos jugadores, para poder identificarlos.');
	console.log('');
	console.log('Para ingresar los jugadores utiliza el metodo IngresarJugador()');
}

/******* INICIO ****/

console.log('Bienvenido a Truco para dos Personas.');
console.log('¿Desean jugar con flor? Indicamelo con el metodo \'JugarConFlor()\' o \'JugarSinFlor()\'');






	




