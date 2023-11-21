<h1 class="nombre-pagina">olvide password</h1>
<p class="descripcion-pagina">Reestablecer tu password escribiendo tu mail a continuacion</p>

<?php include_once __DIR__ . "/../templates/alertas.php" ?>


<form action="/olvide" class="formulario" method="POST">
    <div class="campo">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" placeholder="Tu Email">
    </div>

    <input type="submit" class="boton" value="Enviar Instrucciones">

</form>

<div class="acciones">
    <a href="/crear-cuenta">¿No tienes una Cuenta? Crear una Cuenta</a>
    <a href="/">¿Tienes una Cuenta? Iniciar Sesión</a>
</div> 