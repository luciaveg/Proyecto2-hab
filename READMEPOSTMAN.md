Pasos para la ejecucion:

1.- Instalar las dependencias necesarias con: npm install
2.- Crear la Base de Datos y Tablas con: node src/db/create-db.js 
3.- Arrancar el Servidor la aplicacion con: npm run dev


"/register" => POST Para registrarse con Nombre, email y password

"/login" => POST Para logearse

"/news" => POST Para publicar una news

"/news" => GET Para ver la Noticias ordenadas por fecha de creacion

"/news?theme?" => GET Para ver Noticias de un tema especifico

"/news/:id" => GET Para ver una Noticia en especifico

"/themes" => GET Para ver los distintos temas de Noticias que existen

"/news" => PUT Para Editar una Noticia en especifico

"/user/:id" => PUT Para ver la ficha de un usuario

"/news/:id/delete" => PUT Para Editar un Usuario

"/news/:id/vote" => POST Para dar voto LIKE

