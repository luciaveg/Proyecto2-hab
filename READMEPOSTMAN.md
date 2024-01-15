Pasos para la ejecucion:

1.- Instalar las dependencias necesarias con: npm install
2.- Crear la Base de Datos y Tablas con: node src/db/create-db.js 
3.- correr la aplicacion con: npm run dev
4.-

"/register/:id" => PUT Para registrarse con Nombre, email y password

"/login" => POST Para logearse

"/news" => POST Para publicar una news

"/news" => GET Para ver la Noticias ordenadas por fecha de creacion

"/news?today" => GET Para ver las Noticias del dia

"/news?theme?" => GET Para ver Noticias de un tema especifico

/news/:id => GET Para ver una Noticia en especifico

"/themes" => GET Para ver las Noticias por tema especifico

/delete/news/:id => Para Borrar alguna Noticia (Solo si el mismo usuario la ha creado)




FALLAS

Requisitos que no se cumplen:
-Las respuestan deben ser siempre en JSON, Incluso los mensajes de información y errores (característica de las API Rest)
-Algunas peticiones de la colección están sin completar.
-No soy capaz de probar el endpoint para crear noticias (por problemas en la autenticación), pero viendo el código está claro que no funciona, ya que no hace petición a la BBDD
-Las peticiones para editar o borrar una noticia, tampoco contactan con la BBDD


-Errores que dan problemas:
-Errores al intentar crear la BBDD:
variable "db" repetida
connectDB no está definido (entiendo que el primer db debería ser connectDB)
(Despues de corregir lo anterior...) connectDB no es una función (es directamente la conexión, no hay que llamarla)
-No se puede acceder a db antes de inicializalo (dentro de la función se crea otra variable db, pero antes se intenta usar la de fuera, no se puede)
-Borra la BBDD, la crea y la vuelve a borrar. Luego da error poque no existe
-Como la conexión ya se hace a la BBDD, si se borra, da error y no la puede volver a crear (hay que borrar las tablas, no la bbdd)
-Error sin gestionar si se intenta registrar un usuario dos veces (tira el servidor).
-Error al intentar hacer una publicación: bearerToken no está definido.
-La petición para buscar por el día de hoy solo busca noticias creadas en el momento exacto de la búsqueda (incluido el segundo concreto). Además, la query (interrogación en la ruta) no se usa así y si no hay noticias sería error 404, no 500.
-La petición para buscar por tema hace la misma petición de la fecha, y tiene los mismos problemas.
-Hay un middleware que pide siempre todas las noticias, no tiene sentido
-El endpoint para listar noticias, en lugar de pedirlas a la BBDD, las coge del middleware anterior, no tiene sentido.
-Hay muchos más problemas, pero el código es demasiado sucio para verlo bien.
-Otro problemillas/posibles mejoras:
-Estaría bien que el readme incluyese instrucciones de cómo arrancar el proyecto (y estuviese un poco más bonito).
-Código sucio: está prácticamente todo en app.js
-Se supone que el token lo debe validar el middleware verifyToken y no cada controlador.
-Os explico un poco los apartados...
-Requisitos que no se cumplen = es necesario solucionarlo simplemente porque es obligatorio para el apto
-Errores que dan problemas = creo que es bastante descriptivo, vais a tener que solucionarlo para que la app funcione correctamente
-Otros problemillas/posibles mejoras = algunas cosas que estaría bien cambiar o que os pueden venir bien para el front, pero es decisión vuestra si dedicarle tiempo o no
-Claramente el proyecto no está apto. Os recomiendo que vayais pidiendo tutoría para arreglar el backend y que lo vayáis intentando corregir hasta ese momento (si no empezasteis ya) porque si no, no va a funcionar para que podáis hacer el frontend...