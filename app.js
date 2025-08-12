// app.js - CÓDIGO CORREGIDO Y COMPLETO

// Variables globales
let bibliaData = {};
let librosBiblia = [];
let libroActual = "Génesis";
let capituloActual = 1;
let versiculoActual = 1;
let speakingContext = "capitulo";
let wakeLock = null;

// Función para solicitar un bloqueo de pantalla
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Bloqueo de pantalla activo.');
        }
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
}

// Función para liberar el bloqueo de pantalla
function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release();
        wakeLock = null;
        console.log('Bloqueo de pantalla liberado.');
    }
}


// Elementos del DOM
let referenceBtn;
let verseTextBtn;
let citaBiblicaElemento;
let versiculoTextoElemento;
let capituloAnteriorBtn;
let capituloSiguienteBtn;
let versiculoAnteriorBtn;
let versiculoSiguienteBtn;

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
            console.log('Service Worker registered: ', registration);
        })
        .catch(error => {
            console.log('Service Worker registration failed: ', error);
        });
    });
}

// Sintetizador de voz
const synth = window.speechSynthesis;
const utterThis = new SpeechSynthesisUtterance();

// Función para cargar los datos de la Biblia desde un archivo JSON
async function loadBibliaData() {
    try {
        const response = await fetch('biblia.json');
        const data = await response.json();
        bibliaData = data.biblia_data;
        librosBiblia = data.libros_biblia_espanol;
        console.log("Datos de la Biblia cargados correctamente.");
        mostrarVersiculoActual();
    } catch (error) {
        console.error("Error al cargar la Biblia:", error);
        if(versiculoTextoElemento) versiculoTextoElemento.textContent = "Error al cargar los datos de la Biblia.";
    }
}

// Función para leer un texto con efecto karaoke
function leerConKaraoke(textoCompleto, onEndCallback) {
    if (synth.speaking) {
        synth.cancel();
    }
    
    const palabras = textoCompleto.split(/\s+/).filter(word => word.length > 0);
    const textoHTML = palabras.map(word => `<span class="word-span">${word}</span>`).join(' ');
    
    if (versiculoTextoElemento) {
        versiculoTextoElemento.innerHTML = textoHTML;
    }
    
    const palabraSpans = document.querySelectorAll('#verse-text .word-span');
    let palabraIndex = 0;
    
    utterThis.text = textoCompleto;
    utterThis.lang = 'es-ES';
    utterThis.rate = 0.9;
    utterThis.pitch = 1.0;
    
    utterThis.onboundary = (event) => {
        if (event.name === 'word') {
            if (palabraIndex > 0) {
                palabraSpans[palabraIndex - 1].classList.remove('highlight');
            }
            if (palabraIndex < palabraSpans.length) {
                palabraSpans[palabraIndex].classList.add('highlight');
                palabraIndex++;
            }
        }
    };
    
    utterThis.onend = () => {
        if(palabraSpans.length > 0) {
            palabraSpans.forEach(span => span.classList.remove('highlight'));
        }
        if(onEndCallback) onEndCallback();
    };
    
    synth.speak(utterThis);
}

// Función para mostrar el versículo actual sin leerlo
function mostrarVersiculoActual() {
    const libro = bibliaData?.[libroActual];
    if (!libro || !libro?.[capituloActual] || !libro?.[capituloActual]?.[versiculoActual]) {
        return;
    }
    const textoVersiculo = libro[capituloActual][versiculoActual];
    if (citaBiblicaElemento) citaBiblicaElemento.textContent = `${libroActual} ${capituloActual}:${versiculoActual}`;
    if (versiculoTextoElemento) {
        versiculoTextoElemento.innerHTML = `<p class="verse-text-line"><b>${versiculoActual}.</b> ${textoVersiculo}</p>`;
    }
}

