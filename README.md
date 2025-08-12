📖 Biblia Accesible
Biblia Accesible es una aplicación web progresiva (PWA) diseñada para permitir la lectura y audición de la Biblia de manera sencilla e intuitiva. Su interfaz se adapta a dispositivos móviles y de escritorio, ofreciendo controles táctiles y de voz para una navegación sin esfuerzo.

✨ Características Principales
Lectura de Texto: Muestra el texto bíblico de forma clara y legible.

Audio (Text-to-Speech): Lee en voz alta capítulos o versículos completos.

Navegación Intuitiva:

Controles Táctiles: Botones en pantalla para moverte entre capítulos y versículos.

Comandos de Voz: Controla la aplicación con tu voz para una experiencia completamente manos libres.

Aplicación Web Progresiva (PWA): Se puede instalar en cualquier dispositivo (móvil, tablet, escritorio) y funciona sin conexión a Internet.

🚀 Cómo Usar la Aplicación
Navegación Táctil
La pantalla está dividida en áreas interactivas para la navegación:

Parte Superior: "Capítulo Anterior"

Parte Inferior: "Capítulo Siguiente"

Parte Izquierda: "Versículo Anterior"

Parte Derecha: "Versículo Siguiente"

Botón de Micrófono (Esquina Superior Derecha): Inicia el reconocimiento de voz.

Botón de Pausa/Reproducción (Esquina Superior Izquierda): Pausa o reanuda la lectura en voz alta.

Comandos de Voz
Para usar los comandos de voz, presiona el botón de micrófono en la esquina superior derecha y di una de las siguientes instrucciones:

Comando de Voz	Acción
"Génesis uno uno"	Lee el versículo 1 del capítulo 1 del libro de Génesis.
"Marcos cinco"	Lee el capítulo 5 del libro de Marcos completo.
"Siguiente versículo"	Avanza al siguiente versículo.
"Versículo anterior"	Retrocede al versículo anterior.
"Siguiente capítulo"	Avanza al siguiente capítulo.
"Capítulo anterior"	Retrocede al capítulo anterior.
"Lee de nuevo"	Repite la lectura del versículo o capítulo actual.
"Pausa"	Pausa la lectura en voz alta.
"Reanudar"	Reanuda la lectura que fue pausada.

Exportar a Hojas de cálculo
Nota para libros con números: Para libros como "1 Corintios", puedes usar los comandos "uno corintios", "primero corintios" o "1 corintios". Para el libro de Hageo, puedes decir "ajeno".

🛠️ Estructura del Proyecto
index.html: La estructura principal de la interfaz de usuario.

style.css: Los estilos y el diseño de la aplicación.

app.js: La lógica principal de la aplicación, incluyendo la navegación, el control de voz y la lectura.

manifest.json: Archivo de configuración para convertir la aplicación en una PWA.

service-worker.js: Script que permite el funcionamiento sin conexión y el caché de archivos.

biblia.json: Base de datos con el texto completo de la Biblia.

💻 Instalación y Ejecución
Para usar esta aplicación como una PWA, simplemente visita la URL en un navegador compatible (como Google Chrome) y busca la opción "Instalar aplicación" en el menú del navegador.

Para el desarrollo local, puedes abrir el archivo index.html en tu navegador. Para las funcionalidades de PWA (como el modo sin conexión), se recomienda usar un servidor web local con HTTPS.