function leerVersiculoActual() {
    speakingContext = "versiculo";
    if (synth.speaking) {
        synth.cancel();
    }
    const libro = bibliaData?.[libroActual];
    if (!libro || !libro?.[capituloActual] || !libro?.[capituloActual]?.[versiculoActual]) {
        return;
    }
    const textoVersiculo = libro[capituloActual][versiculoActual];
    if (citaBiblicaElemento) citaBiblicaElemento.textContent = `${libroActual} ${capituloActual}:${versiculoActual}`;
    const textoAnuncio = `Libro de ${libroActual}, capítulo ${capituloActual}, versículo ${versiculoActual}. `;

    requestWakeLock(); // Solicita el bloqueo al iniciar la lectura

    leerConKaraoke(textoAnuncio + textoVersiculo, () => {
        console.log("Lectura del versículo completa.");
        releaseWakeLock(); // Libera el bloqueo al finalizar
    });
}

function leerCapituloCompleto() {
    speakingContext = "capitulo";
    if (synth.speaking) {
        synth.cancel();
    }
    const libro = bibliaData?.[libroActual];
    if (!libro || !libro?.[capituloActual]) {
        return;
    }
    const capitulo = libro[capituloActual];
    const textoCompleto = Object.keys(capitulo).map(num => `${num}. ${capitulo[num]}`).join(' ');

    if (citaBiblicaElemento) citaBiblicaElemento.textContent = `${libroActual} ${capituloActual}`;

    const textoVisualHTML = Object.keys(capitulo).map(num => `<p class="verse-text-line"><b>${num}.</b> ${capitulo[num]}</p>`).join('');
    if (versiculoTextoElemento) {
        versiculoTextoElemento.innerHTML = textoVisualHTML;
    }

    requestWakeLock(); // Solicita el bloqueo al iniciar la lectura

    const textoAnuncio = `Libro de ${libroActual}, capítulo ${capituloActual}. `;
    leerConKaraoke(textoAnuncio + textoCompleto, () => {
        console.log("Lectura del capítulo completa.");
        releaseWakeLock(); // Libera el bloqueo al finalizar
    });
}

function leerLibroCompleto() {
    speakingContext = "libro";
    if (synth.speaking) {
        synth.cancel();
    }

    const libro = bibliaData?.[libroActual];
    if (!libro) {
        if (versiculoTextoElemento) versiculoTextoElemento.innerHTML = `El libro de ${libroActual} no existe.`;
        return;
    }

    requestWakeLock(); // Solicita el bloqueo al iniciar la lectura del libro

    const capitulos = Object.keys(libro).sort((a, b) => parseInt(a) - parseInt(b));
    let capituloIndex = 0;

    const leerSiguienteCapitulo = () => {
        if (capituloIndex < capitulos.length) {
            const numCapitulo = capitulos[capituloIndex];
            const capitulo = libro[numCapitulo];

            const textoCompletoCapitulo = Object.keys(capitulo).map(num => `${num}. ${capitulo[num]}`).join(' ');

            if (citaBiblicaElemento) citaBiblicaElemento.textContent = `${libroActual} ${numCapitulo}`;

            const textoVisualHTML = Object.keys(capitulo).map(num => `<p class="verse-text-line"><b>${num}.</b> ${capitulo[num]}</p>`).join('');
            if (versiculoTextoElemento) {
                versiculoTextoElemento.innerHTML = textoVisualHTML;
            }

            const textoAnuncio = `Libro de ${libroActual}, capítulo ${numCapitulo}. `;
            leerConKaraoke(textoAnuncio + textoCompletoCapitulo, () => {
                capituloIndex++;
                leerSiguienteCapitulo();
            });
        } else {
            console.log("Lectura del libro completa.");
            releaseWakeLock(); // Libera el bloqueo solo cuando el libro entero haya terminado
        }
    };

    leerSiguienteCapitulo();
}

// Funciones de navegación
function nextVersiculo() {
    const capitulo = bibliaData?.[libroActual]?.[capituloActual];
    if (capitulo && versiculoActual < Object.keys(capitulo).length) {
        versiculoActual++;
    } else {
        nextCapitulo();
        return;
    }
    leerVersiculoActual();
}

function prevVersiculo() {
    if (versiculoActual > 1) {
        versiculoActual--;
    } else {
        prevCapitulo();
        return;
    }
    leerVersiculoActual();
}

function nextCapitulo() {
    const capitulos = bibliaData?.[libroActual];
    if (capitulos && capituloActual < Object.keys(capitulos).length) {
        capituloActual++;
        versiculoActual = 1;
    } else {
        const libroIndex = librosBiblia.indexOf(libroActual);
        if (libroIndex < librosBiblia.length - 1) {
            libroActual = librosBiblia?.[libroIndex + 1];
            capituloActual = 1;
            versiculoActual = 1;
        }
    }
    if (citaBiblicaElemento) citaBiblicaElemento.textContent = `${libroActual} ${capituloActual}`;
    leerCapituloCompleto();
}

function prevCapitulo() {
    if (capituloActual > 1) {
        capituloActual--;
        versiculoActual = Object.keys(bibliaData?.[libroActual]?.[capituloActual]).length;
    } else {
        const libroIndex = librosBiblia.indexOf(libroActual);
        if (libroIndex > 0) {
            libroActual = librosBiblia?.[libroIndex - 1];
            capituloActual = Object.keys(bibliaData?.[libroActual]).length;
            versiculoActual = Object.keys(bibliaData?.[libroActual]?.[capituloActual]).length;
        }
    }
    if (citaBiblicaElemento) citaBiblicaElemento.textContent = `${libroActual} ${capituloActual}`;
    leerCapituloCompleto();
}

function convertirNumerosEnTexto(texto) {
    const numeros = {
        'uno': '1', 'dos': '2', 'tres': '3', 'cuatro': '4', 'cinco': '5',
        'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9', 'diez': '10',
        'once': '11', 'doce': '12', 'trece': '13', 'catorce': '14', 'quince': '15',
        'dieciséis': '16', 'diecisiete': '17', 'dieciocho': '18', 'diecinueve': '19', 'veinte': '20'
    };

    let palabras = texto.split(' ');
    for (let i = 0; i < palabras.length; i++) {
        const palabra = palabras[i].toLowerCase();
        if (numeros?.[palabra]) {
            palabras[i] = numeros[palabra];
        }
    }
    return palabras.join(' ');
}

const libroVariaciones = {
    "1 Samuel": ["primero samuel", "uno samuel", "primero de samuel", "1 samuel"],
    "2 Samuel": ["segundo samuel", "dos samuel", "segundo de samuel", "2 samuel"],
    "1 Reyes": ["primero reyes", "uno reyes", "primero de reyes", "1 reyes"],
    "2 Reyes": ["segundo reyes", "dos reyes", "segundo de reyes", "2 reyes"],
    "1 Crónicas": ["primero crónicas", "uno crónicas", "primero de crónicas", "1 crónicas"],
    "2 Crónicas": ["segundo crónicas", "dos crónicas", "segundo de crónicas", "2 crónicas"],
    "1 Corintios": ["primero corintios", "uno corintios", "primero de corintios", "1 corintios"],
    "2 Corintios": ["segundo corintios", "dos corintios", "segundo de corintios", "2 corintios"],
    "1 Tesalonicenses": ["primero tesalonicenses", "uno tesalonicenses", "1 tesalonicenses"],
    "2 Tesalonicenses": ["segundo tesalonicenses", "dos tesalonicenses", "2 tesalonicenses"],
    "1 Timoteo": ["primero timoteo", "uno timoteo", "primero de timoteo", "1 timoteo"],
    "2 Timoteo": ["segundo timoteo", "dos timoteo", "segundo de timoteo", "2 timoteo"],
    "1 Pedro": ["primero pedro", "uno pedro", "primero de pedro", "1 pedro"],
    "2 Pedro": ["segundo pedro", "dos pedro", "segundo de pedro", "2 pedro"],
    "1 Juan": ["primero juan", "uno juan", "primero de juan", "1 juan", "1", "primero", "un ojón"],
    "2 Juan": ["segundo juan", "dos juan", "segundo de juan", "2 juan", "2", "segundo"],
    "3 Juan": ["tercero juan", "tres juan", "tercero de juan", "3 juan", "3", "tercero"],
    "Génesis": ["génesis"],
    "Éxodo": ["éxodo"],
    "Levítico": ["levítico"],
    "Números": ["números"],
    "Deuteronomio": ["deuteronomio"],
    "Josué": ["josué"],
    "Jueces": ["jueces"],
    "Rut": ["rut", "ruta"],
    "Esdras": ["esdras", "es dra", "ezdra", "esdraft", "ezdras", "leer edra", " edran"],
    "Nehemías": ["nehemías"],
    "Ester": ["ester", "espera", "esther", "estera"],
    "Job": ["job", "j o b", "j o p", "jobe"],
    "Salmos": ["salmos"],
    "Proverbios": ["proverbios"],
    "Eclesiastés": ["eclesiastés"],
    "Cantares": ["cantares"],
    "Isaías": ["isaías"],
    "Jeremías": ["jeremías"],
    "Lamentaciones": ["lamentaciones"],
    "Ezequiel": ["ezequiel"],
    "Daniel": ["daniel"],
    "Oseas": ["oseas", "osea", "oses", "o seas", "océas", "óseos", "leer oso"],
    "Joel": ["joel"],
    "Amós": ["amós", "amos", "a mos", " amoos", "amoso", "amor"],
    "Abdías": ["abdías", "abdi", "a días", "abdía", "leer habia", "habría"],
    "Jonás": ["jonás"],
    "Miqueas": ["miqueas"],
    "Nahúm": ["nahúm", "naún", "nahun", "naum", "nau", "leer na"],
    "Habacuc": ["habacuc", "abacuc", "ábaco", "abacu"],
    "Sofonías": ["sofonías"],
    "Hageo": ["ajeno", "hageo", "ajeo", "a geo"],
    "Zacarías": ["zacarías"],
    "Malaquías": ["malaquías"],
    "Mateo": ["mateo"],
    "Marcos": ["marcos"],
    "Lucas": ["lucas"],
    "Juan": ["juan"],
    "Hechos": ["hechos"],
    "Romanos": ["romanos"],
    "Gálatas": ["gálatas"],
    "Efesios": ["efesios"],
    "Filipenses": ["filipenses"],
    "Colosenses": ["colosenses"],
    "Tito": ["tito"],
    "Filemón": ["filemón"],
    "Hebreos": ["hebreos"],
    "Santiago": ["santiago"],
    "Judas": ["judas"],
    "Apocalipsis": ["apocalipsis"]
};

// Reconocimiento de voz
function startSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Tu navegador no soporta el reconocimiento de voz. Por favor, usa Chrome.");
        return;
    }

    utterThis.onend = null;
    utterThis.onerror = null;
    utterThis.onboundary = null;

    if (synth.speaking) {
        synth.cancel();
    }
    
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    const greetingUtterance = new SpeechSynthesisUtterance("Hola, ¿Qué libro deseas que te lea hoy?");
    synth.speak(greetingUtterance);
    greetingUtterance.onend = () => recognition.start();
    
    let isWaitingForSecondPart = false;
    let firstPart = '';

    recognition.onresult = (event) => {
        let transcript = event.results?.[0]?.[0]?.transcript?.trim()?.toLowerCase();
        console.log('Transcripción original:', transcript);

        if (isWaitingForSecondPart) {
            transcript = firstPart + ' ' + transcript;
            isWaitingForSecondPart = false;
        }

        transcript = convertirNumerosEnTexto(transcript);
        console.log('Transcripción procesada:', transcript);

        let libroEncontrado = false;
        for (const libroCanonico in libroVariaciones) {
            const variaciones = libroVariaciones[libroCanonico];
            for (const variacion of variaciones) {
                if (transcript.includes(variacion) && (transcript.split(variacion)?.[0]?.trim() === '' || transcript.split(variacion)?.[0] === undefined)) {
                    libroActual = libroCanonico;
                    const partes = transcript.split(variacion)?.[1]?.trim()?.split(' ')?.filter(part => !isNaN(parseInt(part)));

                    if (partes?.length === 2) {
                        capituloActual = parseInt(partes[0]);
                        versiculoActual = parseInt(partes[1]);
                        leerVersiculoActual();
                    } else if (partes?.length === 1) {
                        capituloActual = parseInt(partes[0]);
                        versiculoActual = 1;
                        leerCapituloCompleto();
                    } else {
                        capituloActual = 1;
                        versiculoActual = 1;
                        leerLibroCompleto();
                    }

                    libroEncontrado = true;
                    break;
                }
            }
            if (libroEncontrado) break;
        }
        
        if (!libroEncontrado) {
            if (transcript === '1' || transcript === 'primero') {
                firstPart = '1 Juan';
                isWaitingForSecondPart = true;
            } else if (transcript === '2' || transcript === 'segundo') {
                firstPart = '2 Juan';
                isWaitingForSecondPart = true;
            } else if (transcript === '3' || transcript === 'tercero') {
                firstPart = '3 Juan';
                isWaitingForSecondPart = true;
            } else if (transcript?.includes("siguiente versículo") || transcript?.includes("próximo versículo")) {
                nextVersiculo();
            } else if (transcript?.includes("versículo anterior")) {
                prevVersiculo();
            } else if (transcript?.includes("siguiente capítulo") || transcript?.includes("próximo capítulo")) {
                nextCapitulo();
            } else if (transcript?.includes("capítulo anterior")) {
                prevCapitulo();
            } else if (transcript?.includes("lee de nuevo")) {
                if(speakingContext === "capitulo") {
                    leerCapituloCompleto();
                } else if (speakingContext === "libro") {
                    leerLibroCompleto();
                } else if (speakingContext === "versiculo") {
                    leerVersiculoActual();
                }
            } else if (transcript?.includes("pausa")) {
                synth.pause();
            } else if (transcript?.includes("reanudar")) {
                synth.resume();
            } else {
                synth.speak(new SpeechSynthesisUtterance("Lo siento, no entendí ese comando."));
            }
        }
    };

    recognition.onend = () => {
        console.log('Reconocimiento de voz terminado.');
        if (isWaitingForSecondPart) {
            recognition.start();
        }
    };

    recognition.onerror = (event) => {
        console.error('Error en el reconocimiento de voz:', event.error);
    };
}


document.addEventListener('DOMContentLoaded', () => {
    // ASIGNACIÓN DE ELEMENTOS DEL DOM
    referenceBtn = document.getElementById('reference-btn');
    verseTextBtn = document.getElementById('verse-text-btn');
    citaBiblicaElemento = document.getElementById('reference');
    versiculoTextoElemento = document.getElementById('verse-text');
    capituloAnteriorBtn = document.getElementById('prev-chapter');
    capituloSiguienteBtn = document.getElementById('next-chapter');
    versiculoAnteriorBtn = document.getElementById('prev-verse');
    versiculoSiguienteBtn = document.getElementById('next-verse');
    
    // EVENT LISTENERS DE NAVEGACIÓN
    if (capituloAnteriorBtn) capituloAnteriorBtn.addEventListener('click', prevCapitulo);
    if (capituloSiguienteBtn) capituloSiguienteBtn.addEventListener('click', nextCapitulo);
    if (versiculoAnteriorBtn) versiculoAnteriorBtn.addEventListener('click', prevVersiculo);
    if (versiculoSiguienteBtn) versiculoSiguienteBtn.addEventListener('click', nextVersiculo);
    
    // EVENT LISTENERS PARA PAUSA/PLAY y COMANDO DE VOZ
    if (referenceBtn) {
        referenceBtn.addEventListener('click', () => {
            if (synth.speaking && !synth.paused) {
                synth.pause();
            } else if (synth.paused) {
                synth.resume();
            } else {
                leerCapituloCompleto();
            }
        });
    }

    if (verseTextBtn) {
        verseTextBtn.addEventListener('click', () => {
            if (synth.speaking) {
                synth.cancel();
            }
            startSpeechRecognition();
        });
    }

// Función para solicitar un bloqueo de pantalla
async function requestWakeLock() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        console.log('Bloqueo de pantalla activo.');
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
}


    loadBibliaData();
});